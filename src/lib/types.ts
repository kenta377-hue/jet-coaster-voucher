export type HalfHourSlot = {
  id: string;          // ISO: YYYY-MM-DDTHH:MM (slot start)
  label: string;       // "HH:MM〜HH:MM"
  capacity: number;
  issued: number;
  calledUpTo: number;
};

export type Ticket = {
  code: string;        // QR payload: JC-<slotISO>-<number>
  slotId: string;
  number: number;      // 1..capacity
  validFrom: number;   // epoch ms (start - 10min)
  validTo: number;     // epoch ms (end + 10min)
  createdAt: number;
  redeemedAt?: number; // first valid scan time
};

export type ScanRecord = {
  code: string;
  scannedAt: number;
  valid: boolean;
};

export type AppState = {
  slots: HalfHourSlot[];
  tickets: Ticket[];
  maintenance: boolean;
  scans: ScanRecord[];
};
