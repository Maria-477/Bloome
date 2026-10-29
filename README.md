# Bloomé — Where Flowers Come to Life

Bloomé is a luxury floral atelier and gifting studio web application. It features real-time 3D interactive hand-tied bouquets rendered with Three.js and GSAP, dynamic gift configuration (chocolates, teddy bears, custom balloons), smooth scroll kinetics, and seamless checkout flows with PKR currency pricing.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMaria-477%2FBloome)

---

## ✨ Features

- **3D Bouquet Studio**: Fully interactive, procedural WebGL bouquet visualizer with bloom animations, mood shifts, and 360° rotation.
- **Gift Builder**: Pair flower arrangements with curated chocolates, plush teddy bears, and customizable foil balloons with custom messages.
- **Catalog & Collections**: Curated bouquet collections filterable by flower type, occasion, and aesthetics.
- **Story & Finale**: Interactive botanical stories and flower meanings.
- **Cart & Smooth Checkout**: Full cart drawer state management with delivery date selection and address validation.
- **Modern Responsive Design**: Editorial typography (*Cormorant Garamond*, *Jost*, *Allura*), Tailwind CSS v4 design tokens, and smooth Lenis scrolling.

---

## 🚀 Deploying to Vercel

Bloomé is pre-configured for zero-config deployment to [Vercel](https://vercel.com).

### Option 1: One-Click Deploy
Click the button below to deploy this repository directly to your Vercel account:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMaria-477%2FBloome)

### Option 2: Connect Existing GitHub Repository
1. Push this repository to your GitHub account.
2. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New"** &rarr; **"Project"**.
3. Select this repository from your Git providers.
4. Vercel will automatically detect:
   - **Framework Preset**: Next.js
   - **Build Command**: `next build` (or `npm run build`)
   - **Output Directory**: `.next`
   - **Install Command**: `npm ci`
5. Click **"Deploy"**. No environment variables are required for initial deployment!

---

## 💻 Local Development

### Prerequisites
- **Node.js**: `v20.0.0` or higher (Node 20 or Node 22 recommended)
- **Package Manager**: `npm` (v10+)

### Setup
```bash
# 1. Clone the repository
git clone https://github.com/Maria-477/Bloome.git
cd Bloome

# 2. Install dependencies (clean install)
npm ci

# 3. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Production Test
```bash
# Build the production bundle
npm run build

# Start the production server locally
npm start
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **3D Graphics**: [Three.js](https://threejs.org/)
- **Animations**: [GSAP](https://gsap.com/)
- **Smooth Scrolling**: [Lenis](https://lenis.darkroom.engineering/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: `@fontsource/cormorant-garamond`, `@fontsource-variable/jost`, `@fontsource/allura`

---

## 📄 License

Private / All Rights Reserved.
