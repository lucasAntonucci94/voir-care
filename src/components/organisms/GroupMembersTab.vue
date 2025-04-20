<!-- components/organisms/GroupMembersTab.vue -->
<template>
  <div class="block bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mx-auto max-w-lg">
    <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Miembros</h2>

    <!-- Sin miembros -->
    <div
      v-if="members.length === 0"
      class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-500 dark:text-gray-400"
    >
      No hay miembros en este grupo.
    </div>

    <!-- Lista de miembros -->
    <div v-else class="space-y-4">
      <div
        v-for="member in members"
        :key="member.id"
        class="flex items-center justify-between gap-3 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition"
      >
        <div class="flex items-center gap-3">
          <img
            :src="member.photoURLFile || member.avatar?.photoURL || avatarDefault"
            alt="Avatar"
            class="w-10 h-10 rounded-full"
          />
          <div>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ member.displayName || 'Anónimo' }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-100">{{ member.email || 'Sin correo' }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="openModal(member)"
            class="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-secondary"
            title="Ver información"
          >
            <i class="fa-solid fa-eye fa-lg"></i>
          </button>
          <router-link
            :to="`/profile/${member.email}`"
            class="p-2 text-primary dark:text-secondary hover:bg-primary-md dark:hover:bg-secondary-md rounded-lg"
            title="Ver perfil"
          >
            <i class="fa-solid fa-arrow-right fa-lg"></i>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Modal para mostrar información del usuario -->
    <UserInfoModal
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
  members: { type: Array, required: true },
})

const showModal = ref(false)
const selectedUser = ref(null)

const openModal = (member) => {
  selectedUser.value = member
  showModal.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
  document.body.style.overflow = ''
}
</script>

<style scoped>
@media (max-width: 640px) {
  .max-w-lg {
    max-width: 100%;
  }
}
</style>