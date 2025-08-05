<template>
  <Teleport v-if="visible" to="body">
    <div
      class="fixed inset-0 z-101 flex items-center justify-center bg-black/60"
      @click.self="emit('close')"
    >
      <div
        class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 transform transition-all duration-300 scale-95"
        :class="{ 'scale-100': visible }"
      >
        <!-- Cerrar -->
        <button
          @click="emit('close')"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition duration-200 z-10"
          aria-label="Cerrar modal"
        >
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>

        <!-- Imagen con chip de estado -->
        <div class="relative mb-4">
          <img
            v-if="location.media?.url"
            :src="location.media.url"
            alt="Imagen de la ubicación"
            class="w-full h-48 object-cover rounded-lg"
          />
          <div
            v-else
            class="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-300"
          >
            <i class="fa-solid fa-camera text-3xl"></i>
          </div>
          <!-- Chip de estado de la ubicación -->
          <div
            class="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-white shadow-sm transition-all duration-200"
            :class="statusChipStyle"
          >
            <span>{{ statusLabel }}</span>
          </div>
        </div>

        <!-- Título -->
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {{ location.title }}
        </h3>

        <!-- Usuario Creador -->
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 rounded-full overflow-hidden">
            <img
              v-if="location.user?.photoURLFile"
              :src="location.user.photoURLFile"
              alt="Avatar usuario"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center font-semibold text-gray-700 dark:text-gray-200"
            >
              {{ location.user?.email?.charAt(0).toUpperCase() || 'U' }}
            </div>
          </div>
          <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
            Creado por:
            {{ location.user?.displayName || location.user?.email || 'Usuario desconocido' }}
          </span>
        </div>

        <!-- Detalles de la ubicación -->
        <div class="space-y-3 mb-4 text-gray-600 dark:text-gray-300">
          <p class="flex items-center gap-2">
            <i class="fa-solid fa-map-location-dot"></i>
            <span>Coordenadas: ({{ location.address?.coordinates?.lat?.toFixed(4) }}, {{ location.address?.coordinates?.lng?.toFixed(4) }})</span>
          </p>
          <p v-if="location.address?.street" class="flex items-center gap-2">
            <i class="fa-solid fa-location-dot"></i>
            <span>Dirección: {{ location.address.street }}</span>
          </p>
          <p v-if="location.contact?.phone" class="flex items-center gap-2">
            <i class="fa-solid fa-phone"></i>
            <span>Teléfono: {{ location.contact.phone }}</span>
          </p>
          <p v-if="location.contact?.socialNetworkLink" class="flex items-center gap-2">
            <i class="fa-solid fa-globe"></i>
            <span>Red social: {{ location.contact.socialNetworkLink }}</span>
          </p>
          <div v-if="location.description">
            <button
              @click="showDetails = !showDetails"
              class="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <i :class="showDetails ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
              <span>{{ showDetails ? 'Ocultar Descripción' : 'Ver Descripción' }}</span>
            </button>
            <div
              v-if="showDetails"
              class="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-base transition-all duration-200"
            >
              {{ location.description }}
            </div>
          </div>
        </div>

        <!-- Acciones de Administración -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            v-if="location.pending"
            @click="emit('confirm',location)"
            :disabled="location.status === 'confirmed'"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fa-solid fa-check text-base"></i>
            Aprobar Marcador
          </button>
          <button
            @click="emit('delete', location.id)"
            :disabled="location.status === 'deleted'"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fa-solid fa-trash-can text-base"></i>
            Eliminar Ubicación
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  location: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'confirm', 'delete']);
const showDetails = ref(false);

const statusChipStyle = computed(() => {
  if (!props.location.pending) {
    return 'bg-green-600';
  } else {
    return 'bg-yellow-500';
  }
});

const statusLabel = computed(() => {
   if (!props.location.pending) {
    return 'Confirmado';
  } else {
    return 'Pendiente';
  }
});

// Manejar la tecla Escape para cerrar el modal
function handleEscape(event) {
  if (event.key === 'Escape' && props.visible) {
    emit('close');
  }
}

// Agregar y remover el listener de la tecla Escape
onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
});

// Resetear estados cuando el modal se cierra
watch(() => props.visible, (newVisible) => {
  if (!newVisible) {
    showDetails.value = false;
  }
});
</script>
