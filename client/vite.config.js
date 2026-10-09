import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server: {
    host: true,       // expose on LAN (0.0.0.0)
    port: 5174,       // pin the port
    strictPort: true, // fail if port is taken instead of auto-incrementing
  }
})
