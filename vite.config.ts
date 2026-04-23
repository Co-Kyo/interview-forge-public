import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { interviewForgePlugin } from './server/plugin'

export default defineConfig({
  plugins: [vue(), interviewForgePlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5199,
    open: true,
  },
})
