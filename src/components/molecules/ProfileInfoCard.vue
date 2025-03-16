<template>
    <div class="flex flex-col md:flex-row items-center md:items-start gap-4">
        <img :src="activeUser?.photoURLFile  || avatarDefault" alt="Avatar" class="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-white object-cover shadow-lg" />
        <div class="text-center md:text-left text-gray-800 md:text-white">
            <h1 class="text-xl md:text-2xl font-bold">{{ activeUser?.displayName || activeUser?.email || 'Usuario' }}</h1>
            <p class="text-sm">{{ connections?.length || 0 }} conexiones</p>
            <div class="mt-2 flex -space-x-2 items-center">
                <img 
                v-for="connection in connections?.slice(0, 5)" 
                :key="connection.idDoc"
                :src="connection.avatar"
                alt=""
                class="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                />
                <button
                    v-if="connections?.length > 5"
                    @click="setTabConexiones"
                    class="relative inline-block h-8 w-8 rounded-full ring-2 ring-white hover:ring-primary transition group"
                    data-tooltip="Ver todas las conexiones"
                >
                    <img
                    :src="connections[5]?.avatar"
                    class="h-8 w-8 rounded-full object-cover"
                    alt="Más conexiones"
                    />
                    <div class="absolute inset-0 bg-gray-800/70 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="white">
                        <circle cx="4" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="20" cy="12" r="2" />
                    </svg>
                    </div>
                </button>
            </div>
        </div>
    </div>
</template>
<script setup>
import avatarDefault from '../../assets/avatar1.jpg';

// Props
const props = defineProps({
    activeUser: { type: Object, required: true },
    connections: { type: Array, required: true },
    setTabConexiones: { type: Function, required: true },
});
</script>

<style scoped>
/* Tooltip con clases de Tailwind y CSS básico */
[data-tooltip] {
  position: relative;
}

[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.25rem 0.5rem;
  background-color: #02bcae;
  font-weight: 700;
  color: white;
  text-align: center;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
}

[data-tooltip]:hover::before {
  content: '';
  position: absolute;
  bottom: 115%; /* Ajuste para alinear con el tooltip */
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #02bcae;
  z-index: 11;
}
</style>