<script lang="ts">
  import CameraReader from './CameraReader.svelte';
  import { httpsCallable } from 'firebase/functions';
  import { functions } from '../lib/firebaseClient';

  let log = '';
  function appendLog(text: string) {
    log = `${new Date().toLocaleTimeString()} - ${text}\n` + log;
  }

  async function handleScan(data: string) {
    appendLog(`QR 読取: ${data}`);
    try {
      const res = await fetch('/api/verifyTicket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: data })
      });
      const json = await res.json();
      if (json.ok) appendLog(`検証成功: ${json.message}`);
      else appendLog(`検証失敗: ${JSON.stringify(json)}`);
    } catch (err) {
      appendLog(`通信エラー: ${err}`);
    }
  }

  async function setCurrentCallNumber(slotId: string, number: number) {
    try {
      const setCall = httpsCallable(functions, 'setCurrentCallNumber');
      const res = await setCall({ slotId, number });
      appendLog(`呼出番号更新: ${JSON.stringify(res.data)}`);
    } catch (err) {
      appendLog(`呼出更新失敗: ${err}`);
    }
  }
</script>

<style>
  .dashboard { padding:16px;font-family:system-ui,Segoe UI,Roboto,'Noto Sans JP',sans-serif }
  pre { background:#111;color:#fff;padding:8px;border-radius:6px;max-height:320px;overflow:auto;white-space:pre-wrap; }
</style>

<div class="dashboard">
  <h3>スタッフダッシュボード</h3>
  <p>カメラでQRを読み取り、検証APIへ送信します。</p>

  <CameraReader on:scan={(e) => handleScan(e.detail.data)} />

  <section style="margin-top:16px;">
    <h4>操作ログ</h4>
    <pre>{log}</pre>
  </section>
</div>
