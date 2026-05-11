export const bookingConfig = {
  openingHour: 8,
  closingHour: 18,
  breakMinutes: 15,
  slotStepMinutes: 30,
} as const;

export function getLocalTodayISO(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function getSlotsForDate(
  date: string,
  durationMinutes: number,
  config = bookingConfig,
) {
  if (!date || durationMinutes <= 0) {
    return [];
  }

  const day = new Date(`${date}T12:00:00`).getDay();
  if (day === 0 || day === 6) {
    return [];
  }

  const appointmentMinutes = durationMinutes + config.breakMinutes;
  const start = config.openingHour * 60;
  const end = config.closingHour * 60;
  const slots: string[] = [];

  for (
    let time = start;
    time + appointmentMinutes <= end;
    time += config.slotStepMinutes
  ) {
    slots.push(minutesToTime(time));
  }

  return slots;
}
