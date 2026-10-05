/**
 * ============================================================================
 * QUANTUMFLOW HFT MICROSTRUCTURE - QUANTUM RANDOM WALK PRICE DIFFUSION
 * Hadamard Coin Operator, Ballistic Price Dispersion & Heavy-Tailed Jump Modeler
 * ============================================================================
 */

(function (window) {
  'use strict';

  class QuantumRandomWalkDiffuser {
    constructor(steps = 40) {
      this.steps = steps;
      this.probabilities = [];
      this.computeQuantumWalk(this.steps);
    }

    computeQuantumWalk(totalSteps = 40) {
      const N = 2 * totalSteps + 1;
      const origin = totalSteps;

      // State vector: for each position x, two amplitudes [up, down]
      let state = new Array(N);
      for (let i = 0; i < N; i++) state[i] = [0, 0];

      // Initial symmetric state at origin: (|0> + i|1>) / sqrt(2)
      state[origin] = [1 / Math.sqrt(2), 1 / Math.sqrt(2)];

      const invSqrt2 = 1 / Math.sqrt(2);

      for (let t = 0; t < totalSteps; t++) {
        const nextState = new Array(N);
        for (let i = 0; i < N; i++) nextState[i] = [0, 0];

        for (let x = 1; x < N - 1; x++) {
          const up = state[x][0];
          const down = state[x][1];

          // Hadamard coin operator
          const coinUp = (up + down) * invSqrt2;
          const coinDown = (up - down) * invSqrt2;

          // Shift operator: up moves right (x+1), down moves left (x-1)
          nextState[x + 1][0] += coinUp;
          nextState[x - 1][1] += coinDown;
        }
        state = nextState;
      }

      // Compute probability distribution P(x) = |up|^2 + |down|^2
      this.probabilities = [];
      for (let x = 0; x < N; x++) {
        const p = state[x][0] * state[x][0] + state[x][1] * state[x][1];
        this.probabilities.push({
          displacement: x - origin,
          probability: p
        });
      }

      return this.probabilities;
    }
  }

  window.QuantumRandomWalkDiffuser = QuantumRandomWalkDiffuser;
})(window);
