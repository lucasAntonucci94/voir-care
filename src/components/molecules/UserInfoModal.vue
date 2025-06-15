<!-- components/organisms/UserInfoModal.vue -->
<template>
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-101"
      @click.self="close"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <!-- Encabezado del modal -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Información del usuario</h3>
          <button
            @click="close"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <i class="fa-solid fa-xmark fa-lg"></i>
          </button>
        </div>
  
        <!-- Contenido del modal -->
        <div class="flex flex-col items-center">
          <img
            :src="user.photoURLFile || user.avatar || defaultAvatar"
            alt="Avatar"
            class="w-20 h-20 rounded-full mb-4"
          />
          <h4 class="text-xl font-medium text-gray-900 dark:text-white">{{ user.displayName }}</h4>
          <p class="text-sm text-gray-600 dark:text-gray-300">{{ user.email }}</p>
          <p
            v-if="user.bio"
            class="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center"
          >
            {{ user.bio }}
          </p>
          <p
            v-if="user.createdAt"
            class="text-xs text-gray-400 dark:text-gray-500 mt-2"
          >
            Miembro desde: {{ formatDate(user.createdAt) }}
          </p>
        </div>
  
        <!-- Botones de acción -->
        <div class="flex justify-end gap-2 mt-6">
          <button
            @click="close"
            class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cerrar
          </button>
          <router-link
            :to="`/profile/${user.email}`"
            class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md"
            @click="close"
        >
            Ver perfil
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineEmits } from 'vue'
  import defaultAvatar from '../../assets/avatar1.jpg'
  
  const props = defineProps({
    visible: { type: Boolean, required: true },
    user: { type: Object, required: true },
  })
  
  const emit = defineEmits(['close'])
  
  const close = () => {
    emit('close')
  }
  
  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return 'Desconocido'
    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  </script>
  
  <style scoped>
  @media (max-width: 640px) {
    .max-w-md {
      max-width: 90%;
    }
  }
  </style>