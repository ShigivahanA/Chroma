# 🎨 Chroma — Generative Color Exhibition & Design Suite

Chroma is a premium, free online generative color design application. It empowers creators, engineers, and designers to create, explore, analyze, and save beautiful color combinations with industrial-grade tools.

Built on a highly optimized, responsive neo-brutalist design system, Chroma operates entirely on client-side state with smooth micro-animations and acoustic synesthesia audio chimes.

---

## ✨ Core Feature Suite

### 1. 🎛️ Generative Color Studio (`/studio`)
* **Mathematical Randomizer**: Instantly generate cohesive 5-color palettes based on advanced seed algorithms.
* **Granular Lock & Adjust**: Lock your favorite swatches and adjust Hue, Saturation, and Lightness dynamically.
* **Acoustic Synesthesia**: Swapping and locking color channels triggers real-time synthesizer chimes to literally "hear" your composition.

### 2. 📷 Chromatic Lens (`/lens`)
* **Automatic Swatch Extraction**: Drag and drop any image or photograph to extract a gorgeous color palette instantly.
* **Extract Mood Filters**: Choose from five extraction algorithms (`Geometric`, `Vibrant`, `Muted`, `Dark`, `Light`) to auto-arrange coordinate pins.
* **Coordinate Pin Sampler**: Drag pins manually across the canvas to sample pixel-perfect colors in real-time with acoustic wave sweeps.

### 3. ⚡ Stark Contrast Diagnostics (`/contrast`)
* **Lightness Matrix**: Displays a complete combinations grid showing every color pairing from your palette as Background and Text.
* **WCAG Readability Scores**: Instantly calculates and categories contrast ratios into `Poor` (Hard to read), `Good` (Passes WCAG AA), or `Perfect` (Passes WCAG AAA).
* **Intelligent Auto-Fix**: One-click auto-nudges text brightness to make failing pairings readable or perfect *without* changing the color's core hue.

### 4. 🧪 Palette Morph & Gradient Sandbox (`/morph`)
* **Perceptually Uniform CIE L*a*b* Blending**: Mix start and end colors in D65 CIE L*a*b* uniform space, HSL hue-rotation space, or standard linear RGB to prevent muddy mid-stops.
* **Live Gradient Architect**: Switch shapes between `Linear`, `Radial`, and `Conic` with rotational angle adjustments.
* **Production CSS Export**: Instantly preview and copy fully optimized background CSS rules to your layout code.
* **Melody Cascader**: Sweep generated swatches through a cascading wave synth melody.

### 5. 📂 Curated Gallery (`/popular`)
* **10 Themed Categories**: Explore trending palettes cataloged under Industrial, Cyberpunk, Forest, Ocean, Sunset, Pastel, and more.
* **Global Voting & Cloning**: Upvote globally saved combinations and click "Clone to Studio" to load them directly into your editor.

### 6. 📬 Connect Terminal (`/connect`)
* Send direct feedback, design requests, and collaboration inquiries straight to the platform database.

---

## 🛠️ Technology Stack

* **Frontend Framework**: React 19 + Vite 8
* **Styling Engine**: TailwindCSS 4 (Vanilla CSS utility extensions)
* **Animation Engine**: Framer Motion
* **SEO Management**: React Helmet Async
* **Acoustics**: HTML5 Web Audio API Synth Oscillator Engine
* **Asset Bundler**: Vite client client bundler

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Local Dev Server
```bash
npm run dev
```

### 3. Build Production Bundle
```bash
npm run build
```

---

## 🌐 Google Indexing & SEO Compatibility
This application includes top-tier indexing protocols:
* **Fully Semantic HTML5 Structures**: Maximizes Google Search crawler reading.
* **Structured Data JSON-LD Schemas**: Enables Google Rich Search Snippets.
* **Custom Meta Canonicals & Open-Graph Headers**: Dynamic tag rendering on all pages via `react-helmet-async`.
* **Automated XML Sitemap**: Declares all routes (`/`, `/studio`, `/lens`, `/contrast`, `/morph`, `/popular`, `/connect`) with priority weights in `sitemap.xml`.
