<template>
    <div class="flex flex-col md:flex-row items-center md:items-start gap-4">
        <img :src="activeUser?.photoURLFile || defaultAvatar" alt="Avatar" class="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-white object-cover shadow-lg" />
        <div class="text-center md:text-left text-gray-800 md:text-white">
            <h1 class="text-xl md:text-2xl font-bold">{{ activeUser?.displayName || 'Usuario' }}</h1>
            <p class="text-sm">{{ connections?.length || 0 }} conexiones</p>
            <div class="mt-2 flex -space-x-2 items-center">
                <img 
                v-for="connection in connections?.slice(0, 5)" 
                :key="connection.idDoc"
                :src="connection.photoURLFile"
                alt=""
                class="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                />
                <button 
                v-if="connections?.length > 5" 
                @click="setTabConexiones" 
                class="relative inline-block h-8 w-8 rounded-full ring-2 ring-white hover:ring-primary transition"
                >
                <img 
                    :src="connections[5]?.photoURLFile" 
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
import { defineProps } from 'vue';

// Props
const props = defineProps({
    activeUser: { type: Object, required: true },
    connections: { type: Array, required: true },
    setTabConexiones: { type: Function, required: true },
});
</script>