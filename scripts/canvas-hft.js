/**
 * ============================================================================
 * QUANTUMFLOW HFT MICROSTRUCTURE - CANVAS CHARTING & DOM LADDER SUITE
 * 60 FPS Depth of Market, 3D Liquidity Heat Surface & Quantum Wave Canvas
 * ============================================================================
 */

(function (window) {
  'use strict';

  const CanvasHFT = {
    setupDPI(canvas) {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || canvas.width || 600;
      const h = rect.height || canvas.height || 260;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      const ctx = canvas.getContext('2d');
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
      return { ctx, w, h };
    },

    /**
     * 1. Render 3D-Perspective Liquidity Heat Surface
     */
    renderLiquiditySurface(canvas, depthHistory) {
      const { ctx, w, h } = this.setupDPI(canvas);
      ctx.clearRect(0, 0, w, h);

      if (!depthHistory || depthHistory.length < 2) {
        ctx.fillStyle = '#5d7e6f';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('Accumulating microsecond order book snapshots...', 20, h / 2);
        return;
      }

      const rows = depthHistory.length;
      const cols = 20; // 10 bids, 10 asks
      const cellW = (w - 60) / rows;
      const cellH = (h - 40) / cols;

      for (let r = 0; r < rows; r++) {
        const snap = depthHistory[r];
        const x = 50 + r * cellW;

        // Draw Ask levels (top half, coral)
        for (let a = 0; a < 10; a++) {
          const ask = snap.asks[9 - a];
          const y = 20 + a * cellH;
          const qty = ask ? ask.qty : 0;
          const alpha = Math.min(0.9, qty / 5.0);

          ctx.fillStyle = `rgba(251, 113, 133, ${alpha})`;
          ctx.fillRect(x, y, cellW + 0.5, cellH - 1);
        }

        // Mid-price laser divider
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(x, 20 + 10 * cellH - 1, cellW + 0.5, 2);

        // Draw Bid levels (bottom half, emerald)
        for (let b = 0; b < 10; b++) {
          const bid = snap.bids[b];
          const y = 20 + (10 + b) * cellH;
          const qty = bid ? bid.qty : 0;
          const alpha = Math.min(0.9, qty / 5.0);

          ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
          ctx.fillRect(x, y, cellW + 0.5, cellH - 1);
        }
      }

      // Title & Labels
      ctx.font = '600 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#fb7185';
      ctx.fillText('ASKS (CORAL)', 8, 30);
      ctx.fillStyle = '#22d3ee';
      ctx.fillText('SPREAD', 8, h / 2 + 3);
      ctx.fillStyle = '#00ff88';
      ctx.fillText('BIDS (EMERALD)', 8, h - 15);
    },

    /**
     * 2. Quantum Random Walk Ballistic Dispersion Chart
     */
    renderQuantumWave(canvas, probabilities) {
      const { ctx, w, h } = this.setupDPI(canvas);
      ctx.clearRect(0, 0, w, h);

      if (!probabilities || probabilities.length === 0) return;

      const padding = { top: 30, right: 20, bottom: 35, left: 50 };
      const plotW = w - padding.left - padding.right;
      const plotH = h - padding.top - padding.bottom;

      // Max probability
      let maxP = 0;
      probabilities.forEach(p => { if (p.probability > maxP) maxP = p.probability; });
      if (maxP === 0) maxP = 1;

      const n = probabilities.length;
      const stepX = plotW / (n - 1);

      // Draw quantum wave line
      ctx.beginPath();
      probabilities.forEach((p, idx) => {
        const x = padding.left + idx * stepX;
        const y = padding.top + plotH - (p.probability / maxP) * plotH;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Gradient under curve
      ctx.lineTo(padding.left + plotW, padding.top + plotH);
      ctx.lineTo(padding.left, padding.top + plotH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + plotH);
      grad.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
      grad.addColorStop(1, 'rgba(0, 255, 136, 0.01)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Title
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('QUANTUM WALK PROBABILITY DENSITY (BALLISTIC SPREAD ~ t)', padding.left, 20);
    }
  };

  window.CanvasHFT = CanvasHFT;
})(window);
