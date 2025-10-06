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
      "@protogen/shared": fileURLToPath(new URL('../shared/dist/src', import.meta.url)),
      "@protogen/authoring": fileURLToPath(new URL('../authoring/dist', import.meta.url)),
      // Ensure single React instance
      "react": fileURLToPath(new URL('./node_modules/react', import.meta.url)),
      "react-dom": fileURLToPath(new URL('./node_modules/react-dom', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['@protogen/shared', 'react', 'react-dom']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  server: {
    host: '0.0.0.0',  // Allow access from outside the container
    port: 3000,       // Match exposed port in Docker
    strictPort: true, // Fail if 3000 is not available
    allowedHosts: ['protogen.local', 'localhost', '127.0.0.1']
  }
})