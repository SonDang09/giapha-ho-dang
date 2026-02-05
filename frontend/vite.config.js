import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.log in production
        drop_debugger: true
      }
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Manual chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - cached separately
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-antd': ['antd', '@ant-design/icons'],
          'vendor-utils': ['axios', 'dayjs'],
          // Heavy components in separate chunks
          'vendor-tree': ['react-d3-tree', 'd3-hierarchy', 'd3-selection']
        }
      }
    }
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd', 'axios']
  }
})
