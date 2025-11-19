import { writable } from 'svelte/store';
import type { AppState, HalfHourSlot, Ticket } from './types';
import { generateHalfHourSlotsForToday, slotValidityWindow } from './time';

const KEY = 'astro-jet-coaster-state-v1';

function load(): AppState {
  const raw = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }
  return {
    slots: generateHalfHourSlotsForToday(30),
    tickets: [],
    maintenance: false,
    scans: []
  };
}

function persist(state: AppState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY, JSON.stringify(state));
  }
}

export const state = writable<AppState>(load());
state.subscribe(persist);

// Staff operations

export function setCapacity(slotId: string, capacity: number) {
  state.update(s => {
    const sl = s.slots.find(x => x.id === slotId);
    if (sl) {
      sl.capacity = Math.max(0, capacity);
      if (sl.calledUpTo > sl.capacity) sl.calledUpTo = sl.capacity;
    }
    return s;
  });
}

export function toggleMaintenance(on: boolean) {
  state.update(s => { s.maintenance = on; return s; });
}

export function callNext(slotId: string, toNumber: number) {
  state.update(s => {
    const sl = s.slots.find(x => x.id === slotId);
    if (sl) sl.calledUpTo = Math.max(0, Math.min(toNumber, sl.capacity));
    return s;
  });
}

// Ticket issuing (no carry-over)

export function issueTickets(slotIds: string[], count: number): Ticket[] {
  const created: Ticket[] = [];
  state.update(s => {
    let remaining = count;
    for (const slotId of slotIds) {
      if (remaining <= 0) break;
      const slot = s.slots.find(x => x.id === slotId);
      if (!slot) continue;
      while (remaining > 0 && slot.issued < slot.capacity) {
        const number = slot.issued + 1;
        const code = `JC-${slotId}-${number}`;
        const { validFrom, validTo } = slotValidityWindow(slotId);
        const t: Ticket = {
          code,
          slotId,
          number,
          validFrom,
          validTo,
          createdAt: Date.now()
        };
        s.tickets.push(t);
        slot.issued += 1;
        remaining -= 1;
        created.push(t);
      }
    }
    return s;
  });
  return created;
}

// Scan handling (camera QR with validity window)

export function markScanned(code: string): boolean {
  let ok = false;
  state.update(s => {
    const t = s.tickets.find(x => x.code === code);
    const now = Date.now();
    if (!t) {
      s.scans.push({ code, scannedAt: now, valid: false });
      return s;
    }
    ok = now >= t.validFrom && now <= t.validTo;
    s.scans.push({ code, scannedAt: now, valid: ok });
    if (ok && !t.redeemedAt) t.redeemedAt = now;
    return s;
  });
  return ok;
}

// Helpers

export function getTicketsBySlot(slotId: string) {
  let res: Ticket[] = [];
  state.update(s => { res = s.tickets.filter(t => t.slotId === slotId); return s; });
  return res;
}
