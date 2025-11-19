<script lang="ts">
  import '../../components/svelte/AppTheme.css';
  import { state } from '../../lib/stores';
  import { get } from 'svelte/store';
  import CapacityEditor from './CapacityEditor.svelte';
  import CallDisplay from './CallDisplay.svelte';
  import MaintenanceToggle from './MaintenanceToggle.svelte';
  import QRScanner from './QRScanner.svelte';

  $: slots = get(state).slots;
  $: scans = get(state).scans;
  $: tickets = get(state).tickets;

  $: totalIssued = tickets.length;
  $: arrivedCount = tickets.filter(t => t.redeemedAt).length;
  $: arrivalRate = totalIssued ? Math.round((arrivedCount / totalIssued) * 100) : 0;
</script>

<h3>スタッフ用管理画面</h3>

<div class="panel">
  <MaintenanceToggle />
</div>

<div class="panel">
  <QRScanner />
</div>

<div class="panel">
  <div class="stat">
    <div class="item">発行済み整理券: {totalIssued}枚</div>
    <div class="item">到着済み: {arrivedCount}枚</div>
    <div class="item">到着率: {arrivalRate}%</div>
    <div class="item">スキャン総数: {scans.length}件</div>
  </div>
</div>

<div class="panel">
  <CapacityEditor {slots} />
</div>

<div class="panel">
  <CallDisplay {slots} />
</div>

<div class="panel">
  <h4>到着スキャン履歴</h4>
  <table class="table">
    <thead>
      <tr>
        <th>時刻</th>
        <th>コード</th>
        <th>有効</th>
      </tr>
    </thead>
    <tbody>
      {#each scans.slice().reverse() as rec}
        <tr>
          <td>{new Date(rec.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
          <td>{rec.code}</td>
          <td>{rec.valid ? 'OK' : 'NG'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <p style="font-size:12px;color:#666;">到着履歴は localStorage に保存されます。</p>
</div>

<div class="panel">
  <h4>来場状況の確認</h4>
  <ul>
    {#each slots as sl}
      <li>{sl.label} — 発行 {sl.issued}/{sl.capacity}、呼出 {sl.calledUpTo}</li>
    {/each}
  </ul>
  <p style="font-size:12px;color:#666;">「何番が来て何番が未到着か」は呼出番号で管理。詳細の未到着一覧は到着スキャンとの突合で把握可能です。</p>
</div>
