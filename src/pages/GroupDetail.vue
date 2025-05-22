<template>
  <div v-if="loading" class="flex items-center justify-center h-screen">
    <p class="text-lg text-gray-500 dark:text-gray-300">Cargando grupo...</p>
  </div>
  <div v-else-if="!group" class="flex items-center justify-center h-screen">
    <p class="text-lg text-red-500 dark:text-red-400">Grupo no encontrado.</p>
  </div>
  <div v-else class="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
    <!-- Banner -->
    <div  @click="openMediaModal(group.media)" class="relative w-full h-64 md:h-96 overflow-hidden">
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
      <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav class="flex overflow-x-auto space-x-4" role="tablist">
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
        <!-- Settings Dropdown Button -->
        <div ref="dropdownRef" class="relative">
          <button
            @click="showSettingsMenu = !showSettingsMenu"
            class="flex items-center text-gray-600 hover:text-primary dark:text-white dark:hover:text-gray-300 focus:outline-none transition-colors duration-200 bg-gray-100/10 hover:bg-gray-100/40 dark:bg-gray-700 hover:dark:bg-gray-600 rounded-lg p-2 h-8 shadow-sm hover:shadow-md"
          >
            <i class="fas fa-cog"></i>
            <span class="ml-2 text-sm  hidden md:inline">Configuración</span>
          </button>
          <div
            v-if="showSettingsMenu"
            class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 dark:border-gray-800 border border-gray-200 rounded-lg shadow-lg z-10"
          >
            <ul class="py-1 text-sm text-gray-700 dark:text-gray-200">
              <!-- Edit Group (Owner or Admin) -->
              <li v-if="isAdmin || group?.ownerId === user?.uid">
                <button
                  @click="openEditModal"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                >
                  <i class="fas fa-pen mr-2"></i> Editar Grupo
                </button>
              </li>
              <!-- Delete Group (Owner or Admin) -->
              <li v-if="isAdmin || group?.ownerId === user?.uid">
                <button
                  @click="openDeleteModal"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                >
                  <i class="fas fa-trash-can mr-2"></i> Eliminar Grupo
                </button>
              </li>
              <!-- Report Group (Non-owner, non-admin) -->
              <li v-if="group?.ownerId !== user?.uid && !isAdmin">
                <button
                  @click="showReportGroupModal"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                >
                  <i class="fas fa-flag mr-2"></i> Reportar Grupo
                </button>
              </li>
              <!-- Hide Group (Non-owner, non-admin) -->
              <!-- <li v-if="group?.ownerId !== user?.uid && !isAdmin">
                <button
                  @click="showHideGroupModal"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                >
                  <i class="fas fa-eye-slash mr-2"></i> Ocultar Grupo
                </button>
              </li> -->
              <!-- Hide Group (Non-owner, non-admin) -->
              <li v-if="group?.ownerId !== user?.uid && !isAdmin && isMember">
                <button
                  @click="toggleMembership"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                >
                  <i class="fas fa-close mr-2"></i> Salir del Grupo
                </button>
              </li>
            </ul>
          </div>
        </div>
        <!-- Modal de confirmación para reportar un post -->
        <div v-if="showReportModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 transition-opacity duration-300">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl transform transition-all duration-300">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">¿Desea reportar esta publicación?</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">¿Estás seguro de que quieres reportar esta publicación?</p>
            <label class="block mb-2 text-gray-700 dark:text-gray-300">Motivo del reporte:</label>
            <select v-model="selectedReportReason" class="w-full mb-4 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 focus:border-primary dark:focus:border-secondary rounded-lg px-3 py-2">
              <option value="" disabled selected>Seleccione un motivo</option>
              <option value="Contenido inapropiado">Contenido inapropiado</option>
              <option value="Spam">Spam</option>
              <option value="Información errónea">Información errónea</option>
              <option value="Otro">Otro</option>
            </select>
            <label class="block mb-2 text-gray-700 dark:text-gray-300">Descripción (opcional):</label>
            <textarea v-model="reportDescription" rows="3" class="w-full mb-4 border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 rounded-lg px-3 py-2" placeholder="Agrega una descripción adicional..."></textarea>
            <div class="flex justify-end gap-3">
              <button 
                @click="closeReportModal" 
                class="px-4 py-2 text-gray-500 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-200 font-medium rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                :disabled="loading || !selectedReportReason"
                type="submit"
                @click="handleReport" 
                class="relative px-5 py-2 bg-primary dark:bg-secondary text-white font-medium rounded-lg hover:bg-primary-md dark:hover:bg-secondary-md transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-primary-md dark:disabled:bg-secondary-md disabled:cursor-not-allowed"
              >
                <span v-if="!loading">Reportar</span>
                <span v-else class="flex items-center gap-2">
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Reportando...
                </span>
              </button>
            </div>
          </div>
        </div>
        <!-- Modal de confirmación de eliminación -->
        <GenericConfirmModal
          v-if="showDeleteModal"
          :visible="showDeleteModal"
          title="¿Eliminar Grupo?"
          message="Esta acción no se puede deshacer. ¿Estás seguro de que quieres continuar?"
          confirmButtonText="Eliminar"
          cancelButtonText="Cancelar"
          @cancel="closeDeleteModal"
          @confirmed="confirmDelete"
        />
        <!-- Modal de edición de grupo -->
        <EditGroupModal
          v-if="showEditModal"
          :visible="showEditModal"
          :group="selectedGroup"
          @close="closeEditModal"
          @groupUpdated="handleGroupUpdated"
        />
        <!-- Media Modal -->
        <MediaModalViewer
          :visible="showMediaModal"
          :media="selectedMedia"
          @close="closeMediaModal"
        />
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
                  <span><strong>Privacidad:</strong> {{ group.privacy.toLowerCase() === 'public' ? 'Público' : 'Privado' }}</span>
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
                <li v-if="group.rules" class="flex items-center gap-3">
                  <i class="fas fa-book text-primary dark:text-secondary text-xl"></i>
                  <span><strong>Reglas:</strong> {{ group.rules }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Columna derecha: Acciones, Creador, Miembros -->
          <div class="space-y-6">
            <!-- Card de Acciones -->
            <section
              v-if="!isAdmin && !isMember"
              class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 class="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100 sr-only">Acciones</h2>
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
              </div>
            </section>

            <!-- Card de Creador y Miembros -->
            <section
              class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-200 dark:border-gray-700 relative"
            >
              <!-- Header with Button -->
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Creador</h2>
                <button
                  class="w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center"
                  @click="openInviteFriendsModal"
                >
                  Invitar
                </button>
              </div>

              <!-- Sección de Creador -->
              <div class="mb-4">
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
            <InviteFriendsModal :visible="showModalInviteFriends" @close="closeInviteFriendsModal" />
          </div>
        </div>

        <!-- Pestaña "Conversación" -->
        <div v-else-if="activeTab === 'conversation'" class="text-sm text-gray-600 dark:text-gray-300">
          <ConversationGroupTab :group="group" :is-member="isMember" />
        </div>

        <!-- Pestaña "Personas" -->
        <GroupMembersTab v-if="activeTab === 'members'" :members="membersDetails" />

        <!-- Pestaña "Multimedia" -->
        <div v-else-if="activeTab === 'multimedia'" class="text-sm text-gray-600 dark:text-gray-300">
          <p>Galería de fotos y videos compartidos en el grupo (próximamente).</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatTimestamp } from '../utils/formatTimestamp'
import { useGroupsStore } from '../stores/groups'
import { useUsersStore } from '../stores/users'
import defaultAvatar from '../assets/avatar1.jpg'
import defaultGroupBanner from '../assets/wallwhite.jpg'
import { useAuth } from '../api/auth/useAuth'
import ConversationGroupTab from '../components/organisms/ConversationGroupTab.vue'
import GroupMembersTab from '../components/organisms/GroupMembersTab.vue'
import InviteFriendsModal from '../components/molecules/InviteFriendsModal.vue'
import { useReports } from '../composable/useReports';
import { useSnackbarStore } from '../stores/snackbar'
import GenericConfirmModal from '../components/molecules/GenericConfirmModal.vue'
import EditGroupModal from '../components/organisms/EditGroupModal.vue'
import MediaModalViewer from '../components/molecules/MediaViewerModal.vue';

const route = useRoute()
const router = useRouter()
const groupsStore = useGroupsStore()
const usersStore = useUsersStore()
const { user } = useAuth()
const { saveReport } = useReports();
const snackbarStore = useSnackbarStore()

const group = ref(null)
const loading = ref(true)
const membersDetails = ref([])
const ownerDetails = ref({})
const isMember = ref(false)
const isAdmin = ref(false)
const showModalInviteFriends = ref(false)
const showSettingsMenu = ref(false)
const dropdownRef = ref(null)
const selectedReportReason = ref('');
const reportDescription = ref('');
const showReportModal = ref(false)
const showDeleteModal = ref(false)
const showEditModal = ref(false)
const selectedGroup = ref(null)
const showMediaModal = ref(false)
const selectedMedia = ref({ src: '', type: 'image' });

// Definir las pestañas
const tabs = [
  { id: 'info', label: 'Información' },
  { id: 'conversation', label: 'Conversación' },
  { id: 'members', label: 'Miembros' },
  // { id: 'multimedia', label: 'Galería' },
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
      // Cargar detalles de los miembros
      if (group.value?.members?.length) {
        const userPromises = group.value.members.map(async (userId) => {
          try {
            return await usersStore.getUser(userId)
          } catch (error) {
            console.warn(`No se pudo obtener el usuario con ID ${userId}:`, error)
            return null
          }
        })
        membersDetails.value = (await Promise.all(userPromises)).filter(user => user !== null)
      }
    } catch (error) {
      console.error('Error al cargar grupo:', error)
    }
  }
  loading.value = false

  // Add event listener for click outside
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Remove event listener
  document.removeEventListener('click', handleClickOutside)
})

// Handle click outside to close dropdown
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showSettingsMenu.value = false
  }
}

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

function openInviteFriendsModal() {
  showModalInviteFriends.value = true
  document.body.style.overflow = 'hidden'
}

function closeInviteFriendsModal() {
  showModalInviteFriends.value = false
  document.body.style.overflow = ''
}

async function showReportGroupModal() {
  showSettingsMenu.value = false
  showReportModal.value = true
}

// Confirmar report
async function handleReport() {
  if (!selectedReportReason.value) return;

  loading.value = true;
  const response = await saveReport({
      entityType: 'group',
      entityId:  group.value?.idDoc,
      userId: user.value?.uid,
      reason: selectedReportReason.value,
      description: reportDescription.value,
      metadata: { title: group.value?.title },
    });

  if (response) {
    loading.value = false;
    showReportModal.value = false;
    document.body.style.overflow = '';
    snackbarStore.show('Gracias por tu cooperación.', 'success');
  } else {
    snackbarStore.show('Error al reportar una publicación', 'success');
  }
}

// Cerrar modal reportar post
function closeReportModal() {
  showReportModal.value = false;
  document.body.style.overflow = '';
}


function openDeleteModal() {
  showSettingsMenu.value = false;
  showDeleteModal.value = true
  document.body.style.overflow = 'hidden'
}

function closeDeleteModal() {
  showDeleteModal.value = false
  document.body.style.overflow = ''
}

async function confirmDelete() {
  try {
    await groupsStore.deleteGroup(group.value.idDoc)
    closeDeleteModal()
    console.log('Grupo eliminado')
    router.push({ name: 'groups' })
    snackbarStore.show('Grupo eliminado', 'success')
  } catch (error) {
    console.error('Error al eliminar grupo:', error)
    snackbarStore.show('Error al eliminar grupo', 'error')
    return
  }
}

// Funciones para modal de edicion
function openEditModal() {
  // Suponemos que `group` ya tiene todos los datos completos
  selectedGroup.value = group.value
  showEditModal.value = true
  showSettingsMenu.value = false
}

function closeEditModal() {
  showEditModal.value = false
  selectedGroup.value = null
}

function handleGroupUpdated(updatedGroup) {
  group.value = updatedGroup
  closeEditModal()
}
  

function showHideGroupModal() {
  showSettingsMenu.value = false
  // Implement modal logic for hiding group
  console.log('Abrir modal para ocultar grupo')
}


  // Modal functions
  const openMediaModal = (media) => {
    selectedMedia.value = { src: media.url, type: media.type };
    showMediaModal.value = true;
    document.body.style.overflow = 'hidden';
  };
  
  const closeMediaModal = () => {
    selectedMedia.value = { src: '', type: 'image' };
    showMediaModal.value = false;
    document.body.style.overflow = '';
  };
  
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