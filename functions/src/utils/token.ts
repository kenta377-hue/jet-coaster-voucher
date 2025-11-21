import crypto from 'crypto';
const SECRET = process.env.TICKET_HMAC_SECRET || '';

function base64url(input: Buffer) {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function signToken(payload: Record<string, any>) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB = base64url(Buffer.from(JSON.stringify(header)));
  const bodyB = base64url(Buffer.from(JSON.stringify(payload)));
  const toSign = `${headerB}.${bodyB}`;
  const sig = crypto.createHmac('sha256', SECRET).update(toSign).digest();
  const sigB = base64url(sig);
  return `${toSign}.${sigB}`;
}

export function verifyToken(token: string) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');
  const [headerB, bodyB, sigB] = parts;
  const toSign = `${headerB}.${bodyB}`;
  const expectedSig = base64url(crypto.createHmac('sha256', SECRET).update(toSign).digest());
  const sigBuf = Buffer.from(sigB);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error('Signature mismatch');
  }
  const payloadJson = Buffer.from(bodyB, 'base64').toString('utf8');
  const payload = JSON.parse(payloadJson);
  return payload;
}
