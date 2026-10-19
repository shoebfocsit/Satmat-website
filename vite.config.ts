import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const isProd = mode === 'production';
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_BASE_URL || 'https://api.satmat.cloud';
  const proxyOrigin = proxyTarget.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

  return {
    plugins: [react(), tailwindcss()],

    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: proxyOrigin,
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