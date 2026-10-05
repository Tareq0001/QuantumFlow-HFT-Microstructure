# QuantumFlow HFT Microstructure ⚡📈

> **High-Frequency Trading Limit Order Book (LOB), Multivariate Hawkes Process Cascades & Quantum Walk Diffuser**  
> *Built under the Cyber-Emerald Obsidian Workstation Architecture.*  
> **Author & Lead Quant Architect:** أ. طارق ابوعشي (`Tareq0001`)

[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](LICENSE)
[![Latency: Sub--Microsecond](https://img.shields.io/badge/Latency-Sub--Microsecond-00ff88.svg)](#)
[![Deployment: GitHub Pages](https://img.shields.io/badge/Deployment-gh--pages-fb7185.svg)](https://tareq0001.github.io/QuantumFlow-HFT-Microstructure/)

---

## 🏛️ System Overview

**QuantumFlow HFT Microstructure** provides an institutional-grade simulation workstation for quantitative researchers, algorithmic traders, and market microstructure engineers. It simulates full Level-3 limit order book dynamics with sub-microsecond matching speed, self-exciting Hawkes cascades, and quantum random walk price diffusion.

### 🔬 Mathematical Foundations

1. **Multivariate Self-Exciting Hawkes Process:**
   $$\lambda_m(t) = \mu_m + \sum_{n=1}^M \int_0^t \alpha_{mn} e^{-\beta_{mn}(t - s)} dN_n(s)$$
   Models the feedback loop where an aggressive taker order triggers a avalanche of quote cancellations and follow-up executions.
2. **Order Book Imbalance (OBI) & Micro-Price:**
   $$OBI_t = \frac{V_t^b - V_t^a}{V_t^b + V_t^a}, \quad P_t^{\text{micro}} = P_t^b + \frac{V_t^a}{V_t^b + V_t^a} (P_t^a - P_t^b)$$
3. **Discrete Quantum Random Walk:**
   Using the Hadamard coin operator $\hat{H} = \frac{1}{\sqrt{2}} \begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$, prices spread ballistically ($\sigma \propto t$) rather than diffusively ($\sigma \propto \sqrt{t}$), naturally modeling heavy-tailed jump dynamics.

---

## 🚀 Live Demo & Deployment
- **Live Workstation:** [https://tareq0001.github.io/QuantumFlow-HFT-Microstructure/](https://tareq0001.github.io/QuantumFlow-HFT-Microstructure/)
- **Repository:** [Tareq0001/QuantumFlow-HFT-Microstructure](https://github.com/Tareq0001/QuantumFlow-HFT-Microstructure)

---

## 💻 Quant REPL Commands

| Command | Usage | Description |
|---|---|---|
| `help` | `help` | Show HFT CLI command manual |
| `market` | `market BUY 1.5` | Inject aggressive market order |
| `hawkes` | `hawkes` | Display current self-excitation intensities |
| `vpin` | `vpin` | Calculate Volume-Synchronized Probability of Toxicity |
| `benchmark` | `benchmark` | Run 1,000,000 order matching throughput benchmark |
| `clear` | `clear` | Clear terminal logs |

---

## 📄 License
MIT License. Built by أ. طارق ابوعشي.
