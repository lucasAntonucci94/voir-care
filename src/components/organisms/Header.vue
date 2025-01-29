<template>
  <header class="bg-gray-800 text-white p-4">
    <div class="container mx-auto flex justify-between items-center">
      <div class="flex items-center">
        <img src="../../assets/logo.png" alt="Logo de mi red social" class="h-10 mr-4"> 
        <h1 class="text-1xl font-bold">Mi Red Social</h1>
      </div>
    <nav class="text-white p-4">
   <div class="container mx-auto flex justify-between items-center">
      <div class="hidden md:flex space-x-4">
        <router-link to="/" class="hover:text-gray-300"><i class="fa-solid fa-house"></i>Inicio</router-link>
        <router-link to="/perfil" class="hover:text-gray-300">Perfil</router-link>
        <router-link to="/sociales" class="hover:text-gray-300">Sociales</router-link>
        <router-link to="/explorar" class="hover:text-gray-300">Explorar</router-link>
        <router-link to="/mensajes" class="hover:text-gray-300">Mensajes</router-link>
        <router-link to="/perfil" class="hover:text-gray-300">Perfil</router-link>
        <router-link to="/mensajes" class="hover:text-gray-300">Panel de Administrador        </router-link>
        <router-link to="/faqs" class="hover:text-gray-300">FAQs</router-link>
      </div>

      <div class="relative">
        <button class="flex items-center" @click="showUserTab = !showUserTab">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A9.767 9.767 0 0116 11.174c0-4.817 3.687-8.405 8.232-8.405 7.107 0 12.36 5.591 12.36 12.216 0 1.044-.278 2.015-.768 2.74m-9.793 3.443A12.493 12.493 0 012.827 7.54c0-4.661 3.744-8.405 8.233-8.405 7.105 0 12.36 5.591 12.36 12.216 0 1.044-.278 2.015-.768 2.74m-9.793 3.443A12.493 12.493 0 012.827 7.54c0-4.661 3.744-8.405 8.233-8.405 7.105 0 12.36 5.591 12.36 12.216 0 1.044-.278 2.015-.768 2.74m-9.793 3.443A12.493 12.493 0 012.827 7.54c0-4.661 3.744-8.405 8.233-8.405 7.105 0 12.36 5.591 12.36 12.216 0 1.044-.278 2.015-.768 2.74" />
          </svg>
          <span class="relative">
            <span v-if="showUserTab" class="absolute top-0 right-0 bg-red-500 rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </span>
        </button>
        <transition name="fade">
          <div v-show="showUserTab" class="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md">
            <ul>
              <li v-for="notification in notifications" :key="notification.id" class="block px-4 py-2 text-black hover:bg-gray-100">
                {{ notification.message }}
              </li>
            </ul>
          </div>
        </transition>
      </div>

      <div class="relative">
        <button class="flex items-center" @click="showNotificationsTab = !showNotificationsTab">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A9.767 9.767 0 0116 11.174c0-4.817 3.687-8.405 8.232-8.405 7.107 0 12.36 5.591 12.36 12.216 0 1.044-.278 2.015-.768 2.74m-9.793 3.443A12.493 12.493 0 012.827 7.54c0-4.661 3.744-8.405 8.233-8.405 7.105 0 12.36 5.591 12.36 12.216 0 1.044-.278 2.015-.768 2.74m-9.793 3.443A12.493 12.493 0 012.827 7.54c0-4.661 3.744-8.405 8.233-8.405 7.105 0 12.36 5.591 12.36 12.216 0 1.044-.278 2.015-.768 2.74m-9.793 3.443A12.493 12.493 0 012.827 7.54c0-4.661 3.744-8.405 8.233-8.405 7.105 0 12.36 5.591 12.36 12.216 0 1.044-.278 2.015-.768 2.74" />
          </svg>
          <span class="relative">
            <span v-if="showNotificationsTab" class="absolute top-0 right-0 bg-red-500 rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </span>
        </button>
        <transition name="fade">
          <div v-show="showNotificationsTab" class="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md">
            <ul>
              <li v-for="notification in notifications" :key="notification.id" class="block px-4 py-2 text-black hover:bg-gray-100">
                {{ notification.message }}
              </li>
            </ul>
          </div>
        </transition>
      </div>

      <div class="relative">
        </div>
    </div>
  </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showNotificationsTab = ref(false)
const showUserTab = ref(false)
const notifications = ref([
        { id: 1, message: 'Tienes un nuevo mensaje' },
        { id: 2, message: 'Alguien te ha seguido' },
      ])

</script> 