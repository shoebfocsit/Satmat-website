import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig(({mode}) => {
  const isProd = mode === 'production';

  return {
    plugins: [react(), tailwindcss()],

    server: {
      port: 5173,
      // Dev proxy: supports both local backend (if running) and live Render backend.
      // When the Website is built for production it uses same-origin /api/v1
      // via vercel.json rewrites, so no CORS. In dev we default to the live
      // backend so charts/results work without a local server.
      proxy: {
        '/api': {
          target: process.env.VITE_API_BASE_URL || 'https://satmat-backendfinal.onrender.com',
          changeOrigin: true,
          secure: true,
        },
      },
      headers: {
        // Provide correct security headers in dev as well (frame-ancestors/XFO must be headers, not meta)
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },

    build: {
      target: 'ES2022',
      minify: 'esbuild',
      cssCodeSplit: true,
      modulePreload: {polyfill: false},

      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-icons': ['lucide-react'],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },

      reportCompressedSize: true,
      chunkSizeWarningLimit: 200,
    },

    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
      legalComments: 'none',
    },
  };
});