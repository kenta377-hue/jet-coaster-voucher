const hourRanges = [
  { start: "08:50", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "12:00", end: "13:00" },
  { start: "13:00", end: "14:00" },
  { start: "14:00", end: "15:00" }
];

export function todayTime(hhmm: string) {
  const [hh, mm] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d;
}

export function formatLabel(start: Date, end: Date) {
  const p = (d: Date) =>
    `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  return `${p(start)}〜${p(end)}`;
}

export function generateHalfHourSlotsForToday(defaultCapacity = 30) {
  const slots = [];
  for (const range of hourRanges) {
    const start = todayTime(range.start);
    const end = todayTime(range.end);
    let cur = new Date(start.getTime());
    while (cur < end) {
      const next = new Date(cur.getTime() + 30 * 60 * 1000);
      const id = cur.toISOString().slice(0,16);
      slots.push({
        id,
        label: formatLabel(cur, next),
        capacity: defaultCapacity,
        issued: 0,
        calledUpTo: 0
      });
      cur = next;
    }
  }
  return slots;
}

export function getCurrentHourBandSlots<T extends { id: string }>(slots: T[]) {
  const now = new Date().getTime();
  let bandIndex = -1;
  for (let i = 0; i < hourRanges.length; i++) {
    const s = todayTime(hourRanges[i].start).getTime();
    const e = todayTime(hourRanges[i].end).getTime();
    if (now >= s && now < e) { bandIndex = i; break; }
  }
  if (bandIndex === -1) return { current: [] as T[], next: [] as T[] };

  const band = hourRanges[bandIndex];
  const nextBand = hourRanges[bandIndex + 1] ?? null;

  const inRange = (id: string, start: string, end: string) => {
    const d = new Date(id).getTime();
    return d >= todayTime(start).getTime() && d < todayTime(end).getTime();
  };

  const current = slots.filter(sl => inRange(sl.id, band.start, band.end));
  const next = nextBand
    ? slots.filter(sl => inRange(sl.id, nextBand.start, nextBand.end))
    : [];
  return { current, next };
}

export function slotValidityWindow(startISO: string) {
  const start = new Date(startISO);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const validFrom = new Date(start.getTime() - 10 * 60 * 1000).getTime();
  const validTo = new Date(end.getTime() + 10 * 60 * 1000).getTime();
  return { validFrom, validTo, end };
}
