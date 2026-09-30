# Infican

## 🚀 Overview

**Infican** is an infinite canvas application built with **React 19**, **TypeScript**, and **Tailwind CSS v4**. It features an adaptive coordinate system, a custom zero-dependency 3D STL viewer running directly on an HTML5 2D canvas, and a Figma-style spatial commenting and review system.

## 🎮 Canvas Controls & Shortcuts

| Action                       | Control / Shortcut                                                          |
| :--------------------------- | :-------------------------------------------------------------------------- |
| **Pan Canvas**               | Left-click & drag on empty canvas / Middle-click drag / Right-click drag    |
| **Pan Canvas (Trackpad)**    | Two-finger swipe                                                            |
| **Zoom In / Out (Trackpad)** | Pinch gesture (anchored to cursor midpoint)                                 |
| **Zoom In / Out (Mouse)**    | Mouse wheel scroll (anchored to cursor)                                     |
| **Place Comment Pin**        | Click `+` button in sidebar header, then click anywhere on canvas           |
| **Cancel / Close Modal**     | <kbd>Escape</kbd> (cancels active draft, pin placement, or selected thread) |
| **Recenter Origin**          | Click **Reset View** / Zoom indicator button in bottom-left controls        |
| **Import 3D STL Model**      | Drag and drop any `.stl` file from your desktop onto the canvas             |

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vite.dev/)
- **Language**: [TypeScript 5.7](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Unit Testing**: [Vitest 5](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)
- **E2E Testing**: [Playwright](https://playwright.dev/)

---

## 📁 Project Structure

```text
infican/
├── e2e/                             # Playwright end-to-end tests
│   └── comments.spec.ts             # E2E test suites for canvas & comments
├── public/                          # Static public assets (cat.jpg, freezer.stl)
├── src/
│   ├── components/
│   │   ├── canvas/                  # Canvas UI controls & placement banner
│   │   │   ├── CanvasControls.tsx
│   │   │   └── PlacementBanner.tsx
│   │   ├── comments/                # Spatial commenting UI
│   │   │   ├── editor/              # Inline comment editor
│   │   │   ├── panel/               # Sidebar drawer, header, filter tabs, drafts
│   │   │   ├── pin/                 # Canvas pin anchors and hover tooltips
│   │   │   └── thread/              # Thread cards, reply list, reply form
│   │   └── Canvas.tsx               # Main HTML5 Canvas container & event router
│   ├── data/                        # Bundled demo items and base64 STL data
│   ├── hooks/                       # Reusable custom hooks
│   │   ├── useCamera.ts             # Pan, zoom, coordinates & mouse interaction
│   │   ├── useCameraFly.ts          # Smooth animated camera interpolation
│   │   └── useComments.ts           # State machine for comments & thread lifecycle
│   ├── services/                    # LocalStorage persistence & demo seeds
│   ├── types/                       # TypeScript interfaces (canvas, items, comments)
│   ├── utils/
│   │   ├── canvas.ts                # Screen-to-world and world-to-screen transforms
│   │   ├── canvasRenderer.ts        # 60fps canvas render pipeline & 3D projection
│   │   ├── comment.ts               # Date formatters and avatar hash generator
│   │   └── stlParser.ts             # Binary and ASCII STL mesh parser
│   ├── App.tsx                      # Root application layout
│   └── main.tsx                     # Vite React entry point
├── playwright.config.ts             # Playwright configuration
├── vite.config.ts                   # Vite configuration
└── vitest.config.ts                 # Vitest test runner configuration
```

---

## 🚦 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/infican.git
cd infican
npm install
```

### Running the Development Server

Start the local Vite development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 🧪 Testing & Verification

### Unit & Component Tests (Vitest)

Run the test suite in single-run mode:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

### End-to-End Tests (Playwright)

Run headless end-to-end tests:

```bash
npm run test:e2e
```

Launch the interactive Playwright UI mode:

```bash
npm run test:e2e:ui
```

### Production Build

Type-check and bundle the project for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```
