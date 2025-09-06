import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',  // Allow access from outside the container
    port: 3002,       // Temporarily changed for testing
    strictPort: true, // Fail if 3001 is not available
    allowedHosts: ['protogen.local', 'localhost', '127.0.0.1'],
    hmr: {
      host: 'protogen.local'
    }
  }
}) 