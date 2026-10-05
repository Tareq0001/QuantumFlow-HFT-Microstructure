/**
 * ============================================================================
 * QUANTUMFLOW HFT MICROSTRUCTURE - MAIN APPLICATION CONTROLLER
 * High-Frequency Simulation Loop, DOM Ladder Rendering & Telemetry Streams
 * ============================================================================
 */

(function (window) {
  'use strict';

  class HFTWorkstationApp {
    constructor() {
      this.lob = new window.LimitOrderBookEngine('BTC-PERP', 64250.00);
      this.hawkes = new window.HawkesProcessEngine();
      this.quantum = new window.QuantumRandomWalkDiffuser(35);
      this.depthHistory = [];
      this.activeView = 'view-dom';
      this.currentLang = 'en';

      this.initDOM();
      this.initEngines();
      this.bindEvents();
      this.startSimulationLoop();
    }

    initDOM() {
      this.canvasSurface = document.getElementById('canvas-surface');
      this.canvasQuantum = document.getElementById('canvas-quantum');
      this.domLadderBody = document.getElementById('dom-ladder-body');
      this.tradeTapeBody = document.getElementById('trade-tape-body');

      this.statMidPrice = document.getElementById('stat-mid-price');
      this.statSpread = document.getElementById('stat-spread');
      this.statObi = document.getElementById('stat-obi');
      this.statVpin = document.getElementById('stat-vpin');

      this.navButtons = document.querySelectorAll('.nav-item-btn');
      this.views = document.querySelectorAll('.view-container');
      this.terminalBody = document.getElementById('terminal-logs-body');
      this.terminalInput = document.getElementById('terminal-cli-input');
    }

    initEngines() {
      if (this.terminalBody && this.terminalInput) {
        this.cli = new window.CyberHFTCLI(this.terminalBody, this.terminalInput);
      }
    }

    bindEvents() {
      this.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const v = btn.getAttribute('data-view');
          this.switchView(v);
        });
      });

      const btnBuy = document.getElementById('btn-quick-buy');
      const btnSell = document.getElementById('btn-quick-sell');
      if (btnBuy) {
        btnBuy.addEventListener('click', () => {
          this.lob.executeMarketOrder('BUY', 1.0);
          this.hawkes.addEvent('BUY', performance.now() / 1000, 1.0);
        });
      }
      if (btnSell) {
        btnSell.addEventListener('click', () => {
          this.lob.executeMarketOrder('SELL', 1.0);
          this.hawkes.addEvent('SELL', performance.now() / 1000, 1.0);
        });
      }

      const btnLang = document.getElementById('btn-lang-toggle');
      if (btnLang) {
        btnLang.addEventListener('click', () => {
          this.currentLang = this.currentLang === 'en' ? 'ar' : 'en';
          document.body.classList.toggle('lang-ar', this.currentLang === 'ar');
          btnLang.textContent = this.currentLang === 'ar' ? 'English' : 'عربي';
        });
      }

      const btnTerm = document.getElementById('btn-toggle-terminal');
      const drawer = document.getElementById('terminal-drawer');
      if (btnTerm && drawer) {
        btnTerm.addEventListener('click', () => drawer.classList.toggle('minimized'));
      }
    }

    switchView(viewId) {
      this.navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewId);
      });
      this.views.forEach(v => {
        v.classList.toggle('active', v.id === viewId);
      });
      this.activeView = viewId;

      if (viewId === 'view-quantum' && this.canvasQuantum) {
        window.CanvasHFT.renderQuantumWave(this.canvasQuantum, this.quantum.probabilities);
      }
    }

    startSimulationLoop() {
      // 20Hz Tick generation for active market making
      setInterval(() => {
        // Stochastic order injection
        const rand = Math.random();
        const side = rand > 0.5 ? 'BUY' : 'SELL';
        const bestP = side === 'BUY' ? this.lob.getBestBid() : this.lob.getBestAsk();
        const offset = Math.floor(Math.random() * 8) * this.lob.tickSize;
        const price = +(side === 'BUY' ? bestP - offset : bestP + offset).toFixed(2);
        const qty = +(0.2 + Math.random() * 2.5).toFixed(3);

        this.lob.addLimitOrder(side, price, qty);

        // Occasional market sweep
        if (rand > 0.88) {
          const mSide = rand > 0.94 ? 'BUY' : 'SELL';
          const mQty = +(0.5 + Math.random() * 2.0).toFixed(3);
          this.lob.executeMarketOrder(mSide, mQty);
          this.hawkes.addEvent(mSide, performance.now() / 1000, mQty);
        }

        // Record snapshot for 3D liquidity canvas
        const ladder = this.lob.getDepthLadder(10);
        this.depthHistory.push(ladder);
        if (this.depthHistory.length > 40) this.depthHistory.shift();

        this.updateHUD();
        this.renderActiveView();
      }, 50);
    }

    updateHUD() {
      const obiData = this.lob.computeOBI(5);
      const vpin = this.hawkes.computeVPIN();

      if (this.statMidPrice) this.statMidPrice.textContent = `$${this.lob.midPrice.toFixed(2)}`;
      if (this.statSpread) this.statSpread.textContent = `$${obiData.spread.toFixed(2)}`;
      if (this.statObi) {
        this.statObi.textContent = `${(obiData.obi * 100).toFixed(1)}%`;
        this.statObi.style.color = obiData.obi >= 0 ? 'var(--bid-green)' : 'var(--ask-coral)';
      }
      if (this.statVpin) {
        this.statVpin.textContent = `${(vpin * 100).toFixed(1)}%`;
        this.statVpin.style.color = vpin > 0.35 ? 'var(--ask-coral)' : 'var(--emerald-400)';
      }
    }

    renderActiveView() {
      if (this.activeView === 'view-dom') {
        this.renderDOMLadder();
      } else if (this.activeView === 'view-surface' && this.canvasSurface) {
        window.CanvasHFT.renderLiquiditySurface(this.canvasSurface, this.depthHistory);
      }
    }

    renderDOMLadder() {
      if (!this.domLadderBody) return;
      const ladder = this.lob.getDepthLadder(12);

      let html = '';
      // Asks descending
      const reversedAsks = ladder.asks.slice().reverse();
      reversedAsks.forEach(a => {
        const barW = Math.min(100, Math.floor(a.qty * 20));
        html += `
          <tr class="row-ask">
            <td style="color: var(--ask-coral); font-weight: 700;">$${a.price.toFixed(2)}</td>
            <td style="color: var(--text-pure); text-align: right;">${a.qty.toFixed(3)}</td>
            <td><div class="vol-bar vol-bar-ask" style="width: ${barW}px;"></div></td>
            <td style="color: var(--text-tertiary); font-size: 10px;">ASK LEVEL</td>
          </tr>
        `;
      });

      // Spread row
      html += `
        <tr style="background: rgba(34, 211, 238, 0.08); border-top: 1px solid var(--cyan-500); border-bottom: 1px solid var(--cyan-500);">
          <td colspan="4" style="text-align: center; color: var(--cyan-400); font-weight: 700; padding: 4px;">
            SPREAD: $${(ladder.bestAsk - ladder.bestBid).toFixed(2)} | MID: $${this.lob.midPrice.toFixed(2)}
          </td>
        </tr>
      `;

      // Bids
      ladder.bids.forEach(b => {
        const barW = Math.min(100, Math.floor(b.qty * 20));
        html += `
          <tr class="row-bid">
            <td style="color: var(--bid-green); font-weight: 700;">$${b.price.toFixed(2)}</td>
            <td style="color: var(--text-pure); text-align: right;">${b.qty.toFixed(3)}</td>
            <td><div class="vol-bar vol-bar-bid" style="width: ${barW}px;"></div></td>
            <td style="color: var(--text-tertiary); font-size: 10px;">BID LEVEL</td>
          </tr>
        `;
      });

      this.domLadderBody.innerHTML = html;

      // Update Trade tape
      if (this.tradeTapeBody) {
        let tHtml = '';
        this.lob.tradeTape.slice(0, 8).forEach(t => {
          const color = t.takerSide === 'BUY' ? 'var(--bid-green)' : 'var(--ask-coral)';
          tHtml += `
            <div style="display: flex; justify-content: space-between; padding: 3px 0; font-family: var(--font-mono); font-size: 11px; border-bottom: 1px solid rgba(255,255,255,0.03);">
              <span style="color: ${color};">${t.takerSide}</span>
              <span style="color: var(--text-pure);">$${t.price.toFixed(2)}</span>
              <span style="color: var(--text-secondary);">${t.qty.toFixed(3)} BTC</span>
            </div>
          `;
        });
        this.tradeTapeBody.innerHTML = tHtml;
      }
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.App = new HFTWorkstationApp();
  });
})(window);
