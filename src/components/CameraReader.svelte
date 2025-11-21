<script lang="ts">
  import { onDestroy, createEventDispatcher } from 'svelte';
  import jsQR from 'jsqr';
  const dispatch = createEventDispatcher();

  let videoEl: HTMLVideoElement | null = null;
  let canvasEl: HTMLCanvasElement | null = null;
  let animationId: number | null = null;
  let scanning = false;

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoEl) {
        videoEl.srcObject = stream;
        await videoEl.play();
        scanning = true;
        tick();
      }
    } catch (err) {
      console.error('カメラ起動失敗', err);
      dispatch('error', { message: 'カメラ起動失敗' });
    }
  }

  function stopCamera() {
    scanning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (videoEl && videoEl.srcObject) {
      const tracks = (videoEl.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
      videoEl.srcObject = null;
    }
  }

  function tick() {
    if (!scanning || !videoEl || !canvasEl) return;
    const w = videoEl.videoWidth;
    const h = videoEl.videoHeight;
    if (w === 0 || h === 0) {
      animationId = requestAnimationFrame(tick);
      return;
    }
    canvasEl.width = w;
    canvasEl.height = h;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoEl, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const code = jsQR(imageData.data, w, h, { inversionAttempts: 'attemptBoth' });
    if (code) {
      dispatch('scan', { data: code.data });
      stopCamera();
      return;
    }
    animationId = requestAnimationFrame(tick);
  }

  onDestroy(() => stopCamera());
</script>

<style>
  .video-wrap { width: 100%; max-width: 640px; }
  video { width: 100%; border-radius: 8px; background: #000; }
  .controls { margin-top:8px; display:flex; gap:8px; }
</style>

<div class="video-wrap">
  <video bind:this={videoEl} playsinline muted></video>
  <canvas bind:this={canvasEl} style="display:none"></canvas>
</div>
<div class="controls">
  <button on:click={startCamera}>カメラ起動</button>
  <button on:click={stopCamera}>停止</button>
</div>
