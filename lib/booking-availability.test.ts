import { afterEach, describe, expect, it, vi } from "vitest";

function configureGoogle(busyIds = "primary,work@example.com") {
  vi.stubEnv("GOOGLE_CLIENT_ID", "client");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "secret");
  vi.stubEnv("GOOGLE_REFRESH_TOKEN", "refresh");
  vi.stubEnv("GOOGLE_CALENDAR_ID", "primary");
  vi.stubEnv("GOOGLE_BUSY_CALENDAR_IDS", busyIds);
}

async function loadAvailabilityModule() {
  vi.resetModules();
  return import("./booking-integrations");
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("Google Calendar availability integrity", () => {
  it("parses and deduplicates explicit busy calendar IDs with fallback support", async () => {
    const { parseBusyCalendarIds } = await loadAvailabilityModule();
    expect(parseBusyCalendarIds(" primary, work@example.com,primary ")).toEqual([
      "primary",
      "work@example.com",
    ]);
    expect(parseBusyCalendarIds(undefined, "primary")).toEqual(["primary"]);
  });

  it("queries and combines FreeBusy intervals from every configured calendar", async () => {
    configureGoogle();
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("oauth2.googleapis.com")) {
        return Response.json({ access_token: "access" });
      }
      if (url.includes("/freeBusy")) {
        const body = JSON.parse(String(init?.body)) as {
          items: Array<{ id: string }>;
        };
        expect(body.items).toEqual([
          { id: "primary" },
          { id: "work@example.com" },
        ]);
        return Response.json({
          calendars: {
            primary: {
              busy: [
                {
                  start: "2026-07-20T08:00:00.000Z",
                  end: "2026-07-20T09:00:00.000Z",
                },
              ],
            },
            "work@example.com": {
              busy: [
                {
                  start: "2026-07-20T10:00:00.000Z",
                  end: "2026-07-20T11:00:00.000Z",
                },
              ],
            },
          },
        });
      }
      throw new Error(`Unexpected URL: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const { getBusyIntervalsForDate } = await loadAvailabilityModule();
    const intervals = await getBusyIntervalsForDate("2026-07-20");
    expect(intervals).toHaveLength(2);
  });

  it("fails closed if any configured calendar is inaccessible", async () => {
    configureGoogle();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = String(input);
        if (url.includes("oauth2.googleapis.com")) {
          return Response.json({ access_token: "access" });
        }
        return Response.json({
          calendars: {
            primary: { busy: [] },
            "work@example.com": {
              errors: [{ reason: "notFound" }],
            },
          },
        });
      }),
    );

    const { getBusyIntervalsForDate } = await loadAvailabilityModule();
    await expect(getBusyIntervalsForDate("2026-07-20")).rejects.toMatchObject({
      code: "CALENDAR_UNAVAILABLE",
    });
  });

  it("collects non-transparent all-day events from every busy calendar", async () => {
    configureGoogle();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = decodeURIComponent(String(input));
        if (url.includes("oauth2.googleapis.com")) {
          return Response.json({ access_token: "access" });
        }
        if (url.includes("/calendars/primary/events")) {
          return Response.json({
            items: [
              {
                start: { date: "2026-07-20" },
                end: { date: "2026-07-21" },
              },
            ],
          });
        }
        if (url.includes("/calendars/work@example.com/events")) {
          return Response.json({
            items: [
              {
                start: { date: "2026-07-20" },
                end: { date: "2026-07-21" },
                transparency: "transparent",
              },
            ],
          });
        }
        throw new Error(`Unexpected URL: ${url}`);
      }),
    );

    const { getAllDayBusyIntervalsForDate } = await loadAvailabilityModule();
    const intervals = await getAllDayBusyIntervalsForDate("2026-07-20");
    expect(intervals).toHaveLength(1);
  });

  it("fails closed when OAuth refresh fails", async () => {
    configureGoogle("primary");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ error: "invalid_grant" }, { status: 400 })),
    );

    const { getAvailableSlotsFromCalendar } = await loadAvailabilityModule();
    await expect(
      getAvailableSlotsFromCalendar("2026-07-20", 60),
    ).rejects.toMatchObject({
      code: "CALENDAR_UNAVAILABLE",
    });
  });

  it("fails closed when calendar configuration is missing", async () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");
    vi.stubEnv("GOOGLE_REFRESH_TOKEN", "");
    vi.stubEnv("GOOGLE_CALENDAR_ID", "");
    vi.stubEnv("GOOGLE_BUSY_CALENDAR_IDS", "");

    const { getAvailableSlotsFromCalendar } = await loadAvailabilityModule();
    await expect(
      getAvailableSlotsFromCalendar("2026-07-20", 60),
    ).rejects.toMatchObject({
      code: "CALENDAR_UNAVAILABLE",
    });
  });
});
