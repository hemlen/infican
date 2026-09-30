# Architecture & Product Decisions

A straightforward guide to why Infican was built the way it was. Written so anyone on the team—including junior developers—can quickly understand our core design and technical choices.

---

## 💡 What is Infican?

Infican is a Figma-like **infinite canvas** where you can pan around, zoom in/out, place 3D models and images, and click anywhere to leave feedback comments directly pinned to specific spots.

---

## 🎨 Product Decisions (How it looks and feels)

### 1. Canvas Pins + Sidebar Drawer (Instead of just a comment list)
* **What we did:** When you add a comment, an avatar pin appears directly on the canvas at that exact spot, and the full discussion appears in a right-hand sidebar.
* **Why:** In design and 3D review, saying *"fix this corner"* is useless unless you can see which corner. Pins give spatial context, while the sidebar keeps all threads easy to scroll through, search, and manage.
* **How they connect:** Clicking a pin opens that thread in the sidebar. Clicking a thread in the sidebar flies the camera to that pin on the canvas.

### 2. Smart Pin Scaling (Why pins don't balloon when zooming)
* **What we did:** When you zoom in close to inspect details, pins don't blow up into giant circles that hide your work. When you zoom far out, pins shrink a little so they don't cover the whole screen.
* **Why:** If a pin stayed 100% attached to world size, zooming in 10x would make it 400 pixels wide. By capping its maximum size, it stays easy to click without getting in the way.

### 3. Two-Step Comment Placement (No accidental empty comments)
* **What we did:** To leave a comment:
  1. Click the `+` button in the header (your mouse becomes a crosshair).
  2. Click anywhere on the canvas to drop a temporary blue pin.
  3. Type your comment in the sidebar draft card and hit **Post**.
* **Why:** If clicking the canvas immediately created a saved comment in the database, users would leave behind empty "ghost" comments whenever they changed their mind. With this flow, pressing `Esc` simply cancels the draft with zero cleanup needed.

### 4. Centered Camera Flight (`useCameraFly`)
* **What we did:** When you click a comment in the sidebar, the camera smoothly glides to that pin over 350ms.
* **Why the math matters:** The right sidebar takes up 384px of width. If the camera centered on the exact middle of the screen, the pin would hide right behind the sidebar! We shift the camera slightly to the left so the pin lands dead center in the visible workspace.

### 5. Quick Persona Switcher (No login wall)
* **What we did:** At the top of the comments panel, there's a simple name input. Anyone can type a name (e.g. "Sarah", "Alex", "Client") and instantly post as that person.
* **Why:** During early development, demos, and testing, a full login/signup flow just slows people down. Deterministic avatar colors (each name gets its own consistent color) make it feel like a real team conversation.

### 6. "Open" vs "Resolved" Comments (Don't delete history)
* **What we did:** When an issue is fixed, you click "Resolve" instead of deleting it. It disappears from the canvas, but moves into the "Resolved" tab in the sidebar.
* **Why:** Teams frequently ask *"Why did we change this design two weeks ago?"* Keeping resolved comments gives an audit trail without cluttering the active canvas.

---

## ⚙️ Technical Decisions (How the code works)

### 1. Hybrid Rendering: HTML5 2D Canvas + HTML Overlay
* **The Problem:** Should we build the infinite canvas with regular React `<div>` tags, a 3D library (Three.js), or HTML5 Canvas?
* **Our Decision:**
  - **The background, grid, and 3D models** are drawn on a single HTML5 2D `<canvas>` element. This easily runs at 60 frames per second without slowing down the browser.
  - **The comment pins and sidebar** are regular React HTML components floating on top (`pointer-events-none` on the container so clicks pass through to the canvas).
* **Why:** React `<div>` tags make accessible buttons, text inputs, and hover cards super easy to build. The canvas does the heavy lifting for graphics. It's the best of both worlds.

### 2. Zero-Dependency 3D STL Viewer (No Three.js)
* **The Problem:** We wanted users to drag-and-drop `.stl` 3D files onto the canvas, but adding Three.js adds over 600 KB to the download size and brings WebGL complexity.
* **Our Decision:** We wrote a lightweight parser in `src/utils/stlParser.ts` and a 2D projection renderer in `src/utils/canvasRenderer.ts`.
* **How it works in plain English:**
  1. It reads the binary or text file to get the list of 3D triangles.
  2. It rotates the 3D points $(X, Y, Z)$ using simple trigonometry.
  3. It ignores triangles facing backwards (backface culling).
  4. It shades each triangle lighter or darker based on a virtual light source.
  5. It sorts triangles from furthest to closest (Painter's algorithm) and draws them with `ctx.fill()`.
* **Result:** Fast 3D models with zero external dependencies.

### 3. Trackpad vs. Mouse Wheel Zoom
* **The Problem:** Mac trackpads and physical PC mouse wheels send completely different scroll signals. Trackpads send hundreds of tiny numbers per second; mouse wheels send big notched jumps of 100.
* **Our Decision:** In `Canvas.tsx`, we inspect the event:
  - If it's a **trackpad pinch** (`ctrlKey = true`): We zoom smoothly using small multipliers.
  - If it's a **two-finger swipe** (`ctrlKey = false`): We pan the canvas (just like Figma and Miro).
  - If it's a **notched mouse wheel**: We zoom into the cursor with acceleration so scrolling fast moves you further.

### 4. Adaptive Dot Grid (How we prevent lag)
* **The Problem:** If you zoom out really far on an infinite grid, drawing millions of dots will freeze the browser. If you zoom in really close, the dots get too far apart.
* **Our Decision:** In `canvasRenderer.ts`, we dynamically double or halve the grid spacing (`gridSize *= 2` or `/ 2`) so on-screen dots are always between 20px and 80px apart. We also added a hard safety limit: if there are more than 300 dots across, we don't draw them.

### 5. Screen Coordinates vs. World Coordinates
* **The Problem:** When a user clicks at pixel $(500, 300)$ on their monitor, what point is that on our infinite canvas?
* **Our Decision:** We keep all math in two simple helper functions in `src/utils/canvas.ts`:
  - `screenToWorld(point, camera)`: Converts mouse clicks on the window into canvas world coordinates. We save this in the comment object so it stays anchored forever.
  - `worldToScreen(point, camera)`: Converts saved world coordinates back to pixel positions on the user's screen depending on where they've panned and zoomed.

### 6. Safe LocalStorage with Fallbacks
* **The Problem:** If someone edits `localStorage` or old data has missing fields, the app could crash with `Cannot read properties of undefined` or `NaN`.
* **Our Decision:** In `src/services/commentStorage.ts`, we run a `sanitizeThreads()` function whenever data is loaded. If an $(x, y)$ coordinate is `NaN` or invalid, it falls back to $(0, 0)$. If localStorage is empty, it automatically loads our friendly demo comments. There's also a "Reset demo" button in the footer to reset everything anytime.

### 7. Automated Testing (Vitest & Playwright)
* **Unit Tests (`npm test`):** Vitest tests our data validation, coordinate sanitizing, and tab filtering to ensure logic never breaks.
* **End-to-End Tests (`npm run test:e2e`):** Playwright opens a real browser and automatically tests:
  1. Opening and collapsing the sidebar.
  2. Clicking the canvas to place a pin and posting a comment.
  3. Replying to a thread and clicking "Resolve".

---

## 🚀 Summary Checklist for Developers

When you are adding new features to Infican, remember these simple rules:

1. **Always store coordinates in World space** (not screen pixel space). Use `screenToWorld` when capturing mouse input.
2. **Never put slow React state updates inside the 60 FPS canvas loop**. Keep the canvas render cycle separate from standard React re-renders.
3. **Keep pins lightweight**. Interactive UI belongs in the DOM overlay or sidebar; visual drawing belongs on the 2D canvas.
4. **Test your changes with both a trackpad and a mouse** to ensure navigation feels natural on both.
