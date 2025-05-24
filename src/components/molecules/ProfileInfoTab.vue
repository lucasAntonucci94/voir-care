<template>
  <section class="p-4 max-w-md mx-auto bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 rounded-xl shadow-md relative">
    <!-- Título y botón de edición -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">Información del Perfil</h2>
      <button
        v-if="isOwnProfile"
        @click="$emit('trigger-edit')"
        class="p-2 bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-500 dark:hover:text-gray-100 rounded-full transition-all shadow-md"
        aria-label="Editar perfil"
      >
        <i class="fas fa-pencil-alt"></i>
      </button>
    </div>

    <!-- Contenedor de datos -->
    <div class="space-y-4">
      <!-- Nombre completo (firstName + lastName) -->
      <div
        class="flex justify-between items-start border-b border-gray-200 pb-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <span class="font-medium dark:text-gray-300">Nombre completo</span>
        <span class="text-sm text-right">
          {{ (userInfo.firstName || userInfo.lastName) ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() : 'No definido' }}
        </span>
      </div>

      <!-- Email -->
      <div
        class="flex justify-between items-start border-b border-gray-200 pb-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <span class="font-medium dark:text-gray-300">Email</span>
        <span class="text-sm text-right">{{ userInfo.email || 'No definido' }}</span>
      </div>

      <!-- Teléfono -->
      <div
        class="flex justify-between items-start border-b border-gray-200 pb-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <span class="font-medium dark:text-gray-300">Teléfono</span>
        <span class="text-sm text-right">{{ userInfo.phoneNumber || 'No definido' }}</span>
      </div>

      <!-- Fecha de nacimiento -->
      <div
        class="flex justify-between items-start border-b border-gray-200 pb-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <span class="font-medium dark:text-gray-300">Fecha de nacimiento</span>
        <span class="text-sm text-right">
          {{ userInfo.birthday ? new Date(userInfo.birthday).toLocaleDateString() : 'No definido' }}
        </span>
      </div>

      <!-- Género -->
      <div
        class="flex justify-between items-start border-b border-gray-200 pb-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <span class="font-medium dark:text-gray-300">Género</span>
        <span class="text-sm text-right">{{ userInfo.genre || 'No definido' }}</span>
      </div>

      <!-- País -->
      <div
        class="flex justify-between items-start border-b border-gray-200 pb-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <span class="font-medium dark:text-gray-300">País</span>
        <span class="text-sm text-right">{{ userInfo.country || 'No definido' }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
// Props
const props = defineProps({
  userInfo: { type: Object, required: true },
  isOwnProfile: { type: Boolean, required: false },
});

// Define emits for the trigger-edit event
defineEmits(['trigger-edit']);
</script>