// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  integrations: [react()],
  vite: {
    server: {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
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
