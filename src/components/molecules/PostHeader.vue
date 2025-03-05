<!-- PostHeader.vue -->
<template>
  <div class="flex items-center justify-between mb-3">
    <div class="flex items-center gap-3">
      <img 
        :src="post?.user?.photoURLFile || 'https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4'" 
        alt="Avatar" 
        class="w-10 h-10 rounded-full border border-gray-200"
      />
      <div>
        <p class="text-sm font-bold text-[#2c3e50]">{{ post?.user?.displayName || 'Anónimo' }}</p>
        <p class="text-xs text-gray-500">{{ formatTimestamp(post?.timestamp) }}</p>
      </div>
    </div>
    <div class="relative">
      <button 
        @click="post.showMenu = !post.showMenu" 
        class="text-gray-600 hover:text-primary focus:outline-none transition-colors duration-200"
      >
        <i class="fas fa-ellipsis-h"></i>
      </button>
      <div 
        v-if="post.showMenu" 
        class="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
      >
        <ul class="py-1 text-sm text-gray-700">
          <li v-if="post?.user?.id === user?.id || user?.isAdmin">
            <button 
              @click="emit('edit')" 
              class="w-full text-left px-4 py-2 hover:bg-gray-100 transition-all duration-200"
            >
              <i class="fas fa-pen mr-2"></i> Editar
            </button>
          </li>
          <li v-if="post?.user?.id === user?.id || user?.isAdmin">
            <button 
              @click="showDeleteModal" 
              class="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-200"
            >
              <i class="fas fa-trash mr-2"></i> Eliminar
            </button>
          </li>
          <li>
            <button 
              @click="emit('share')" 
              class="w-full text-left px-4 py-2 hover:bg-gray-100 transition-all duration-200"
            >
              <i class="fas fa-share mr-2"></i> Compartir
            </button>
          </li>
          <li v-if="post?.user?.id !== user?.id">
            <button 
              @click="emit('report')" 
              class="w-full text-left px-4 py-2 hover:bg-gray-100 transition-all duration-200"
            >
              <i class="fas fa-flag mr-2"></i> Reportar
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación -->
  <div v-if="showModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity duration-300">
    <div class="bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl transform transition-all duration-300">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">¿Eliminar posteo?</h3>
      <p class="text-sm text-gray-600 mb-6">¿Estás seguro de que quieres eliminar este posteo? Esta acción no se puede deshacer.</p>
      <div class="flex justify-end gap-3">
        <button 
          @click="showModal = false" 
          class="px-4 py-2 text-gray-500 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          Cancelar
        </button>
        <button 
          @click="confirmDelete" 
          class="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../../api/auth/auth'; // Ajusta la ruta
import { formatTimestamp } from '../../utils/formatTimestamp'; // Ajusta la ruta

defineProps(['post']);
const emit = defineEmits(['edit', 'delete', 'share', 'report']);

const { user } = useAuth();

// Estado para el modal
const showModal = ref(false);

// Mostrar el modal de confirmación
function showDeleteModal() {
  showModal.value = true;
}

// Confirmar eliminación y emitir evento
function confirmDelete() {
  emit('delete');
  showModal.value = false;
}
</script>