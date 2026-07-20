#!/usr/bin/env node
/**
 * One-time / protected cleanup: remove Google Calendar attendees from future
 * Timea Skincare booking events so Google never emails customers.
 *
 * Usage:
 *   npm run calendar:cleanup-attendees -- --dry-run
 *   npm run calendar:cleanup-attendees -- --apply --confirm=REMOVE_OLD_BOOKING_ATTENDEES
 *
 * Requires env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN,
 * GOOGLE_CALENDAR_ID. Never logs customer PII.
 *
 * Phase A: run --dry-run only. Do not --apply without explicit approval.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const CONFIRM_PHRASE = "REMOVE_OLD_BOOKING_ATTENDEES";
const SOURCE = "timeaskincare-web";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    let value = trimmed.slice(eq + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  const args = {
    dryRun: true,
    apply: false,
    confirm: "",
    envFile: "",
  };
  for (const arg of argv) {
    if (arg === "--dry-run") {
      args.dryRun = true;
      args.apply = false;
    } else if (arg === "--apply") {
      args.apply = true;
      args.dryRun = false;
    } else if (arg.startsWith("--confirm=")) {
      args.confirm = arg.slice("--confirm=".length);
    } else if (arg.startsWith("--env-file=")) {
      args.envFile = arg.slice("--env-file=".length);
    }
  }
  return args;
}

function maskEventId(eventId) {
  let hash = 0;
  for (let i = 0; i < eventId.length; i += 1) {
    hash = (hash * 31 + eventId.charCodeAt(i)) >>> 0;
  }
  return `evt_${hash.toString(16).padStart(8, "0")}`;
}

function isAppManaged(event) {
  const privateData = event.extendedProperties?.private ?? {};
  if (privateData.source === SOURCE) return true;
  return Boolean(privateData.bookingKey && privateData.bookingKey.length >= 16);
}

function wallClock(event) {
  const dateTime = event.start?.dateTime;
  if (!dateTime) {
    return { date: event.start?.date ?? null, time: null };
  }
  const match = dateTime.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  return match ? { date: match[1], time: match[2] } : { date: null, time: null };
}

function logSafe(payload) {
  console.log(
    JSON.stringify({
      scope: "calendar-attendee-cleanup",
      ...payload,
      runId: crypto.randomBytes(4).toString("hex"),
    }),
  );
}

async function getAccessToken({ clientId, clientSecret, refreshToken }) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) {
    throw new Error(`OAuth token refresh failed (HTTP ${response.status}).`);
  }
  const data = await response.json();
  if (!data.access_token) {
    throw new Error("OAuth token refresh returned no access_token.");
  }
  return data.access_token;
}

async function listFutureAppEvents(accessToken, calendarId) {
  const items = [];
  let pageToken = "";
  const timeMin = new Date().toISOString();

  do {
    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId,
      )}/events`,
    );
    url.searchParams.set("timeMin", timeMin);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("maxResults", "250");
    // Strongest marker: private extended property set by the booking system.
    url.searchParams.set("privateExtendedProperty", `source=${SOURCE}`);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error(`events.list failed (HTTP ${response.status}).`);
    }
    const data = await response.json();
    items.push(...(data.items ?? []));
    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return items;
}

function classify(event) {
  const maskedId = maskEventId(event.id);
  const { date, time } = wallClock(event);
  const attendeeCountBefore = Array.isArray(event.attendees) ? event.attendees.length : 0;

  if (!isAppManaged(event)) {
    return {
      action: "skip",
      event,
      maskedId,
      date,
      time,
      attendeeCountBefore,
      reason: "not_app_managed",
    };
  }
  if (event.start?.date && !event.start?.dateTime) {
    return {
      action: "skip",
      event,
      maskedId,
      date,
      time,
      attendeeCountBefore,
      reason: "all_day",
    };
  }
  if (!event.start?.dateTime) {
    return {
      action: "skip",
      event,
      maskedId,
      date,
      time,
      attendeeCountBefore,
      reason: "missing_start",
    };
  }
  if (attendeeCountBefore === 0) {
    return {
      action: "skip",
      event,
      maskedId,
      date,
      time,
      attendeeCountBefore,
      reason: "no_attendees",
    };
  }
  return {
    action: "clean",
    event,
    maskedId,
    date,
    time,
    attendeeCountBefore,
    reason: "has_attendees",
  };
}

async function clearAttendees(accessToken, calendarId, event) {
  const beforeStart = event.start?.dateTime ?? null;
  const beforeEnd = event.end?.dateTime ?? null;
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId,
    )}/events/${encodeURIComponent(event.id)}`,
  );
  url.searchParams.set("sendUpdates", "none");
  url.searchParams.delete("sendNotifications");

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    // Array overwrite clears guests. Title/description/start/end omitted → kept.
    body: JSON.stringify({ attendees: [] }),
  });

  if (!response.ok) {
    return { status: "failed", attendeeCountAfter: null };
  }

  const updated = await response.json();
  const afterStart = updated.start?.dateTime ?? null;
  const afterEnd = updated.end?.dateTime ?? null;
  if (afterStart !== beforeStart || afterEnd !== beforeEnd) {
    return { status: "aborted_time_changed", attendeeCountAfter: null };
  }
  const attendeeCountAfter = Array.isArray(updated.attendees)
    ? updated.attendees.length
    : 0;
  return { status: "cleaned", attendeeCountAfter };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = process.cwd();
  loadEnvFile(path.join(root, ".env.local"));
  loadEnvFile(path.join(root, ".env"));
  if (args.envFile) loadEnvFile(path.resolve(args.envFile));

  if (args.apply && args.confirm !== CONFIRM_PHRASE) {
    console.error(
      `Apply mode requires --confirm=${CONFIRM_PHRASE}. Aborting without changes.`,
    );
    process.exit(2);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || "";
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "";

  if (!clientId || !clientSecret || !refreshToken || !calendarId) {
    console.error(
      "Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN / GOOGLE_CALENDAR_ID.",
    );
    process.exit(1);
  }

  const mode = args.apply ? "apply" : "dry-run";
  console.log(`calendar:cleanup-attendees mode=${mode}`);

  const accessToken = await getAccessToken({
    clientId,
    clientSecret,
    refreshToken,
  });
  const events = await listFutureAppEvents(accessToken, calendarId);
  const decisions = events.map(classify);

  const appManagedFuture = decisions.filter((d) => d.reason !== "not_app_managed").length;
  const withAttendees = decisions.filter((d) => d.attendeeCountBefore > 0).length;
  const safeToClean = decisions.filter((d) => d.action === "clean");
  const skipped = decisions.filter((d) => d.action === "skip");

  const skipReasons = {};
  for (const d of skipped) {
    skipReasons[d.reason] = (skipReasons[d.reason] || 0) + 1;
  }

  console.log(
    JSON.stringify(
      {
        mode,
        totalFutureAppManagedBookingEvents: appManagedFuture,
        eventsWithAttendees: withAttendees,
        eventsSafeToClean: safeToClean.length,
        skippedEvents: skipped.length,
        skipReasons,
      },
      null,
      2,
    ),
  );

  for (const d of decisions) {
    logSafe({
      operation: mode === "apply" && d.action === "clean" ? "apply-pending" : "scan",
      maskedId: d.maskedId,
      date: d.date,
      time: d.time,
      attendeeCountBefore: d.attendeeCountBefore,
      status: d.action === "clean" ? "would_clean" : `skip:${d.reason}`,
    });
  }

  if (!args.apply) {
    console.log(
      "\nDry-run complete. No events were modified. Re-run with --apply --confirm=REMOVE_OLD_BOOKING_ATTENDEES only after explicit approval.",
    );
    return;
  }

  const applied = [];
  for (const d of safeToClean) {
    const result = await clearAttendees(accessToken, calendarId, d.event);
    applied.push({
      maskedId: d.maskedId,
      attendeeCountBefore: d.attendeeCountBefore,
      attendeeCountAfter: result.attendeeCountAfter,
      status: result.status,
    });
    logSafe({
      operation: "apply",
      maskedId: d.maskedId,
      date: d.date,
      time: d.time,
      attendeeCountBefore: d.attendeeCountBefore,
      attendeeCountAfter: result.attendeeCountAfter,
      status: result.status,
    });
    if (result.status === "aborted_time_changed") {
      console.error(
        `Aborting further apply: time changed for ${d.maskedId}. Manual review required.`,
      );
      process.exit(3);
    }
  }

  console.log(
    JSON.stringify(
      {
        mode: "apply",
        cleaned: applied.filter((a) => a.status === "cleaned").length,
        failed: applied.filter((a) => a.status === "failed").length,
        aborted: applied.filter((a) => a.status === "aborted_time_changed").length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Cleanup failed.");
  process.exit(1);
});
