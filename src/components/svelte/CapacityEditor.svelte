<script lang="ts">
  import type { HalfHourSlot } from '../../lib/types';
  import { setCapacity } from '../../lib/stores';
  export let slots: HalfHourSlot[] = [];

  function updateCap(sl: HalfHourSlot, v: number) {
    setCapacity(sl.id, v);
  }
</script>

<style>
  table { width:100%; border-collapse: collapse; }
  th, td { border-bottom:1px solid #eee; padding:8px; text-align:left; }
  input[type="number"] { width:90px; }
</style>

<h4>30分ごとの配布枚数の変更</h4>
<table>
  <thead>
    <tr>
      <th>時間帯</th>
      <th>現在の枚数</th>
      <th>変更</th>
    </tr>
  </thead>
  <tbody>
    {#each slots as sl}
      <tr>
        <td>{sl.label}</td>
        <td>{sl.capacity}</td>
        <td>
          <input type="number" min="0" value={sl.capacity}
            on:change={(e) => updateCap(sl, Number((e.target as HTMLInputElement).value))}/>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
<p style="font-size:12px;color:#666;">例: 9:00〜9:30は30枚、9:30〜10:00は25枚など。</p>
