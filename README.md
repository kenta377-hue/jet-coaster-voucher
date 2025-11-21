# Coaster Reservation - Production-ready repository

内容:
- Astro + Svelte frontend
- Firebase Functions (TypeScript) backend: allocateTickets (callable), verifyAndUseTicket (HTTP), staff callables
- Firestore as primary datastore

速習:
1. npm install
2. cd functions && npm install
3. Set functions secret:
   firebase functions:secrets:set TICKET_HMAC_SECRET --data="your_secret"
4. firebase use --add
5. firebase emulators:start --only firestore,functions
6. npm run dev
7. Build & deploy:
   npm run build
   firebase deploy --only functions,hosting,firestore:rules
