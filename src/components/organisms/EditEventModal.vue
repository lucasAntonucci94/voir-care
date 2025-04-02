<template>
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xl relative">
        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Editar Evento
        </h3>
        <div class="space-y-3">
          <input
            v-model="editForm.title"
            type="text"
            placeholder="Título"
            class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
          />
  
          <textarea
            v-model="editForm.description"
            rows="3"
            placeholder="Descripción"
            class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
          ></textarea>
  
          <div class="flex gap-3">
            <input
              v-model="editForm.startTime"
              type="datetime-local"
              class="w-full px-3 py-2 rounded border text-sm dark:bg-gray-700 dark:text-white"
            />
            <input
              v-model="editForm.endTime"
              type="datetime-local"
              class="w-full px-3 py-2 rounded border text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
  
          <select
            v-model="editForm.privacy"
            class="w-full px-3 py-2 rounded border text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="public">Público</option>
            <option value="private">Privado</option>
          </select>
  
          <input
            v-model="editForm.capacity"
            type="number"
            placeholder="Capacidad"
            class="w-full px-3 py-2 rounded border text-sm dark:bg-gray-700 dark:text-white"
          />
  
          <input
            v-model="editForm.location.address"
            type="text"
            placeholder="Ubicación"
            class="w-full px-3 py-2 rounded border text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>
  
        <!-- Acciones -->
        <div class="flex justify-end gap-3 mt-6">
          <button
            class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500"
            @click="handleCancel"
          >
            Cancelar
          </button>
          <button
            class="px-4 py-2 rounded bg-primary text-white hover:bg-primary-md"
            @click="handleSubmit"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    event: {
      type: Object,
      required: true
    }
  })
  const emit = defineEmits(['cancel', 'submit'])
  
  // Creamos una copia reactiva del objeto recibido para editar
  const editForm = ref({ ...props.event })
  
  // Si la prop 'event' cambia, actualizamos el formulario
  watch(
    () => props.event,
    (newVal) => {
      editForm.value = { ...newVal }
    }
  )
  
  // Emitir cancelación para que el padre se encargue de cerrar el modal
  function handleCancel() {
    emit('cancel')
  }
  
  // Emitir los cambios actualizados para que el padre procese la actualización
  function handleSubmit() {
    const updatedEvent = {
      ...editForm.value,
      startTime: editForm.value.startTime
        // ? new Date(editForm.value.startTime).toISOString().split('T')[0]
        // : ''
        ,
      endTime: editForm.value.endTime
        // ? new Date(editForm.value.endTime).toISOString().split('T')[0]
        // : ''
    }
    emit('submit', updatedEvent)
  }
  </script>
  
  <style scoped>
  /* Puedes agregar estilos adicionales aquí si es necesario */
  </style>
  