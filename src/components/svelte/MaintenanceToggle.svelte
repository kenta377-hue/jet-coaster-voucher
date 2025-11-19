<script lang="ts">
  import { state, toggleMaintenance } from '../../lib/stores';
  import { get } from 'svelte/store';
  let on = get(state).maintenance;

  function set(v: boolean) {
    on = v;
    toggleMaintenance(v);
  }
</script>

<label style="display:flex;gap:8px;align-items:center;">
  <input type="checkbox" bind:checked={on} on:change={(e) => set((e.target as HTMLInputElement).checked)} />
  メンテナンス中表示の切り替え
</label>
<p style="font-size:12px;color:#666;">来場者画面ではメンテナンス中を表示します。</p>
