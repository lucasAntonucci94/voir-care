import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  assetsInclude: [
    '**/*.png', 
    '**/*.jpg', 
    '**/*.svg', 
    '**/*.mp4', 
    '**/*.MOV',
    '**/*.mov',
    '**/*.webm',
  ], 
})