<template>
  <aside :class="[
    'bg-gray-100 w-64 p-6 shadow-lg transition-transform duration-300 fixed top-0 bottom-0 z-30',
    show ? 'translate-x-0' : '-translate-x-full',
    'md:bg-white md:w-72 md:shadow-none md:static md:translate-x-0'
  ]">
    <!-- Cruz de cierre en móvil -->
    <button 
      v-if="show" 
      @click="emit('toggle')" 
      class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-[#2c3e50] transition-colors md:hidden"
    >
      <i class="fas fa-times text-lg"></i>
    </button>

    <!-- Perfil del usuario -->
    <div class="flex items-center gap-4 mb-8">
      <img 
        :src="user?.photoURLFile || 'https://via.placeholder.com/40'" 
        alt="Avatar" 
        class="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
      />
      <div>
        <p class="text-base font-semibold text-[#2c3e50] tracking-tight">
          {{ user?.displayName || 'Usuario' }}
        </p>
        <p class="text-xs text-gray-500">Miembro</p>
      </div>
    </div>

    <!-- Navegación principal -->
    <nav class="space-y-2">
      <router-link 
        to="/feed" 
        class="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-[#02bcae] rounded-lg transition-colors"
        active-class="bg-[#02bcae] text-white hover:bg-[#02bcae] hover:text-white"
      >
        <i class="fas fa-home w-5 text-center"></i>
        <span class="text-sm font-medium">Inicio</span>
      </router-link>
      <router-link 
        to="/profile" 
        class="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-[#02bcae] rounded-lg transition-colors"
        active-class="bg-[#02bcae] text-white hover:bg-[#02bcae] hover:text-white"
      >
        <i class="fas fa-user w-5 text-center"></i>
        <span class="text-sm font-medium">Perfil</span>
      </router-link>
      <router-link 
        to="/explorar" 
        class="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-[#02bcae] rounded-lg transition-colors"
        active-class="bg-[#02bcae] text-white hover:bg-[#02bcae] hover:text-white"
      >
        <i class="fas fa-compass w-5 text-center"></i>
        <span class="text-sm font-medium">Explorar</span>
      </router-link>
    </nav>

    <!-- Sección "Explorar" -->
    <div class="mt-8">
      <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Explorar</h3>
      <ul class="space-y-2">
        <li>
          <a href="#" class="block px-4 py-2 text-sm text-gray-600 hover:text-[#02bcae] hover:bg-gray-200 rounded-md transition-colors">
            Eventos
          </a>
        </li>
        <li>
          <a href="#" class="block px-4 py-2 text-sm text-gray-600 hover:text-[#02bcae] hover:bg-gray-200 rounded-md transition-colors">
            Adopciones
          </a>
        </li>
        <li>
          <a href="#" class="block px-4 py-2 text-sm text-gray-600 hover:text-[#02bcae] hover:bg-gray-200 rounded-md transition-colors">
            Educación
          </a>
        </li>
      </ul>
    </div>
  </aside>

  <!-- Fondo semitransparente para cerrar en móvil -->
  <div 
    v-if="show" 
    @click="emit('toggle')" 
    class="fixed inset-0 bg-black/40 md:hidden z-20"
  ></div>
</template>

<script setup>
import { useAuth } from '../../api/auth/auth';

defineProps(['show']);
const emit = defineEmits(['toggle']);

const { user } = useAuth();
</script>