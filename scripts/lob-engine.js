/**
 * ============================================================================
 * QUANTUMFLOW HFT MICROSTRUCTURE - LIMIT ORDER BOOK (LOB) MATCHING ENGINE
 * Sub-Microsecond Double Auction, Price-Time Priority (FIFO) & Depth Ladder
 * ============================================================================
 */

(function (window) {
  'use strict';

  class LimitOrderBookEngine {
    constructor(symbol = 'BTC-PERP', initialPrice = 64250.00) {
      this.symbol = symbol;
      this.midPrice = initialPrice;
      this.tickSize = 0.50;

      // Price levels: price -> Array of orders
      this.bids = new Map(); // Sorted descending
      this.asks = new Map(); // Sorted ascending
      this.tradeTape = [];
      this.orderIdCounter = 100000;

      this.seedInitialBook();
    }

    seedInitialBook() {
      // Seed 20 bid levels and 20 ask levels
      for (let i = 1; i <= 20; i++) {
        const bidPrice = +(this.midPrice - i * this.tickSize).toFixed(2);
        const askPrice = +(this.midPrice + i * this.tickSize).toFixed(2);
        const bidQty = +(0.5 + Math.random() * 4.5).toFixed(3);
        const askQty = +(0.5 + Math.random() * 4.5).toFixed(3);

        this.addLimitOrder('BUY', bidPrice, bidQty);
        this.addLimitOrder('SELL', askPrice, askQty);
      }
    }

    addLimitOrder(side, price, qty) {
      const order = {
        id: ++this.orderIdCounter,
        side,
        price,
        qty,
        timestampNs: performance.now() * 1000000
      };

      const book = side === 'BUY' ? this.bids : this.asks;
      if (!book.has(price)) {
        book.set(price, []);
      }
      book.get(price).push(order);
      return order;
    }

    executeMarketOrder(side, qty) {
      let remainingQty = qty;
      const fills = [];
      const oppositeBook = side === 'BUY' ? this.asks : this.bids;
      const sortedPrices = this.getSortedPrices(side === 'BUY' ? 'SELL' : 'BUY');

      for (const p of sortedPrices) {
        if (remainingQty <= 0) break;
        const ordersAtPrice = oppositeBook.get(p);

        while (ordersAtPrice.length > 0 && remainingQty > 0) {
          const matchOrder = ordersAtPrice[0];
          const matchedQty = Math.min(remainingQty, matchOrder.qty);

          matchOrder.qty = +(matchOrder.qty - matchedQty).toFixed(3);
          remainingQty = +(remainingQty - matchedQty).toFixed(3);

          const fill = {
            tradeId: ++this.orderIdCounter,
            price: p,
            qty: matchedQty,
            takerSide: side,
            timestamp: Date.now()
          };
          fills.push(fill);
          this.tradeTape.unshift(fill);
          if (this.tradeTape.length > 50) this.tradeTape.pop();

          if (matchOrder.qty <= 0) {
            ordersAtPrice.shift();
          }
        }

        if (ordersAtPrice.length === 0) {
          oppositeBook.delete(p);
        }
      }

      this.updateMidPrice();
      return fills;
    }

    getSortedPrices(side) {
      if (side === 'BUY') {
        return Array.from(this.bids.keys()).sort((a, b) => b - a);
      } else {
        return Array.from(this.asks.keys()).sort((a, b) => a - b);
      }
    }

    getBestBid() {
      const sorted = this.getSortedPrices('BUY');
      return sorted.length > 0 ? sorted[0] : this.midPrice - this.tickSize;
    }

    getBestAsk() {
      const sorted = this.getSortedPrices('SELL');
      return sorted.length > 0 ? sorted[0] : this.midPrice + this.tickSize;
    }

    updateMidPrice() {
      const bb = this.getBestBid();
      const ba = this.getBestAsk();
      if (bb && ba) {
        this.midPrice = +((bb + ba) / 2).toFixed(2);
      }
    }

    /**
     * Compute Order Book Imbalance (OBI) across top N levels
     */
    computeOBI(levels = 5) {
      const bidPrices = this.getSortedPrices('BUY').slice(0, levels);
      const askPrices = this.getSortedPrices('SELL').slice(0, levels);

      let bidVol = 0;
      let askVol = 0;

      bidPrices.forEach(p => {
        (this.bids.get(p) || []).forEach(o => { bidVol += o.qty; });
      });
      askPrices.forEach(p => {
        (this.asks.get(p) || []).forEach(o => { askVol += o.qty; });
      });

      const total = bidVol + askVol;
      const obi = total > 0 ? (bidVol - askVol) / total : 0;
      return {
        obi: +obi.toFixed(4),
        bidVol: +bidVol.toFixed(2),
        askVol: +askVol.toFixed(2),
        spread: +(this.getBestAsk() - this.getBestBid()).toFixed(2),
        microPrice: +(this.getBestBid() + (askVol / (bidVol + askVol || 1)) * (this.getBestAsk() - this.getBestBid())).toFixed(2)
      };
    }

    getDepthLadder(levels = 15) {
      const bidPrices = this.getSortedPrices('BUY').slice(0, levels);
      const askPrices = this.getSortedPrices('SELL').slice(0, levels);

      const bids = bidPrices.map(p => {
        const qty = (this.bids.get(p) || []).reduce((a, b) => a + b.qty, 0);
        return { price: p, qty: +qty.toFixed(3) };
      });

      const asks = askPrices.map(p => {
        const qty = (this.asks.get(p) || []).reduce((a, b) => a + b.qty, 0);
        return { price: p, qty: +qty.toFixed(3) };
      });

      return { bids, asks, bestBid: this.getBestBid(), bestAsk: this.getBestAsk() };
    }
  }

  window.LimitOrderBookEngine = LimitOrderBookEngine;
})(window);
