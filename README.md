# Draggable Widget Dashboard POC

This project is a high-performance Proof of Concept (POC) demonstrating a complex, professional-grade drag-and-drop dashboard interface. It mimics the behavior of advanced trading and analytics platforms, allowing users to move, dock, tab, and resize individual widget windows dynamically.

## Features

- **Docking Layout**: Powered by `flexlayout-react`, you can drag windows to the edges of other panes to automatically split the layout horizontally or vertically.
- **Tabbing**: Drag a widget header onto another widget's header to stack them into accessible tabs.
- **Fluid Resizing**: Adjust the width and height of any widget panel in real-time.
- **Rich Widgets**: Features realistic placeholder widgets, including a beautiful, responsive area chart built with `recharts` simulating stock market data.
- **Performance**: Carefully optimized by memoizing rendering functions and disabling strict-mode double-renders to ensure butter-smooth drag/drop interactions.

## Tech Stack

- **Framework**: React 19
- **Bundler**: Rsbuild (for ultra-fast compilation)
- **Styling**: Tailwind CSS v4
- **Layout Engine**: `flexlayout-react`
- **Charts**: `recharts`
- **Icons**: `lucide-react`

## Quick Start
To run the project locally, install the dependencies using [pnpm](https://pnpm.io/):

```bash
pnpm install
```

Start the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port specified in your terminal) to view the application in the browser.

## Deployment

This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the application to **GitHub Pages** upon any push to the `main` branch. 
The Rsbuild configuration (`rsbuild.config.ts`) has been tailored to properly output `assetPrefix: './'` to support routing if served on a GitHub subpath.
