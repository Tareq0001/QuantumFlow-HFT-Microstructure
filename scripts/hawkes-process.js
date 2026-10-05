/**
 * ============================================================================
 * QUANTUMFLOW HFT MICROSTRUCTURE - MULTIVARIATE HAWKES PROCESS & TOXICITY
 * Self-Exciting Cascades, Branching Ratio & Volume-Synchronized Toxicity (VPIN)
 * ============================================================================
 */

(function (window) {
  'use strict';

  class HawkesProcessEngine {
    constructor() {
      // Baseline arrival intensities (events/sec)
      this.muBuy = 1.8;
      this.muSell = 1.8;

      // Excitation parameters
      this.alpha = 3.2; // Self-excitation strength
      this.beta = 4.8;  // Exponential decay rate
      this.crossAlpha = 1.1; // Cross-excitation (buy excites sell)

      this.eventHistoryBuy = [];
      this.eventHistorySell = [];
      this.vpinBuckets = [];
      this.bucketSize = 50; // volume per bucket
      this.currentBucket = { buyVol: 0, sellVol: 0 };
    }

    addEvent(side, timestampSec, volume) {
      if (side === 'BUY') {
        this.eventHistoryBuy.push(timestampSec);
        this.currentBucket.buyVol += volume;
      } else {
        this.eventHistorySell.push(timestampSec);
        this.currentBucket.sellVol += volume;
      }

      // Check VPIN bucket completion
      const totalVolInBucket = this.currentBucket.buyVol + this.currentBucket.sellVol;
      if (totalVolInBucket >= this.bucketSize) {
        const imbalance = Math.abs(this.currentBucket.buyVol - this.currentBucket.sellVol);
        this.vpinBuckets.push(imbalance / totalVolInBucket);
        if (this.vpinBuckets.length > 30) this.vpinBuckets.shift();
        this.currentBucket = { buyVol: 0, sellVol: 0 };
      }

      // Keep recent 5 seconds history
      const cutoff = timestampSec - 5.0;
      this.eventHistoryBuy = this.eventHistoryBuy.filter(t => t >= cutoff);
      this.eventHistorySell = this.eventHistorySell.filter(t => t >= cutoff);
    }

    computeCurrentIntensity(t) {
      let lambdaBuy = this.muBuy;
      let lambdaSell = this.muSell;

      // Self-excitation for buy
      for (let i = 0; i < this.eventHistoryBuy.length; i++) {
        const dt = t - this.eventHistoryBuy[i];
        if (dt > 0) {
          lambdaBuy += this.alpha * Math.exp(-this.beta * dt);
          lambdaSell += this.crossAlpha * Math.exp(-this.beta * dt);
        }
      }

      // Self-excitation for sell
      for (let i = 0; i < this.eventHistorySell.length; i++) {
        const dt = t - this.eventHistorySell[i];
        if (dt > 0) {
          lambdaSell += this.alpha * Math.exp(-this.beta * dt);
          lambdaBuy += this.crossAlpha * Math.exp(-this.beta * dt);
        }
      }

      // Branching ratio eta = alpha / beta
      const branchingRatio = this.alpha / this.beta;
      const isCascadeCritical = branchingRatio >= 0.95 || Math.abs(lambdaBuy - lambdaSell) > 15;

      return {
        lambdaBuy: +lambdaBuy.toFixed(2),
        lambdaSell: +lambdaSell.toFixed(2),
        totalIntensity: +(lambdaBuy + lambdaSell).toFixed(2),
        branchingRatio: +branchingRatio.toFixed(3),
        isCascadeCritical
      };
    }

    computeVPIN() {
      if (this.vpinBuckets.length < 5) return 0.22;
      const sum = this.vpinBuckets.reduce((a, b) => a + b, 0);
      return +(sum / this.vpinBuckets.length).toFixed(3);
    }
  }

  window.HawkesProcessEngine = HawkesProcessEngine;
})(window);
