<!-- pages/GroupDetail.vue -->
<template>
  <div v-if="loading" class="flex items-center justify-center h-screen">
    <p class="text-lg text-gray-500 dark:text-gray-300">Cargando grupo...</p>
  </div>
  <div v-else-if="!group" class="flex items-center justify-center h-screen">
    <p class="text-lg text-red-500 dark:text-red-400">Grupo no encontrado.</p>
  </div>
  <div v-else class="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
    <!-- Banner -->
    <div class="relative w-full h-64 md:h-96 overflow-hidden">
      <template v-if="group.media?.type === 'image' && group.media?.url">
        <img
          :src="group.media.url"
          alt="Banner del grupo"
          class="w-full h-full object-cover"
        />
      </template>
      <template v-else-if="group.media?.type === 'video' && group.media?.url">
        <video
          :src="group.media.url"
          controls
          class="w-full h-full object-cover"
        ></video>
      </template>
      <template v-else>
        <img
          :src="defaultGroupBanner"
          alt="Banner por defecto"
          class="w-full h-full object-cover"
        />
      </template>
      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
      <div class="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          {{ group.title }}
        </h1>
        <p class="mt-2 text-sm sm:text-base text-gray-200">
          Creado por {{ ownerDetails.displayName || group.ownerId }}
        </p>
      </div>
    </div>

    <!-- Navegación de Tabs -->
    <div class="container mx-auto px-4 md:px-8 py-6">
      <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav class="flex overflow-x-auto" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 whitespace-nowrap text-sm font-medium focus:outline-none',
              activeTab === tab.id
                ? 'border-b-2 border-primary dark:border-secondary text-primary dark:text-secondary'
                : 'text-gray-600 dark:text-gray-300',
            ]"
            :aria-selected="activeTab === tab.id ? 'true' : 'false'"
            role="tab"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Contenido de la pestaña seleccionada -->
      <div>
        <!-- Section Detalle del grupo -->
        <div v-if="activeTab === 'info'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Columna izquierda: Detalles -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Card de Detalles -->
            <div
              class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Detalles del Grupo
              </h2>
              <ul class="space-y-4 text-gray-600 dark:text-gray-300">
                <li class="flex items-center gap-3">
                  <i class="fas fa-edit text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Descripción:</strong> {{ group.description || 'Sin descripción' }}</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="fas fa-lock text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Privacidad:</strong> {{ group.privacy || 'Público' }}</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="fas fa-tags text-primary dark:text-secondary text-xl"></i>
                  <span>
                    <strong>Categorías:</strong> 
                    {{ group.categories?.length ? group.categories.map(cat => cat.name).join(', ') : 'Ninguna' }}
                  </span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="fas fa-calendar-alt text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Creado el:</strong> {{ formatTimestamp(group.createdAt) }}</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="fas fa-users text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Miembros:</strong> {{ group.members?.length || 0 }}</span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="fas fa-bullhorn text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Actividad reciente:</strong> {{ recentActivityMock }}</span>
                </li>
                <li v-if="group.rules" class="flex items-center gap-3">
                  <i class="fas fa-book text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Reglas:</strong> {{ group.rules }}</span>
                </li>
              </ul>
            </div>
            <div
              class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Publicaciones Destacadas
              </h2>
              <ul class="space-y-4 text-gray-600 dark:text-gray-300">
                <li class="flex items-center gap-3">
                  <i class="fas fa-edit text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Se:</strong></span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="fas fa-lock text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Esta:</strong></span>
                </li>
                <li class="flex items-center gap-3">
                  <i class="fas fa-calendar-alt text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Trabajando:</strong></span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Columna derecha: Acciones, Creador, Miembros -->
          <div class="space-y-6">
            <!-- Card de Acciones -->
            <section
              class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 class="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Acciones</h2>
              <div class="flex flex-col gap-3">
                <button
                  v-if="!isAdmin"
                  @click="toggleMembership"
                  class="w-full px-4 py-2 text-white rounded-md shadow-sm focus:outline-none transition-colors duration-200 flex items-center justify-center gap-2"
                  :class="isMember ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'"
                >
                  <i
                    :class="isMember ? 'fas fa-check-circle' : 'fas fa-plus-circle'"
                    class="text-white text-sm"
                  ></i>
                  {{ isMember ? 'Salir del grupo' : 'Unirme al grupo' }}
                </button>
                <button
                  class="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center"
                  disabled
                >
                  Invitar amigos
                </button>
              </div>
            </section>

            <!-- Card de Creador y Miembros -->
            <section
              class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <!-- Sección de Creador -->
              <div class="mb-4">
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Creador</h2>
                <div class="flex items-center gap-3 mt-2">
                  <img
                    :src="ownerDetails.photoURLFile || defaultAvatar"
                    alt="Creador"
                    class="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <router-link
                      :to="ownerDetails.email ? `/profile/${ownerDetails.email}` : '#'"
                      class="text-sm font-medium text-primary dark:text-secondary hover:underline"
                    >
                      {{ ownerDetails.displayName || 'Anónimo' }}
                    </router-link>
                  </div>
                </div>
              </div>

              <!-- Separador -->
              <hr class="border-gray-200 dark:border-gray-700 mb-4" />

              <!-- Sección de Miembros -->
              <div>
                <div class="flex justify-between items-center mb-3">
                  <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Miembros</h2>
                  <button
                    @click="activeTab = 'members'"
                    class="text-sm text-primary dark:text-secondary hover:underline"
                  >
                    Ver todos
                  </button>
                </div>
                <div v-if="membersLoading" class="text-center text-gray-500 dark:text-gray-400 text-sm">
                  Cargando miembros...
                </div>
                <ul v-else-if="membersDetails.length" class="space-y-3">
                  <li
                    v-for="member in membersDetails.slice(0, 3)"
                    :key="member.id"
                    class="flex items-center gap-3"
                  >
                    <img
                      :src="member.photoURLFile || defaultAvatar"
                      alt="Miembro"
                      class="w-8 h-8 rounded-full object-cover"
                    />
                    <span class="text-sm text-gray-600 dark:text-gray-300">{{ member.displayName || 'Anónimo' }}</span>
                  </li>
                </ul>
                <p v-else class="text-sm text-gray-600 dark:text-gray-400">
                  No hay miembros para mostrar.
                </p>
              </div>
            </section>

          </div>
        </div>

        <!-- Pestaña "Conversación" -->
        <div v-else-if="activeTab === 'conversation'" class="text-sm text-gray-600 dark:text-gray-300">
          <ConversationGroupTab :group-id="group.idDoc" :is-member="isMember" />
        </div>

        <!-- Pestaña "Destacados" -->
        <div v-else-if="activeTab === 'highlights'" class="text-sm text-gray-600 dark:text-gray-300">
          <p>Aquí se mostrarán los posteos destacados (próximamente).</p>
        </div>

        <!-- Pestaña "Personas" -->
        <GroupMembersTab v-if="activeTab === 'members'" :members="membersDetails" />

        <!-- Pestaña "Eventos" -->
        <div v-else-if="activeTab === 'events'" class="text-sm text-gray-600 dark:text-gray-300">
          <p>Eventos organizados por este grupo (próximamente).</p>
        </div>

        <!-- Pestaña "Multimedia" -->
        <div v-else-if="activeTab === 'multimedia'" class="text-sm text-gray-600 dark:text-gray-300">
          <p>Galería de fotos y videos compartidos en el grupo (próximamente).</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { formatTimestamp } from '../utils/formatTimestamp'
import { useGroupsStore } from '../stores/groups'
import { useUsersStore } from '../stores/users'
import defaultAvatar from '../assets/avatar1.jpg'
import defaultGroupBanner from '../assets/wallwhite.jpg'
import { useAuth } from '../api/auth/useAuth'
import ConversationGroupTab from '../components/organisms/ConversationGroupTab.vue'
import GroupMembersTab from '../components/organisms/GroupMembersTab.vue'

const route = useRoute()
const groupsStore = useGroupsStore()
const usersStore = useUsersStore()
const { user } = useAuth()

const group = ref(null)
const loading = ref(true)
const membersDetails = ref([])
const ownerDetails = ref({})
const isMember = ref(false)
const isAdmin = ref(false)

// Mock para datos no incluidos en groupData
const recentActivityMock = '5 publicaciones hoy'

// Definir las pestañas
const tabs = [
  { id: 'info', label: 'Información' },
  { id: 'conversation', label: 'Conversación' },
  { id: 'highlights', label: 'Destacados' },
  { id: 'members', label: 'Miembros' },
  { id: 'events', label: 'Eventos' },
  { id: 'multimedia', label: 'Multimedia' },
]
const activeTab = ref('info')

onMounted(async () => {
  const id = route.params.idGroup
  if (id) {
    try {
      group.value = await groupsStore.findGroupById(id)
      isMember.value = group.value?.members?.includes(user.value?.uid) || false
      isAdmin.value = group.value?.ownerId === user.value?.uid || false

      // Cargar detalles del propietario
      if (group.value?.ownerId) {
        ownerDetails.value = await usersStore.getUser(group.value.ownerId)
      }
      debugger
      // Cargar detalles de los miembros
      if (group.value?.members?.length) {
        const userPromises = group.value.members.map(async (userId) => {
          try {
            // if(group.value.ownerId === userId) {
            //   return null // No incluir al propietario en la lista de miembros
            // }
            return await usersStore.getUser(userId)
          } catch (error) {
            console.warn(`No se pudo obtener el usuario con ID ${userId}:`, error)
            return null
          }
        })
        membersDetails.value = (await Promise.all(userPromises)).filter(user => user !== null)
        debugger
      }
    } catch (error) {
      console.error('Error al cargar grupo:', error)
    }
  }
  loading.value = false
})

// Corregir watch para isMember
watch(
  () => group.value?.members,
  (members) => {
    isMember.value = members?.includes(user.value?.uid) || false
  },
  { immediate: true }
)

async function toggleMembership() {
  const groupId = group.value?.idDoc
  const userId = user.value?.uid
  try {
    if (isMember.value) {
      await groupsStore.leaveGroup(groupId, userId)
      group.value.members = group.value.members.filter(id => id !== userId)
      membersDetails.value = membersDetails.value.filter(member => member.id !== userId)
      isMember.value = false
    } else {
      await groupsStore.joinGroup(groupId, userId)
      group.value.members.push(userId)
      const newMember = await usersStore.getUser(userId)
      membersDetails.value.push(newMember)
      isMember.value = true
    }
  } catch (err) {
    console.error('Error al cambiar la membresía del grupo:', err)
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.shadow-lg {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Ajustes para pantallas pequeñas */
@media (max-width: 640px) {
  .text-2xl {
    font-size: 1.25rem;
  }

  .text-xl {
    font-size: 1.125rem;
  }

  .h-64 {
    height: 16rem;
  }

  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>