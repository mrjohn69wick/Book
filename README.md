# 📊 Cumulative Chaos Measurements School — Interactive Trading Book
### *مدرسة قياسات الفوضى التراكمية — الكتاب التفاعلي للتداول الكمي*

<div align="center">

![Version](https://img.shields.io/badge/Version-3.0_PRODUCTION-brightgreen?style=for-the-badge)
![Science](https://img.shields.io/badge/Science-Cumulative_Chaos_Measurements-blue?style=for-the-badge)
![Team](https://img.shields.io/badge/Team-8%2B_Specialists-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-Academic_Research-purple?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live_&_Active-success?style=for-the-badge)

**🌐 Live Book #1 (Interactive):** [mrjohn69wick.github.io/Book](https://mrjohn69wick.github.io/Book/)

**🚀 Live Book #2 (Production Ready):** [mrjohn69wick.github.io/Book/trading-book-PRODUCTION-READY](https://mrjohn69wick.github.io/Book/trading-book-PRODUCTION-READY/)

</div>

---

## 🧬 What Is This Project?

This is **not** just another trading platform or chart-analysis tool.

This project is the **world's first interactive digital book** dedicated to teaching **Cumulative Chaos Measurements (CCM)** — a brand-new academic science developed in collaboration with the **Canadian Institute for Cumulative Chaos Measurements**.

> **Cumulative Chaos Measurements** is a complete, rigorous academic discipline capable of measuring and quantifying chaos in **any complex system** — not limited to financial markets. Its applications span economics, physics, biology, social systems, and beyond. Trading is simply one of its most powerful practical applications.

The book serves as both an educational platform and a quantitative trading tool — enabling **thousands of traders** to learn, practice, and apply CCM principles in real market conditions through a fully interactive, self-contained web experience.

---

## 🔬 The Science: Cumulative Chaos Measurements (CCM)

### What Makes CCM Different?

| Classical Technical Analysis | Cumulative Chaos Measurements |
|---|---|
| Pattern recognition on charts | Mathematical measurement of chaos accumulation |
| Subjective interpretation | Objective, quantifiable metrics |
| Market-specific signals | Universal — applicable to any chaotic system |
| Reactive indicators | Predictive chaos state modeling |
| No academic foundation | Full academic research framework |

### Core CCM Principles Applied in This Book

- **Cumulative Chaos Index (CCI):** Measures the total entropy accumulation over time in a given system
- **Chaos Threshold Zones:** Identifies critical boundaries where chaotic behavior transitions
- **Fractal Chaos Layers:** Multi-timeframe chaos measurement for nested analysis
- **Quantitative Chaos Scoring:** Assigns numerical scores to market states for algorithmic decision-making
- **Ziad Ikailan Method (V3):** Proprietary 236-step framework integrating CCM into live trading execution

---

## ✨ Key Features

### 📚 Interactive Educational Content
- Fully structured curriculum from fundamentals to advanced CCM
- Step-by-step laws and principles with interactive examples
- Glossary of all CCM terminology
- Built-in training modules and exercises

### 📈 Live Trading Integration
- **TradingView** chart widget integration (live market data)
- **MetaTrader 5 (MT5) WebTerminal** embedded directly in the book
- Real-time sample data visualization via bundled CSV datasets
- Custom indicators based on CCM principles

### 🔍 Advanced Navigation & Search
- Full-text search across all book content
- Hash-based routing for deep-linking to any section
- Available routes: `/`, `/learn`, `/laws`, `/glossary`, `/training`, `/chart`, `/mt5`, `/search`, `/settings`
- 404 redirect handling for seamless SPA experience

### ⚙️ Technical Excellence
- Built with **Vite + React** for blazing-fast performance
- Deployed via **GitHub Actions CI/CD** pipeline
- Fully responsive — desktop, tablet, and mobile ready
- Static hosting on **GitHub Pages** — zero backend cost
- Two parallel deployments: interactive (Vite build) + production-ready (static)

---

## 🏗️ Project Structure

```
Book/
├── .github/
│   └── workflows/
│       └── static.yml              # CI/CD deployment pipeline
│
├── trading-book-fixed/             # 📦 Interactive Book (Vite/React)
│   ├── src/
│   │   ├── components/             # UI components
│   │   ├── pages/                  # Route pages (learn, laws, chart, mt5...)
│   │   └── data/                   # CCM content & datasets
│   ├── public/
│   │   └── sample-data.csv         # Bundled market sample data
│   └── package.json
│
├── trading-book-PRODUCTION-READY/  # 🚀 Static Production Build
│   └── sample-data.csv             # Standalone data copy
│
├── BOOK_V3_COMBINED.md             # Full combined book content (V3)
├── Ziad_Ikailan_236_FULL_CONTEXT_BOOK_V3.md  # Complete 236-step CCM framework
├── indicator.txt                   # Custom CCM indicator definitions
├── FIX_REPORT.md                   # Development fix log
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **pnpm** (recommended package manager)

### Local Development

```bash
# Clone the repository
git clone https://github.com/mrjohn69wick/Book.git
cd Book

# Navigate to the interactive book
cd trading-book-fixed

# Install dependencies
pnpm install --frozen-lockfile

# Start development server
pnpm run dev
```

The app will be available at `http://localhost:5173` (or your configured Vite port).

### Production Build

```bash
# Build for production
pnpm run build

# Preview the production build
pnpm run preview
```

### Deployment

Deployment is **fully automated** via GitHub Actions:
- Push to `main` → triggers `static.yml` workflow
- Builds `trading-book-fixed/` with Vite
- Copies `trading-book-PRODUCTION-READY/` into the artifact
- Publishes everything to **GitHub Pages**

You can also trigger deployment manually from the **Actions** tab.

---

## 🌐 Live Deployments

| Environment | URL | Description |
|---|---|---|
| **Book #1** | [mrjohn69wick.github.io/Book/](https://mrjohn69wick.github.io/Book/) | Full interactive React SPA |
| **Book #2** | [mrjohn69wick.github.io/Book/trading-book-PRODUCTION-READY/](https://mrjohn69wick.github.io/Book/trading-book-PRODUCTION-READY/) | Static production-ready version |

> ⚠️ **Note:** MT5 WebTerminal and TradingView widgets require an active internet connection to function.

---

## 👥 Team

This project is built and maintained by a dedicated team of **8+ specialists**, including quantitative analysts, software engineers, CCM researchers, and trading educators — all collaborating under the direction of the project owner and principal researcher.

**Project Owner & Principal Researcher:** Ziad Ikailan

**Institutional Partner:** Canadian Institute for Cumulative Chaos Measurements

All team members have active access to the repository and contribute to ongoing research, content development, and technical implementation.

---

## 📖 Book Content Overview

The interactive book covers:

1. **Introduction to Chaos Theory in Markets** — From classical physics to financial systems
2. **Fundamentals of CCM** — Core laws and mathematical foundations
3. **The 236-Step Ziad Ikailan Framework** — Complete proprietary CCM trading methodology
4. **Quantitative Applications** — Algorithmic scoring and automated signal generation
5. **Live Chart Practice** — Apply CCM directly on live TradingView charts
6. **MT5 Integration** — Execute and monitor trades using CCM signals
7. **Glossary & Reference** — Complete CCM terminology dictionary
8. **Training Modules** — Progressive exercises for skill-building

---

## 🤝 Contributing

We welcome contributions from researchers, developers, and trading professionals who align with CCM principles.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add: amazing CCM feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 Academic Citation

If you use CCM concepts from this book in your research, please cite:

```
Ikailan, Z. (2025). Cumulative Chaos Measurements: A New Academic Framework
for Quantifying Chaos in Complex Systems. Canadian Institute for Cumulative
Chaos Measurements. https://mrjohn69wick.github.io/Book/
```

---

## 📄 License

This project and its content are protected under academic research copyright.
The CCM framework is the intellectual property of **Ziad Ikailan** and the
**Canadian Institute for Cumulative Chaos Measurements**.

The codebase is open-source for educational transparency. Commercial use of the
CCM methodology requires written authorization from the project owner.

---

<div align="center">

**Built with ❤️ by the Cumulative Chaos Measurements Team**

*"Measuring the unmeasurable — quantifying chaos for a better understanding of complex systems"*

[⭐ Star this repo](https://github.com/mrjohn69wick/Book) · [🐛 Report Bug](https://github.com/mrjohn69wick/Book/issues) · [💡 Request Feature](https://github.com/mrjohn69wick/Book/issues)

</div>
