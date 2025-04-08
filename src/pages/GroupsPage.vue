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
      <!-- Tabs específicos para eventos -->
      <div class="container mx-auto px-4 md:px-8 lg:px-16">
          <div class="mt-4 flex gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[ 
                'px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200',
                activeTab === tab.id
                  ? 'bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

      <!-- Contenido de tab -->
      <div class="container mx-auto px-4 md:px-8 lg:px-16 my-6">
        <!-- Tab: GroupsFeed -->
        <div v-if="activeTab === 'feed'">
          <h2 class="text-lg font-semibold text-[#2c3e50] dark:text-white mb-4">Tus Feed de Grupos</h2>
          <div class="space-y-6 flex flex-col items-center">
            <span class="dark:text-white">Still Working on this</span>
          </div>
        </div>

        <!-- Tab: Descubrir -->
        <!-- <div v-else-if="activeTab === 'discover'">
          <h2 class="text-lg font-semibold text-[#2c3e50] dark:text-white mb-4">Descubrir Grupos</h2>
        </div> -->
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
import { ref, watch, onUnmounted } from 'vue'
import { useAuth } from '../api/auth/useAuth'
import { useGroupsStore } from '../stores/groups'
import CreateGroupModal from '../components/organisms/CreateGroupModal.vue'
import UserGroupsTab from '../components/molecules/UserGroupsTab.vue'
import DiscoverGroupsTab from '../components/molecules/DiscoverGroupsTab.vue'

// Estados y variables principales
const { user } = useAuth()
const groupsStore = useGroupsStore()

// Control de tabs
const tabs = [
  { id: 'feed', label: 'Tus Feed' },
  { id: 'discover', label: 'Descubrir' },
  { id: 'yourGroups', label: 'Tus Grupos' },
]
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

// Suscripciones según el tab seleccionado
watch(activeTab, (tab) => {
  // Si se muestra el feed de grupos (posts de grupos suscriptos)
  // if (tab === 'feed' && user.value?.uid) {
  //   groupsStore.subscribeUserGroupFeed(user.value.uid)
  // } else {
  //   groupsStore.unsubscribeUserGroupFeed()
  // }
  
  // // Para descubrir grupos (grupos a los que el usuario NO está suscripto)
  if (tab === 'discover' && user.value?.uid) {
    groupsStore.subscribeAllGroups(user.value.uid)
  } else {
    groupsStore.unsubscribeAllGroups()
  }
  
  // Para los grupos creados por el usuario
  if (tab === 'yourGroups' && user.value?.uid) {
    groupsStore.subscribeUserGroups(user.value.uid)
  } else {
    groupsStore.unsubscribeUserGroups()
  }
}, { immediate: true })

// Cancelar todas las suscripciones al desmontar
onUnmounted(() => {
  // groupsStore.unsubscribeUserGroupFeed()
  groupsStore.unsubscribeAllGroups()
  groupsStore.unsubscribeUserGroups()
})
</script>
