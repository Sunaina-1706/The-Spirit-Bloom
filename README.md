# 🌼 The Spirit Bloom

**Every memory leaves a flower behind.**

The Spirit Bloom is an interactive digital art experience and emotional memory sanctuary inspired by Día de los Muertos, marigolds (*cempasúchil*), and the spirit of remembrance. It transforms personal memories, dreams, and feelings into 12 distinct procedural digital flowers with personalized symbolism and poetry.

Repository: **[https://github.com/Sunaina-1706/The-Spirit-Bloom](https://github.com/Sunaina-1706/The-Spirit-Bloom)**

---

## ✨ Key Features

- 🌸 **12 Unique Procedural Flower Species** — Genuinely distinct anatomical visual models with species-specific petal shapes, multi-tier arrangements, custom centers, and foliage:
  1. **Marigold (`cempasúchil`)** — Dense, ruffled multi-tiered scalloped petals & feathery leaves (*Remembrance & Warmth*)
  2. **Rose (`rose`)** — Overlapping cup petals and central bud spiral whorl (*Love & Longing*)
  3. **Moonflower (`moonflower`)** — Luminous circular fluted star-disc with starlight ribs (*Mystery & Dreams*)
  4. **Bluebell (`bluebell`)** — Gracefully nodding arched raceme with hanging bell florets (*Nostalgia & Humility*)
  5. **Sunflower (`sunflower`)** — Giant dark seed disc with phyllotaxis spiral dots & 26 golden ray petals (*Joy & Hope*)
  6. **Lavender (`lavender`)** — Slender upright spike with 7 tiered whorls of tubular florets (*Peace & Healing*)
  7. **White Lily (`white_lily`)** — 6 reflexed pointed tepals with 6 protruding anther stamens (*Purity & Remembrance*)
  8. **Cherry Blossom (`cherry_blossom`)** — 5 notched petals with distinct V-clefts & central stamen ring (*Fleeting Moments & Change*)
  9. **Forget-me-not (`forget_me_not`)** — 5 rounded sky-blue petals with pentagonal yellow eye (*Cherished Memories*)
  10. **Nightshade Fantasy (`nightshade`)** — 5 reflexed star petals with forward golden beak cone (*Mystery & Transformation*)
  11. **Ghost Orchid (`ghost_orchid`)** — Translucent sepals with frog-like labellum & long trailing ribbon tendrils (*Solitude & The Unknown*)
  12. **Crimson Dahlia (`crimson_dahlia`)** — Geometric rosette with 4 tiers of quilled pointed petals (*Strength & Resilience*)

- 🧠 **Dual Engine: WebLLM In-Browser AI & Local Contextual Analyzer**:
  - **In-Browser WebGPU AI**: Interprets the memory with client-side LLM inference (`Qwen2.5-0.5B`) without any API keys or servers.
  - **Smart Local Fallback**: Comprehensive emotional keyword and context analyzer matching memories to appropriate candidate species with 100% offline reliability.
- ✦ **"Grow Another Bloom" Variation**:
  - Cycle through alternative suitable candidate species and distinct poetry variations for the same memory without having to retype.
- 📝 **Dynamic Poetry & Evocative Titles**:
  - Composes original 4-line verses and poetic Spanish/English titles tailored to the emotion, imagery, and species.
- 🕯️ **Atmospheric Día de los Muertos Aesthetic**:
  - Obsidian and deep purple backdrop, floating glowing embers, and animated candle flames.
- 💾 **"My Blooms" Gallery**:
  - Saved in browser `localStorage` with species-specific mini SVG thumbnails.
  - Click any card to open a full modal inspection with zoom, emotional meaning, and poem.
- 🖼️ **Save as Image**:
  - Export any flower as a high-resolution PNG image with title and species attribution.
- 🔒 **100% Private & Local**:
  - Memories are processed directly in your browser. Nothing is sent to any external server or saved unless you explicitly save the flower to your local gallery.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES Modules), CSS3, Procedural SVG
- **Backend / Server**: Node.js, Express.js (static serving over HTTP)
- **AI Inference**: WebLLM (`@mlc-ai/web-llm` via CDN, WebGPU hardware acceleration)
- **Storage**: Browser `localStorage` (client-side only, no external database required)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18+ recommended)
- npm (bundled with Node.js)

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/Sunaina-1706/The-Spirit-Bloom.git
   ```

2. Navigate into the directory:
   ```bash
   cd The-Spirit-Bloom
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open your browser and visit:
   ```text
   http://localhost:3000
   ```

---

## 📁 Project Structure

```text
The-Spirit-Bloom/
├── server.js          # Express server for HTTP static serving
├── package.json       # Project dependencies and npm start script
├── package-lock.json  # Dependency lockfile
├── index.html         # Main app layout, stage, and gallery modal
├── style.css          # Dark mystical theme, candle animations, and card grid
├── script.js          # 12 SVG renderers, WebLLM integration, emotional analyzer
├── .gitignore         # Excludes node_modules and logs
└── README.md          # Project documentation
```

---

## 📄 License

This project is created for personal, educational, and creative remembrance. Feel free to explore and build upon it!
