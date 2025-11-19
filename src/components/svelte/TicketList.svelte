<script lang="ts">
  import type { Ticket } from '../../lib/types';
  import { makeQR } from '../../lib/qr';
  export let tickets: Ticket[] = [];
  let images: Record<string,string> = {};

  $: (async () => {
    for (const t of tickets) {
      if (!images[t.code]) {
        images[t.code] = await makeQR(t.code);
      }
    }
  })();

  function fmt(ms: number) {
    const d = new Date(ms);
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    return `${hh}:${mm}`;
  }
</script>

<style>
  .list { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:12px; }
  .card { border:1px solid #ddd; border-radius:8px; padding:8px; }
  img { width: 100%; height:auto; }
  .meta { font-size:12px; color:#555; }
  .redeemed { color:#0a7; font-weight:600; }
</style>

<div class="list">
  {#each tickets as t}
    <div class="card">
      <img alt="QR" src={images[t.code]} />
      <div class="meta">
        <div>整理券番号: {t.number}</div>
        <div>枠: {new Date(t.slotId).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}〜
          {new Date(new Date(t.slotId).getTime() + 30*60*1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div>有効時間: {fmt(t.validFrom)} 〜 {fmt(t.validTo)}</div>
        <div>QRコード: {t.code}</div>
        {#if t.redeemedAt}
          <div class="redeemed">到着済: {fmt(t.redeemedAt)}</div>
        {/if}
      </div>
    </div>
  {/each}
</div>
