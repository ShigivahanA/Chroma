# 🎨 Chroma — Unified Color Palette Generative Exhibition & Lab Suite

Welcome to **Chroma**, a unified, full-stack design application engineered to generate, explore, analyze, and save beautiful color combinations.

Chroma combines a responsive neo-brutalist React client interface with an industrial Express/MongoDB backend service to build a complete color design suite.

---

## 📂 Repository Architecture

```text
Chroma/
├── root_workspace/
│   ├── frontend/             # React 19 + Vite 8 App (Client)
│   └── backend/              # Node.js + Express + MongoDB Server (REST API)
```

---

## ✨ System Features

### 1. 🎛️ Generative Color Studio (`/studio`)
* **Color Blending Engine**: Randomize, swap, and lock 5-color palettes based on advanced generative seeds.
* **Aesthetic Adjustments**: Granularly fine-tune swatches in HSL, RGB, and Hex spaces.
* **Acoustic Synesthesia**: Real-time chimes play when swatches are locked or swapped, helping creators literally "hear" their color compositions.

### 2. 📷 Chromatic Lens (`/lens`)
* **Image Color Extraction**: Drop any image file (PNG, JPG, SVG) to extract an instant color palette.
* **Mood Filters**: Switch between `Geometric`, `Vibrant`, `Muted`, `Dark`, and `Light` mood filters to auto-position coordinates.
* **Drag-and-Sample Pins**: Drag coordinate pins manually across the imported image canvas with real-time color grabs and synth sweeps.

### ⚡ 3. Stark Contrast diagnostics (`/contrast`)
* **Readability Combinations Matrix**: Inspects every color pairing from your palette as Background and Text.
* **WCAG Compliance Scores**: Calculates contrast ratios into `Poor` (Hard to read), `Good` (Passes WCAG AA), or `Perfect` (Passes WCAG AAA).
* **Intelligent Auto-Fix**: One-click auto-nudge tool tweaks brightness until text is perfectly readable *without* changing the core hue.

### 🧪 4. Palette Morph & Gradient Sandbox (`/morph`)
* **Perceptually Uniform Mixing**: Blend start and end nodes in uniform D65 CIE L*a*b* space, cylindrical HSL, or linear RGB.
* **Responsive Gradient Architect**: Build and rotate Linear, Radial, or Conic gradients with dynamic stop controls.
* **Production Code Export**: Preview gradients live and click "Copy CSS" to export fully optimized background styles.
* **Synthesized Cascade Sweep**: Cascade the generated stops through a sweeping synth melody.

### 📂 5. Global Gallery (`/popular`)
* **10 Themed Galleries**: Save and discover palettes categorized by Sunset, Cyberpunk, Forest, Minimalist, Ocean, and more.
* **Global Likes & Clone**: Upvote saved combinations and click "Clone to Studio" to load them directly into your color canvas.

### 📬 6. Connect Portal (`/connect`)
* Reach out directly to platform designers with feedback or collaboration requests.

---

## 🛠️ Technology Stack

### Frontend (React Client)
* **Framework**: React 19 + Vite 8
* **Styling**: TailwindCSS 4 (Vanilla CSS utility extensions)
* **Animation**: Framer Motion
* **Acoustics**: HTML5 Web Audio API Synth Engine
* **SEO**: React Helmet Async (Dynamic canoncials, descriptions, open-graph metadata)

### Backend (API Server)
* **Framework**: Node.js + Express
* **Database**: MongoDB + Mongoose ODM
* **Data Flow**: REST API architecture with unified routing

---

## 🚀 Setup & Launch

### 1. Launch Backend Server
```bash
cd backend
npm install
npm start
```
*Server runs locally on:* `http://localhost:5000`

### 2. Launch Frontend Client
```bash
cd frontend
npm install
npm run dev
```
*Client runs locally on:* `http://localhost:5173`

---

## 🌐 Google Search Console & Indexing Compatibility
This codebase is fully prepared for priority Google Indexing:
1. **XML Sitemap**: Standard, weight-optimized sitemap at `frontend/public/sitemap.xml` lists all paths with priority weights.
2. **Dynamic Meta Headers**: Dynamic canonical URLs and description tags rendered per-page by `react-helmet-async`.
3. **Structured JSON-LD Schema**: Embedded in `index.html` to generate Google search rich snippets for all generator features.
