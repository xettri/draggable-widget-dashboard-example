import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact()],
  output: {
    assetPrefix: process.env.GH_PAGES ? '/draggable-widget-dashboard-example/' : './',
  }
});
