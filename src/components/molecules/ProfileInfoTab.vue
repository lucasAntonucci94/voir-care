<template>
    <section class="p-4 max-w-md mx-auto bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 rounded-xl shadow-md">
      <!-- Título -->
      <h2 class="text-xl font-semibold mb-6">Información del Perfil</h2>
  
      <!-- Contenedor de datos -->
      <div class="space-y-4">
        <!-- Nombre de usuario -->
        <div class="flex justify-between items-start border-b border-gray-200 pb-2">
          <span class="font-medium dark:text-gray-300">Nombre de usuario</span>
          <span class="text-sm text-right">{{ userInfo.displayName || 'No definido' }}</span>
        </div>
  
        <!-- Nombre -->
        <div class="flex justify-between items-start border-b border-gray-200 pb-2">
          <span class="font-medium dark:text-gray-300">Nombre</span>
          <span class="text-sm text-right">{{ userInfo.firstName || 'No definido' }}</span>
        </div>
  
        <!-- Apellido -->
        <div class="flex justify-between items-start border-b border-gray-200 pb-2">
          <span class="font-medium dark:text-gray-300">Apellido</span>
          <span class="text-sm text-right">{{ userInfo.lastName || 'No definido' }}</span>
        </div>
  
        <!-- Email -->
        <div class="flex justify-between items-start border-b border-gray-200 pb-2">
          <span class="font-medium dark:text-gray-300">Email</span>
          <span class="text-sm text-right">{{ userInfo.email || 'No definido' }}</span>
        </div>
  
        <!-- Teléfono -->
        <div class="flex justify-between items-start border-b border-gray-200 pb-2">
          <span class="font-medium dark:text-gray-300">Teléfono</span>
          <span class="text-sm text-right">{{ userInfo.phoneNumber || 'No definido' }}</span>
        </div>
  
        <!-- Fecha de nacimiento -->
        <div class="flex justify-between items-start border-b border-gray-200 pb-2">
          <span class="font-medium dark:text-gray-300">Fecha de nacimiento</span>
          <span class="text-sm text-right">
            {{ userInfo.birthday ? new Date(userInfo.birthday).toLocaleDateString() : 'No definido' }}
          </span>
        </div>
  
        <!-- Género -->
        <div class="flex justify-between items-start border-b border-gray-200 pb-2">
          <span class="font-medium dark:text-gray-300">Género</span>
          <span class="text-sm text-right">{{ userInfo.genre || 'No definido' }}</span>
        </div>
  
        <!-- País -->
        <div class="flex justify-between items-start border-b border-gray-200 pb-2">
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
  });
  console.log(props.userInfo);
  </script>