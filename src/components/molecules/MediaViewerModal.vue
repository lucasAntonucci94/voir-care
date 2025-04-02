<template>
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/90 z-101 transition-opacity duration-300 overflow-hidden"
      @click.stop="emit('close')"
    >
      <div class="flex h-full w-full">
        <div class="flex-1 flex items-center justify-center relative">
          <div v-if="media?.type === 'image'" class="media-container">
            <img
              :src="media.src"
              alt="Media del Evento"
              class="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
          <div v-else-if="media?.type === 'video'" class="media-container">
            <video
              :src="media.src"
              controls
              autoplay
              class="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
        <button
          @click.stop="emit('close')"
          class="absolute top-2 right-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        >
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  const props=  defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    media: {
      type: Object,
      default: () => ({ src: '', type: 'image' }) // type: 'image' | 'video'
    }
  })
  
  const emit = defineEmits(['close'])
  watch(() => props.visible, (newValue) => {
    console.log('Visible cambió a:', newValue);
    });
  </script>
  
  <style scoped>
  .media-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
  }
  </style>
  