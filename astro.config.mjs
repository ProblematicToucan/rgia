// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    server: {
      proxy: {
        '/eve': {
          target: 'http://127.0.0.1:2000',
          changeOrigin: true,
          ws: true,
        },
      },
    },
  },
});
