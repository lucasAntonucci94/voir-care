<template>
  <div class="block bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mx-auto max-w-lg">
    <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Conexiones</h2>
    <div class="space-y-4">
      <div
        v-for="connection in connections"
        :key="connection.idDoc"
        class="flex items-center justify-between gap-3 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition"
      >
        <div class="flex items-center gap-3">
          <img
            :src="connection.avatar || avatarDefault"
            alt="Avatar"
            class="w-10 h-10 rounded-full"
          />
          <div>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ connection.displayName }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-100">{{ connection.email }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="openModal(connection)"
            class="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary"
            title="Ver información"
          >
            <i class="fa-solid fa-eye fa-lg"></i>
          </button>
          <router-link
            :to="`/profile/${connection.email}`"
            @click="emitActiveTab"
            class="p-2 text-primary dark:text-secondary hover:text-primary-md dark:hover:text-secondary-md rounded-lg"
            title="Ver perfil"
          >
            <i class="fa-solid fa-arrow-right fa-lg"></i>
          </router-link>
        </div>
      </div>
      <p v-if="connections.length === 0" class="text-center text-gray-500">No hay conexiones aún.</p>
    </div>

    <!-- Modal para mostrar información del usuario -->
    <UserInfoModal
      v-if="showModal && selectedUser"
      :visible="showModal"
      :user="selectedUser"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import avatarDefault from '../../assets/avatar1.jpg'
import UserInfoModal from '../molecules/UserInfoModal.vue'

const props = defineProps({
  connections: { type: Array, required: true },
})

// Define emits
const emit = defineEmits(['active-tab']);

const showModal = ref(false)
const selectedUser = ref(null)

const openModal = (connection) => {
  selectedUser.value = connection
  showModal.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
  document.body.style.overflow = ''
}

const emitActiveTab = () => {
  emit('active-tab', 'publicaciones');
};
</script>

<style scoped>
@media (max-width: 640px) {
  .max-w-lg {
    max-width: 100%;
  }
}
</style>