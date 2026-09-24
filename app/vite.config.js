import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { getMetaForPath, renderMetadataHead } from './src/utils/seo.js'

// https://vite.dev/config/
export default defineConfig(() => ({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), {
    name: 'raccn-route-head',
    transformIndexHtml(html) {
      return html.replace(/<!--raccn-head:start-->[\s\S]*?<!--raccn-head:end-->/, () =>
        `<!--raccn-head:start-->\n${renderMetadataHead(getMetaForPath('/'))}\n<!--raccn-head:end-->`);
    },
  }],
  server: { proxy: { '/api': 'http://127.0.0.1:8001', '/media': 'http://127.0.0.1:8001' } },
  preview: { proxy: { '/api': 'http://127.0.0.1:8001', '/media': 'http://127.0.0.1:8001' } },
}))
