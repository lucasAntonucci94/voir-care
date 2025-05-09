<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="flex-1 overflow-y-auto">
      <!-- Encabezado interno de la sección Grupos -->
      <div class="bg-white dark:bg-gray-800 shadow-sm">
        <div class="container mx-auto px-4 md:px-8 lg:px-16 py-4">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-[#2c3e50] dark:text-white">Grupos</h1>
            <button
            @click="handleModalCreate"
              class="hidden sm:inline-flex px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary-md dark:hover:bg-secondary-md transition-colors"
            >
              + Crear Grupo
            </button>
          </div>
        </div>
      </div>
        <!-- Tabs para grupos -->
        <div class="container mx-auto px-4 md:px-8 lg:px-16">
          <div
            class="mt-4 flex gap-1 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide whitespace-nowrap"
          >
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'relative px-4 py-3 text-sm font-medium transition-all duration-300 flex items-center space-x-2',
                activeTab === tab.id
                  ? 'text-primary dark:text-secondary border-b-2 border-primary dark:border-secondary'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
              :aria-selected="activeTab === tab.id"
              role="tab"
            >
              <i :class="tab.icon" aria-hidden="true"></i>
              <span>{{ tab.label }}</span>
              <!-- Línea indicadora para la pestaña activa -->
              <span
                v-if="activeTab === tab.id"
                class="absolute inset-x-0 bottom-0 h-0.5 bg-primary dark:bg-secondary"
              ></span>
            </button>
          </div>
        </div>
      <!-- Contenido de tab -->
      <div class="container mx-auto px-4 md:px-8 lg:px-16">
        <!-- Tab: GroupsFeed -->
        <GroupFeedTab v-if="activeTab === 'feed'" />
        <!-- Tab: Descubrir -->
        <DiscoverGroupsTab v-else-if="activeTab === 'discover'" />
        <!-- Tab: Tus Grupos -->
        <UserGroupsTab v-else-if="activeTab === 'yourGroups'" @open-create-modal="handleModalCreate" @open-discover-tab="setDiscoverTab" />
      </div>
    </div>

    <!-- Modal de Creación de un grupo -->
    <CreateGroupModal
      :visible="showModalCreate"
      @close="closeModalCreate"
      @groupCreated="handleGroupCreated"
    />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import CreateGroupModal from '../components/organisms/CreateGroupModal.vue'
import UserGroupsTab from '../components/molecules/UserGroupsTab.vue'
import DiscoverGroupsTab from '../components/molecules/DiscoverGroupsTab.vue'
import GroupFeedTab from '../components/organisms/GroupFeedTab.vue'

// Control de tabs
const tabs = [
  { id: 'feed', label: 'Tus Feed', icon: 'fa-solid fa-rss' },
  { id: 'discover', label: 'Descubrir', icon: 'fa-solid fa-magnifying-glass' },
  { id: 'yourGroups', label: 'Tus Grupos', icon: 'fa-solid fa-users' },
];
const activeTab = ref('feed')

// Control de la modal de creación de grupo
const showModalCreate = ref(false)

// Funciones para abrir y cerrar la modal
const handleModalCreate = () => {
  showModalCreate.value = true
  document.body.style.overflow = 'hidden'
}

// Funciones para abrir y cerrar la modal
const setDiscoverTab = () => {
  activeTab.value = 'discover'
}

const closeModalCreate = () => {
  showModalCreate.value = false
  document.body.style.overflow = ''
}

// Ejemplo de manejo del evento groupCreated (podrías actualizar la lista o mostrar una notificación)
const handleGroupCreated = (groupData) => {
  console.log('Grupo creado:', groupData)
}

// // Suscripciones según el tab seleccionado
// watch(
//   activeTab,
//   (newTab, oldTab) => {
//     // Cancelar todas las suscripciones primero
//     groupsStore.unsubscribeUserGroupFeed()
//     groupsStore.unsubscribeAllGroups()
//     groupsStore.unsubscribeFromUserGroups()

//     if (!user.value?.uid) return

//     // Activar la suscripción según el tab
//     if (newTab === 'feed') {
//       groupsStore.subscribeUserGroupFeed(user.value.uid)
//     } else if (newTab === 'discover') {
//       groupsStore.subscribeAllGroups()
//     } else if (newTab === 'yourGroups') {
//       groupsStore.subscribeUserGroups(user.value.uid)
//     }
//   },
//   { immediate: true }
// )
</script>
