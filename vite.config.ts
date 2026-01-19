import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { execSync } from 'child_process';

// Plugin to run postbuild after each build
function postbuildPlugin() {
  return {
    name: 'postbuild',
    closeBundle() {
      console.log('\n🔄 Running postbuild...');
      try {
        execSync('node postbuild.js', { stdio: 'inherit' });
      } catch (error) {
        console.error('❌ Postbuild failed:', error);
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), postbuildPlugin()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/detector.ts'),
        options: resolve(__dirname, 'src/options/index.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  base: './', // Use relative paths for assets
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
