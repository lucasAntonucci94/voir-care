<template>
  <!-- Usamos <teleport to="body"> para renderizar el modal directamente en el body -->
  <teleport to="body">
    <!-- Se utiliza @click.self para que solo se cierre al hacer click fuera del contenido -->
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 transition-opacity duration-300"
      @click.self="handleCancel"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl transform transition-all duration-300"
      >
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">{{ title }}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">{{ message }}</p>
        <div class="flex justify-end gap-3">
          <button 
            @click="handleCancel"
            class="px-4 py-2 text-gray-500 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-200 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            {{ cancelButtonText }}
          </button>
          <button 
            @click="handleConfirm"
            class="px-4 py-2 bg-primary dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-xl hover:bg-primary-md transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {{ confirmButtonText }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { defineEmits } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '¿Confirmar acción?'
  },
  message: {
    type: String,
    default: 'Esta acción no se puede deshacer. ¿Deseas continuar?'
  },
  confirmButtonText: {
    type: String,
    default: 'Confirmar'
  },
  cancelButtonText: {
    type: String,
    default: 'Cancelar'
  }
})
const emit = defineEmits(['cancel', 'confirmed'])

function handleCancel() {
  emit('cancel')
}

function handleConfirm() {
  emit('confirmed')
}
</script>

<style scoped>
</style>
