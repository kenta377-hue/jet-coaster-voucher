<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Html5Qrcode } from 'html5-qrcode';
  import { markScanned } from '../../lib/stores';

  let result: 'ok'|'fail'|'' = '';
  let message = '';
  let scanner: Html5Qrcode;
  const scanRegionId = "qr-reader";

  function handleScan(code: string) {
    const trimmed = code.trim();
    const ok = markScanned(trimmed);
    result = ok ? 'ok' : 'fail';
    message = ok ? '有効時間内です。受付OK。' : '不正または有効時間外です。';
  }

  onMount(async () => {
    scanner = new Html5Qrcode(scanRegionId);
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        handleScan
      );
    } catch (e) {
      result = 'fail';
      message = 'カメラの起動に失敗しました。ブラウザの権限設定をご確認ください。';
      console.error(e);
    }
  });

  onDestroy(async () => {
    try { await scanner?.stop(); } catch {}
  });
</script>

<style>
  #qr-reader { width: 100%; max-width: 420px; margin: 12px auto; }
  .ok { color: #0a7; }
  .fail { color: #c00; }
</style>

<h4>QRコード読み取り（カメラ連携）</h4>
<div id="qr-reader"></div>
{#if result}
  <p class={result === 'ok' ? 'ok' : 'fail'}>{message}</p>
{/if}
