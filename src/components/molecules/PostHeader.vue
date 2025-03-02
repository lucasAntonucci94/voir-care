<template>
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-3">
        <img :src="post.user.avatar" alt="Avatar" class="w-10 h-10 rounded-full" />
        <div>
          <p class="text-sm font-bold text-[#2c3e50]">{{ post.user.name }}</p>
          <p class="text-xs text-gray-500">{{ post.timestamp.toLocaleDateString() }}</p>
        </div>
      </div>
      <div class="relative">
        <button @click="post.showMenu = !post.showMenu" class="text-gray-600 hover:text-[#02bcae] focus:outline-none">
          <i class="fas fa-ellipsis-h"></i>
        </button>
        <div v-if="post.showMenu" class="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <ul class="py-1 text-sm text-gray-700">
            <li v-if="post.user.id === user?.id || user?.isAdmin">
              <button @click="emit('edit')" class="w-full text-left px-4 py-2 hover:bg-gray-100">
                <i class="fas fa-pen mr-2"></i> Editar
              </button>
            </li>
            <li v-if="post.user.id === user?.id || user?.isAdmin">
              <button @click="emit('delete')" class="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
                <i class="fas fa-trash mr-2"></i> Eliminar
              </button>
            </li>
            <li>
              <button @click="emit('share')" class="w-full text-left px-4 py-2 hover:bg-gray-100">
                <i class="fas fa-share mr-2"></i> Compartir
              </button>
            </li>
            <li v-if="post.user.id !== user?.id">
              <button @click="emit('report')" class="w-full text-left px-4 py-2 hover:bg-gray-100">
                <i class="fas fa-flag mr-2"></i> Reportar
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useAuth } from '../../api/auth/auth';
  
  defineProps(['post']);
  const emit = defineEmits(['edit', 'delete', 'share', 'report']);
  
  const { user } = useAuth();
  </script>