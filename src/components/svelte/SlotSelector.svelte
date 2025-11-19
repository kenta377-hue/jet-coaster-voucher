<script lang="ts">
  import type { HalfHourSlot } from '../../lib/types';
  export let currentSlots: HalfHourSlot[] = [];
  export let nextSlots: HalfHourSlot[] = [];
  export let selected: string[] = [];
  export let onChange: (ids: string[]) => void;

  function toggle(id: string) {
    const set = new Set(selected);
    if (set.has(id)) set.delete(id); else set.add(id);
    onChange(Array.from(set));
  }
</script>

<style>
  .grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap:8px; }
  .slot { border:1px solid #ccc; padding:8px; border-radius:8px; cursor:pointer; }
  .selected { border-color:#0366d6; background:#eaf3ff; }
  .cap { font-size:12px; color:#555; }
</style>

<h4>選択可能な時間帯（現在の1時間とその次の1時間）</h4>
<div class="grid">
  {#each currentSlots as sl}
    <div class="slot {selected.includes(sl.id) ? 'selected' : ''}" on:click={() => toggle(sl.id)}>
      <div>{sl.label}</div>
      <div class="cap">配布枠 {sl.issued}/{sl.capacity}</div>
    </div>
  {/each}
  {#each nextSlots as sl}
    <div class="slot {selected.includes(sl.id) ? 'selected' : ''}" on:click={() => toggle(sl.id)}>
      <div>{sl.label}</div>
      <div class="cap">配布枠 {sl.issued}/{sl.capacity}</div>
    </div>
  {/each}
</div>
<p style="font-size:12px;color:#666;">繰り越しはしません。各30分枠ごとに先着順で番号を割り当てます。</p>
