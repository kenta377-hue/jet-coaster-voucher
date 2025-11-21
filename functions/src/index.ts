import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { signToken, verifyToken } from './utils/tokens';

admin.initializeApp();
const db = admin.firestore();

function ensureStaff(context: functions.https.CallableContext) {
  if (!context.auth || !context.auth.token || !context.auth.token.staff) {
    throw new functions.https.HttpsError('permission-denied', 'Staff only');
  }
}

export const allocateTickets = functions.https.onCall(async (data, context) => {
  const { slotId, qty } = data as { slotId: string; qty: number };
  if (!slotId || !qty || typeof qty !== 'number' || qty <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'slotId and qty required');
  }
  const MAX_PER_REQUEST = 8;
  if (qty > MAX_PER_REQUEST) throw new functions.https.HttpsError('resource-exhausted', 'qty too large');

  const slotRef = db.collection('slots').doc(slotId);

  const created = await db.runTransaction(async (tx) => {
    const slotSnap = await tx.get(slotRef);
    if (!slotSnap.exists) throw new functions.https.HttpsError('not-found', 'Slot not found');
    const slot = slotSnap.data() as any;
    if (!slot.active) throw new functions.https.HttpsError('failed-precondition', 'Slot not active');
    const capacity = slot.capacity ?? 0;
    const sold = slot.sold ?? 0;
    if (sold + qty > capacity) throw new functions.https.HttpsError('resource-exhausted', 'Not enough capacity');

    const startIndex = sold + 1;
    tx.update(slotRef, { sold: sold + qty });

    const createdTickets: any[] = [];
    for (let i = 0; i < qty; i++) {
      const ticketNumber = startIndex + i;
      const ticketRef = db.collection('tickets').doc();
      const startTs = slot.start as admin.firestore.Timestamp;
      const endTs = slot.end as admin.firestore.Timestamp;
      const validFrom = admin.firestore.Timestamp.fromDate(new Date(startTs.toDate().getTime() - 10 * 60 * 1000));
      const validTo = admin.firestore.Timestamp.fromDate(new Date(endTs.toDate().getTime() + 10 * 60 * 1000));
      const payload = {
        ticketId: ticketRef.id,
        slotId,
        ticketNumber,
        exp: Math.floor(validTo.toDate().getTime() / 1000)
      };
      const ownerToken = signToken(payload);
      tx.set(ticketRef, {
        slotId,
        ticketNumber,
        ownerToken,
        used: false,
        validFrom,
        validTo,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        purchaser: data.purchaser || null
      });
      createdTickets.push({
        ticketId: ticketRef.id,
        slotId,
        ticketNumber,
        ownerToken,
        validFrom: validFrom.toDate().toISOString(),
        validTo: validTo.toDate().toISOString()
      });
    }

    return createdTickets;
  });

  await db.collection('auditLogs').add({
    type: 'allocate',
    slotId,
    qty,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { ok: true, tickets: created };
});

export const verifyAndUseTicket = functions.https.onRequest(async (req, res) => {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const payload = body.payload;
    if (!payload) {
      res.status(400).json({ ok: false, error: 'payload required' });
      return;
    }

    const token = String(payload);
    let parsed;
    try {
      parsed = verifyToken(token);
    } catch (err) {
      res.status(400).json({ ok: false, error: 'Invalid token' });
      return;
    }

    const ticketId = parsed.ticketId as string;
    if (!ticketId) {
      res.status(400).json({ ok: false, error: 'ticketId missing' });
      return;
    }

    const ticketRef = db.collection('tickets').doc(ticketId);

    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ticketRef);
      if (!snap.exists) throw new functions.https.HttpsError('not-found', 'Ticket not found');
      const ticket = snap.data() as any;
      if (ticket.used) throw new functions.https.HttpsError('already-exists', 'Ticket already used');

      const now = admin.firestore.Timestamp.now();
      if (ticket.validFrom && now < ticket.validFrom) throw new functions.https.HttpsError('failed-precondition', 'Too early');
      if (ticket.validTo && now > ticket.validTo) throw new functions.https.HttpsError('deadline-exceeded', 'Ticket expired');

      tx.update(ticketRef, {
        used: true,
        usedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      tx.set(db.collection('auditLogs').doc(), {
        type: 'checkin',
        ticketId,
        slotId: ticket.slotId,
        ticketNumber: ticket.ticketNumber,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { ticketId, slotId: ticket.slotId, ticketNumber: ticket.ticketNumber };
    });

    res.status(200).json({ ok: true, message: 'Checked in', data: result });
  } catch (err: any) {
    console.error('verifyAndUseTicket error', err);
    const status = (err instanceof functions.https.HttpsError) ? 400 : 500;
    res.status(status).json({ ok: false, error: err.message || 'Verification failed' });
  }
});

export const setCurrentCallNumber = functions.https.onCall(async (data, context) => {
  ensureStaff(context);
  const { slotId, number } = data as { slotId: string; number: number };
  if (!slotId || typeof number !== 'number') throw new functions.https.HttpsError('invalid-argument', 'slotId and number required');

  const callRef = db.collection('calls').doc(slotId);
  await callRef.set({ currentCallNumber: number, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  return { ok: true, slotId, number };
});

export const adjustSlotCapacity = functions.https.onCall(async (data, context) => {
  ensureStaff(context);
  const { slotId, newCapacity } = data as { slotId: string; newCapacity: number };
  if (!slotId || typeof newCapacity !== 'number') throw new functions.https.HttpsError('invalid-argument', 'slotId and newCapacity required');

  const slotRef = db.collection('slots').doc(slotId);
  await slotRef.update({ capacity: newCapacity });
  return { ok: true, slotId, newCapacity };
});

export const deactivatePastSlots = functions.pubsub.schedule('every 1 minutes').onRun(async () => {
  const now = admin.firestore.Timestamp.now();
  const q = db.collection('slots').where('active', '==', true).where('end', '<', now);
  const snaps = await q.get();
  const batch = db.batch();
  snaps.forEach(snap => batch.update(snap.ref, { active: false }));
  if (!snaps.empty) await batch.commit();
  return null;
});
