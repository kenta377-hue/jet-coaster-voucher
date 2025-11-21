<script lang="ts">
  import { onMount } from 'svelte';
  // フル来場者 UI は別途追加実装。ここは案内プレースホルダ。
  let notice = '会場のQRを読み取って発券してください';
</script>

<div style="padding:16px;font-family:system-ui,Segoe UI,Roboto,'Noto Sans JP',sans-serif">
  <h2>来場者ページ</h2>
  <p>{notice}</p>
</div>
