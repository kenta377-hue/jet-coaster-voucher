<script lang="ts">
  import type { HalfHourSlot } from '../../lib/types';
  import { callNext } from '../../lib/stores';
  export let slots: HalfHourSlot[] = [];

  function setCall(sl: HalfHourSlot, value: number) {
    callNext(sl.id, value);
  }
</script>

<style>
  table { width:100%; border-collapse: collapse; }
  th, td { border-bottom:1px solid #eee; padding:8px; text-align:left; }
  input[type="number"] { width:80px; }
</style>

<h4>呼び出し番号の表示・調整</h4>
<table>
  <thead>
    <tr>
      <th>時間帯</th>
      <th>配布枠</th>
      <th>発行済</th>
      <th>現在の呼び出し番号</th>
      <th>変更</th>
    </tr>
  </thead>
  <tbody>
    {#each slots as sl}
    <tr>
      <td>{sl.label}</td>
      <td>{sl.capacity}</td>
      <td>{sl.issued}</td>
      <td>{sl.calledUpTo}</td>
      <td>
        <input type="number" min="0" max={sl.capacity} value={sl.calledUpTo}
          on:change={(e) => setCall(sl, Number((e.target as HTMLInputElement).value))}/>
      </td>
    </tr>
    {/each}
  </tbody>
</table>
