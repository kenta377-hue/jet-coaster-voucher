import type { APIRoute } from 'astro';

export const post: APIRoute = async ({ request }) => {
  const body = await request.json();
  const payload = body.payload;
  console.log('[dev/mock verifyTicket] payload:', payload);
  return new Response(JSON.stringify({ ok: true, message: 'mock verified', payload }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
