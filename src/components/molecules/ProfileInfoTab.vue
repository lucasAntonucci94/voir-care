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
        <span class="text-sm text-right">{{ (userInfo.genre?.toLowerCase() === 'otro' ? 'No especifica' : userInfo.genre ) || 'No definido' }}</span>
      </div>

      <!-- País -->
      <div
        class="flex justify-between items-start border-b border-gray-200 pb-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <span class="font-medium dark:text-gray-300">País</span>
        <span class="text-sm text-right">{{ userInfo.country || 'No definido' }}</span>
      </div>

      <!-- Redes sociales (si existen) -->
      <div v-if="userInfo.socialNetwork && userInfo.socialNetwork.length > 0" class="mt-6">
        <h3 class="text-lg font-semibold mb-4 dark:text-gray-300">Redes Sociales</h3>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          <a
            v-for="(network, index) in userInfo.socialNetwork"
            :key="index"
            :href="network.value"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
            :title="network.name"
          >
            <img
              :src="getSocialIcon(network.name)"
              :alt="`${network.name} logo`"
              class="w-6 h-6 object-contain"
            >
            <span class="text-sm truncate">{{ network.name }}</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import LinkedInLogo from '../../assets/icons/redessociales/linkedin.png';
import InstagramLogo from '../../assets/icons/redessociales/instagram.png';
import FacebookLogo from '../../assets/icons/redessociales/facebook.png';
import TikTokLogo from '../../assets/icons/redessociales/tiktok.png';
import XLogo from '../../assets/icons/redessociales/x.png';
import WebLogo from '../../assets/icons/redessociales/website.png';

// Props
const props = defineProps({
  userInfo: { type: Object, required: true },
  isOwnProfile: { type: Boolean, required: false },
});
// emit para mostrar modal de edición
defineEmits(['trigger-edit']);

// Metodo para obtener el ícono de la red social
function getSocialIcon(networkName) {
  const iconMap = {
    'linkedin': LinkedInLogo,
    'instagram': InstagramLogo,
    'facebook': FacebookLogo,
    'tiktok': TikTokLogo,
    'x': XLogo, 
    'website': WebLogo
  };
  return iconMap[networkName.toLowerCase()] || WebLogo;
}
</script>

<style scoped>
/* Responsive */
@media (max-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .grid-cols-3 {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (min-width: 769px) {
  .grid-cols-4 {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

/* Formateo imagen */
img {
  max-width: 100%;
  height: auto;
}
</style>