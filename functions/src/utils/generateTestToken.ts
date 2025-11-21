// development helper - not used in production
import { signToken } from './utils/tokens';

function gen() {
  const fakeId = 'TEST-' + Date.now();
  const token = signToken({ ticketId: fakeId, slotId: 'DEV_0900', ticketNumber: 1, exp: Math.floor(Date.now() / 1000 + 3600) });
  console.log('TEST TOKEN:', token);
}
gen();
