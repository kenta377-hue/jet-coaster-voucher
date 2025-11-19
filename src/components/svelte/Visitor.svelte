<script lang="ts">
  import '../../components/svelte/AppTheme.css';
  import { state, issueTickets } from '../../lib/stores';
  import { get } from 'svelte/store';
  import { getCurrentHourBandSlots } from '../../lib/time';
  import SlotSelector from './SlotSelector.svelte';
  import TicketList from './TicketList.svelte';

  let selected: string[] = [];
  let quantity = 1;
  let issuedCodes: string[] = [];
  let tickets = [];
  let maintenance = false;

  $: maintenance = get(state).maintenance;

  function refreshTickets() {
    const s = get(state);
    tickets = s.tickets.filter(t => issuedCodes.includes(t.code));
  }

  function onChange(ids: string[]) { selected = ids; }

  function issue() {
    const s = get(state);
    const { current, next } = getCurrentHourBandSlots(s.slots);
    const allowedIds = [...current.map(s => s.id), ...next.map(s => s.id)];
    const chosen = selected.filter(id => allowedIds.includes(id));
    if (chosen.length === 0) {
      alert('時間帯を選択してください（現在の1時間と次の1時間から選べます）。');
      return;
    }
    const created = issueTickets(chosen, quantity);
    issuedCodes = created.map(c => c.code);
    refreshTickets();
  }
</script>

{#if maintenance}
  <div class="panel" style="background:#fff3cd;border-color:#ffec99;">
    <strong>メンテナンス中</strong>
    <p>現在メンテナンス中です。整理券の取得は可能ですが、運行状況により待ち時間が変動する場合があります。</p>
  </div>
{/if}

<h3>整理券を取得する</h3>
<div class="panel">
  <p>キャンパスプラザ設置のQRコードからアクセス済みとして想定しています。</p>
  <label>枚数
    <input type="number" min="1" max="10" bind:value={quantity} />
  </label>
  {#await (async () => {
    const s = get(state);
    const { current, next } = getCurrentHourBandSlots(s.slots);
    return { current, next };
  })()}
    <p>読み込み中...</p>
  {:then data}
    <SlotSelector currentSlots={data.current} nextSlots={data.next} selected={selected} onChange={onChange} />
  {:catch}
    <p>時間帯の取得に失敗しました。</p>
  {/await}
  <button on:click={issue}>整理券を取得</button>
</div>

<h3>取得済みの整理券</h3>
<TicketList {tickets} />

<div class="panel">
  <h4>現在の呼び出し状況</h4>
  {#each get(state).slots as sl}
    <div>
      {sl.label}: {sl.calledUpTo}番まで呼び出し中
    </div>
  {/each}
  <p style="font-size:12px;color:#666;">予想予約待ち時間は簡易表示です。</p>
</div>
