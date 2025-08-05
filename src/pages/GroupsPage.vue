<template>
  <!-- Contenedor principal -->
  <div class="flex min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="flex-1 overflow-y-auto">
      <!-- Encabezado de la página de Grupos -->
      <header class="bg-white dark:bg-gray-800 shadow-sm">
        <div class="container mx-auto px-4 md:px-8 lg:px-16 py-4">
          <div class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-[#2c3e50] dark:text-white">
              <i class="fa-solid fa-users mr-2 text-primary dark:text-secondary"></i>
              Grupos
            </h1>
            <!-- Botón para crear grupo (visible en pantallas grandes) -->
            <button
              v-if="activeTab === 'yourGroups'"
              @click="handleModalCreate"
              class="flex justify-center items-center px-4 py-2 bg-primary dark:bg-secondary text-white rounded-full hover:bg-primary-md dark:hover:bg-secondary-md transition-colors"
              :class="{ 'opacity-50 cursor-not-allowed': !createPermission }"
              :disabled="!createPermission"
            >
              <i class="fa-solid fa-plus"></i>
              <span class="pl-2">
                Crear
              </span>
            </button>
          </div>
        </div>
      </header>
      
      <!-- Contenedor de las pestañas de navegación -->
      <div class="container mx-auto px-4 md:px-8 lg:px-16">
        <div
          role="tablist"
          class="mt-4 flex gap-1 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-lg overflow-x-auto scrollbar-hide whitespace-nowrap"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :id="`tab-${tab.id}`"
            @click="activeTab = tab.id"
            :class="[
              'relative px-4 py-3 text-sm font-medium transition-all duration-300 flex items-center space-x-2',
              activeTab === tab.id
                ? 'text-primary dark:text-secondary border-b-2 border-primary dark:border-secondary'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
            :aria-selected="activeTab === tab.id"
            :aria-controls="`tab-panel-${tab.id}`"
            :tabindex="activeTab === tab.id ? 0 : -1"
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

      <!-- Contenido de la pestaña activa -->
      <div class="container mx-auto px-4 md:px-8 lg:px-16">
        <!-- Tab: GroupsFeed -->
        <div
          v-if="activeTab === 'feed'"
          id="tab-panel-feed"
          role="tabpanel"
          tabindex="0"
          aria-labelledby="tab-feed"
          class="focus:outline-none"
        >
          <GroupFeedTab />
        </div>
        
        <!-- Tab: Descubrir -->
        <div
          v-else-if="activeTab === 'discover'"
          id="tab-panel-discover"
          role="tabpanel"
          tabindex="0"
          aria-labelledby="tab-discover"
          class="focus:outline-none"
        >
          <DiscoverGroupsTab />
        </div>
        
        <!-- Tab: Tus Grupos -->
        <div
          v-else-if="activeTab === 'yourGroups'"
          id="tab-panel-yourGroups"
          role="tabpanel"
          tabindex="0"
          aria-labelledby="tab-yourGroups"
          class="focus:outline-none"
        >
          <UserGroupsTab @open-create-modal="handleModalCreate" @open-discover-tab="setDiscoverTab" />
        </div>
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
import { ref, computed } from 'vue'
import CreateGroupModal from '../components/organisms/CreateGroupModal.vue'
import UserGroupsTab from '../components/molecules/UserGroupsTab.vue'
import DiscoverGroupsTab from '../components/molecules/DiscoverGroupsTab.vue'
import GroupFeedTab from '../components/organisms/GroupFeedTab.vue'
import { useGroupsStore } from '../stores/groups'
import { useAuth } from '../api/auth/useAuth'
import { isCurrentMonth } from '../utils/isCurrentMonth'

const groupsStore = useGroupsStore()
const { user } = useAuth()

// Control de tabs
const tabs = [
  { id: 'discover', label: 'Descubrir', icon: 'fa-solid fa-magnifying-glass' },
  { id: 'feed', label: 'Tu Feed', icon: 'fa-solid fa-rss' },
  { id: 'yourGroups', label: 'Tus Grupos', icon: 'fa-solid fa-user-check' },
];
const activeTab = ref('discover')

// Control de la modal de creación de grupo
const showModalCreate = ref(false)

// Propiedad computada para determinar el permiso de creación
const createPermission = computed(() => {
  // Si no hay un usuario o no tiene uid, no hay permiso
  if (!user.value?.uid) return false;
  
  // Si el usuario está suscripto, SIEMPRE tiene permiso para crear
  if (user.value.isSuscribed) return true;
  
  // Si no está suscripto, buscamos el último grupo creado
  const lastGroup = groupsStore.userGroups?.value?.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate())[0];

  // Si no tiene grupos creados, tiene permiso
  if (!lastGroup) return true;
  
  // Si tiene un grupo, el permiso es TRUE si el grupo NO es de este mes.
  return !isCurrentMonth(lastGroup.createdAt);
});


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

const handleGroupCreated = (groupData) => {
  // console.log('Grupo creado:', groupData)
  // La propiedad computada se encargará de actualizar el permiso automáticamente.
}
</script>

<style scoped>
/* Estilos específicos del componente */
/* scrollbar-hide Utility */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
