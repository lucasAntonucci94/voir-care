<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <!-- Header with Back Button -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Administración de Usuarios</h1>
    </div>

    <!-- Loading and Error States -->
    <div v-if="usersStore.isLoading" class="text-center text-gray-600 dark:text-gray-300">
      <i class="fas fa-spinner fa-spin mr-2"></i> Cargando usuarios...
    </div>
    <div v-else-if="usersStore.error" class="text-center text-red-500 dark:text-red-400">
      Error: {{ usersStore.error }}
    </div>
    <div v-else>
      <!-- Search and Filters -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre o email..."
          class="w-full sm:w-1/3 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-all duration-200"
          aria-label="Buscar usuarios"
        />
        <select
          v-model="filterCountry"
          class="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
          aria-label="Filtrar por país"
        >
          <option value="">Filtrar por país</option>
          <option v-for="country in uniqueCountries" :key="country" :value="country">{{ country }}</option>
        </select>
        <select
          v-model="filterRole"
          class="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
          aria-label="Filtrar por rol"
        >
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="non-admin">Miembro</option>
        </select>
      </div>

      <!-- Users Table -->
      <div v-if="filteredUsers.length" class="overflow-x-auto rounded-lg">
        <table class="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal dosis-font">
              <th class="py-3 px-6 text-left">Nombre</th>
              <th class="py-3 px-6 text-left">Email</th>
              <th class="py-3 px-6 text-left">País</th>
              <th class="py-3 px-6 text-center">Admin</th>
              <th class="py-3 px-6 text-center">Estado</th>
              <th class="py-3 px-6 text-center">Suscripto</th>
              <th class="py-3 px-6 text-center">Eliminado</th>
              <th class="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 dark:text-gray-300 text-sm font-light josefin-font">
            <tr
              v-for="user in filteredUsers"
              :key="user.uid"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100/80 dark:hover:bg-gray-600/80"
            >
              <td class="py-3 px-6 text-left whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    v-if="user.avatar || user.photoURLFile"
                    :src="user.avatar || user.photoURLFile"
                    alt="Avatar"
                    class="w-8 h-8 rounded-full mr-2"
                  />
                  <span>{{ user.displayName || 'Sin nombre' }}</span>
                </div>
              </td>
              <td class="py-3 px-6 text-left">{{ user.email }}</td>
              <td class="py-3 px-6 text-left">{{ user.country || 'N/A' }}</td>
              <td class="py-3 px-6 text-center">
                <span :class="user.isAdmin ? 'text-green-500' : 'text-red-500'">
                  {{ user.isAdmin ? 'Sí' : 'No' }}
                </span>
              </td>
              <td class="py-3 px-6 text-center">
                <span :class="user.isBlocked ? 'text-red-500' : 'text-green-500'">
                  {{ user.isBlocked ? 'Bloqueado' : 'Activo' }}
                </span>
              </td>
              <td class="py-3 px-6 text-center">
                <span :class="user.isSuscribed ? 'text-green-500' : 'text-red-500'">
                  {{ user.isSuscribed ? 'Sí' : 'No' }}
                </span>
              </td>
              <td class="py-3 px-6 text-center">
                <span :class="user.isDeleted ? 'text-green-500' : 'text-red-500'">
                  {{ user.isDeleted ? 'Sí' : 'No' }}
                </span>
              </td>
              <td class="flex items-center justify-between gap-2  py-3 px-6 text-center">
                <button 
                  @click="openUserDetailModal(user)" 
                  class="w-full text-left px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                >
                  <i class="fas fa-eye mr-2 text-primary dark:text-secondary"></i> Ver
                </button>
                <div class="relative" :ref="`dropdown-${user.uid}`">
                  <button 
                    @click="toggleActionsMenu(user.uid)" 
                    class="text-gray-600 hover:text-primary dark:text-white dark:hover:text-secondary focus:outline-none transition-colors duration-200 bg-gray-100/10 hover:bg-gray-100/40 dark:bg-gray-700 hover:dark:bg-gray-800 rounded-full p-1 w-8 h-8 shadow-sm hover:shadow-md"
                    :disabled="user.isDeleted"
                    :class="user.isDeleted ? 'opacity-50 cursor-not-allowed' : ''"
                    aria-label="Más acciones"
                    :aria-disabled="user.isDeleted"
                  >
                    <i class="fas fa-ellipsis-h"></i>
                  </button>
                  <div 
                    v-if="activeDropdown === user.uid"
                    class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 dark:border-gray-800 border border-gray-200 rounded-lg shadow-lg z-10"
                  >
                    <ul class="py-1 text-sm text-gray-700 dark:text-gray-200">
                      <li>
                        <button 
                          @click="setGenericModalConfig('softDelete', user)" 
                          class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                          :class="user.isDeleted ? 'opacity-50 cursor-not-allowed' : ''"
                          :disabled="user.isDeleted"
                        >
                          <i class="fas fa-trash-can mr-2 text-red-500"></i> Eliminar
                        </button>
                      </li>
                      <li>
                        <button 
                          @click="setGenericModalConfig('block', user)"
                          class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                          :class="[user.isBlocked ? 'text-green-500 hover:text-green-700' : 'text-yellow-500 hover:text-yellow-700', user.isDeleted ? 'opacity-50 cursor-not-allowed' : '']"
                          :disabled="user.isDeleted"
                        >
                          <i :class="user.isBlocked ? 'fas fa-unlock mr-2' : 'fas fa-ban mr-2'"></i>
                          {{ user.isBlocked ? 'Desbloquear' : 'Bloquear' }}
                        </button>
                      </li>
                      <li>
                        <button 
                          @click="setGenericModalConfig('suscribe', user)"
                          class="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-primary dark:bg-gray-700 dark:hover:bg-gray-800 dark:hover:text-secondary transition-all duration-200"
                          :class="[!user.isSuscribed ? 'text-green-500 hover:text-green-700' : 'text-yellow-500 hover:text-yellow-700', user.isDeleted ? 'opacity-50 cursor-not-allowed' : '']"
                          :disabled="user.isDeleted"
                        >
                          <i :class="!user.isSuscribed ? 'fa fa-check-circle mr-2' : 'fa fa-times-circle mr-2'"></i>
                          {{ !user.isSuscribed ? 'Suscribir' : 'Desuscribir' }}
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-600 dark:text-gray-300">
        No se encontraron usuarios con los filtros aplicados.
      </div>
    </div>

    <!-- Modal detalle de usuario -->
    <UserDetailModal
      v-if="showUserDetailModal"
      :visible="showUserDetailModal"
      :user="selectedUser"
      @close="closeUserDetailModal"
      @softDelete="closeUserDetailModal"
      @toggleAdmin="closeUserDetailModal"
      @toggleSubscription="closeUserDetailModal"
    />

    <!-- Modal de confirmacion para mostrar un post (elimina idDoc de array de hiddenPosts) -->
    <GenericConfirmModal
      v-if="showConfirmModal"
      :visible="showConfirmModal"
      :title="genericModalConfig.title"
      :message="genericModalConfig.message"
      :confirmButtonText="genericModalConfig.confirmButtonText"
      :cancelButtonText="genericModalConfig.cancelButtonText"
      @cancel="genericModalConfig.cancelMethod"
      @confirmed="genericModalConfig.confirmMethod"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUsersStore } from '../../stores/users';
import { useSnackbarStore } from '../../stores/snackbar';
import UserDetailModal from '../../components/molecules/UserDetailModal.vue';
import GenericConfirmModal from '../../components/molecules/GenericConfirmModal.vue';

const usersStore = useUsersStore();
const snackbarStore = useSnackbarStore();

const searchQuery = ref('');
const filterCountry = ref('');
const filterRole = ref('');
const showUserDetailModal = ref(false);
const showConfirmModal = ref(false);
const selectedUser = ref(null);
const activeDropdown = ref(null); // Estado para rastrear el dropdown activo
const genericModalConfig = ref({
  title: '',
  message: '',
  confirmButtonText: 'Confirmar',
  cancelButtonText: 'Cancelar',
  cancelMethod: () => {
    showConfirmModal.value = false;
    document.body.style.overflow = ''; // Re-enable scrolling when modal is closed
  },
  confirmMethod: () => {
    showConfirmModal.value = false;
    document.body.style.overflow = ''; // Re-enable scrolling when modal is closed
  }
});
// Computed property for filtered users
const filteredUsers = computed(() => {
  let filtered = usersStore.users;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (user) =>
        user.displayName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  }

  if (filterCountry.value) {
    filtered = filtered.filter((user) => user.country === filterCountry.value);
  }

  if (filterRole.value) {
    filtered = filtered.filter((user) =>
      filterRole.value === 'admin' ? user.isAdmin : !user.isAdmin
    );
  }
  return filtered;
});

// implementacion para mock, reemplazar esto por selectCountry que ya tiene definido los paises.
const uniqueCountries = computed(() => {
  const countries = new Set(usersStore.users.map((user) => user.country).filter(Boolean));
  return [...countries].sort();
});

// Open detail modal
const openUserDetailModal = (user) => {
  selectedUser.value = { ...user };
  showUserDetailModal.value = true;
  activeDropdown.value = null; // Cierra el dropdown al abrir el modal
  document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
};

// Close detail modal
const closeUserDetailModal = () => {
  selectedUser.value = null;
  showUserDetailModal.value = false;
  document.body.style.overflow = '';
};

// Delete user
const deleteUser = async (uid) => {
  try {
    await usersStore.softDelete(uid);
    activeDropdown.value = null; // Cierra el dropdown tras la acción
  } catch (error) {
    alert(`Error al eliminar el usuario: ${usersStore.error || 'Intenta de nuevo.'}`);
  }
};

// Toggle global block status
const toggleBlockUser = async (user) => {
  try {
    const block = !user.isBlocked;
    await usersStore.blockUserGlobally(user.uid, block);
    snackbarStore.show(`Usuario ${block ? 'bloqueado' : 'desbloqueado'} exitosamente`, 'success');
    activeDropdown.value = null; // Cierra el dropdown tras la acción
  } catch (error) {
    snackbarStore.show(`Error al ${user.isBlocked ? 'desbloquear' : 'bloquear'} usuario`, 'error');
  }
};

// Toggle suscription status
const toggleSuscriptionUser = async (user) => {
  try {
    const suscribe = !user.isSuscribed;
    await usersStore.suscribeUser(user.uid, suscribe);
    snackbarStore.show(`Usuario ${suscribe ? 'suscripto' : 'desuscripto'} exitosamente`, 'success');
    activeDropdown.value = null; // Cierra el dropdown tras la acción
  } catch (error) {
    snackbarStore.show(`Error al ${user.isSuscribed ? 'suscrir' : 'desuscrir'} usuario`, 'error');
  }
};

// Toggle dropdown menu
const toggleActionsMenu = (uid) => {
  activeDropdown.value = activeDropdown.value === uid ? null : uid;
};

// Handle click outside to close dropdown
const handleClickOutside = (event) => {
  filteredUsers.value.forEach(user => {
    const dropdown = document.querySelector(`[ref="dropdown-${user.uid}"]`);
    if (dropdown && !dropdown.contains(event.target)) {
      activeDropdown.value = null;
    }
  });
};

// Set generic modal configuration
const setGenericModalConfig = (action, user) => {
  switch (action) {
    case 'suscribe':
      genericModalConfig.value = {
        title: 'Asignar rol de suscripción',
        message:`¿Deseas ${!user.isSuscribed ? 'suscribir' : 'desuscribir'} a este ${user.displayName}?`,
        confirmButtonText: user.isSuscribed ? 'Desuscribir' : 'Suscribir',
        cancelButtonText: 'Cancelar',
        confirmMethod: () => {
          toggleSuscriptionUser(user);
          showConfirmModal.value = false;
          document.body.style.overflow = ''; // Re-enable scrolling when modal is closed
        },
        cancelMethod: () => {
          showConfirmModal.value = false;
          document.body.style.overflow = ''; // Re-enable scrolling when modal is closed
        }
      };
      break;
    case 'softDelete':
      genericModalConfig.value = {
        title: 'Eliminar usuario',
        message: `¿Estás seguro de que deseas eliminar a ${user.displayName ?? 'este usuario'}?`,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        confirmMethod: () => {
          deleteUser(user.uid);
          showConfirmModal.value = false;
          document.body.style.overflow = ''; // Re-enable scrolling when modal is closed
        },
        cancelMethod: () => {
          showConfirmModal.value = false;
          document.body.style.overflow = ''; // Re-enable scrolling when modal is closed
        }
      };
      break;
    case 'block':
      genericModalConfig.value = {
        title: 'Bloquear usuario',
        message: `¿Deseas ${!user.isBlocked ? 'bloquear' : 'desbloquear'} a ${user.displayName ?? 'este usuario'}?`,
        confirmButtonText: 'Bloquear',
        cancelButtonText: 'Cancelar',
        confirmMethod: () => {
          toggleBlockUser(user);
          showConfirmModal.value = false;
          document.body.style.overflow = ''; // Re-enable scrolling when modal is closed
        },
        cancelMethod: () => {
          showConfirmModal.value = false;
          document.body.style.overflow = ''; // Re-enable scrolling when modal is closed
        }
      };
      break;
    default:
      genericModalConfig.value = {
        title: 'Acción no definida',
        message: 'No se ha definido una acción para esta operación.',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmMethod: () => {},
        cancelMethod: () => {
          showConfirmModal.value = false;
          document.body.style.overflow = ''; // Re-enable scrolling when modal is closed
        }
      };
  }
  showConfirmModal.value = true;
  document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
};

// Manage subscription lifecycle
onMounted(() => {
  usersStore.subscribeUsers();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  usersStore.unsubscribeUsers();
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Custom styles for table and buttons */
table {
  border-collapse: separate;
  border-spacing: 0;
}

th,
td {
  border-right: 1px solid #e5e7eb;
}

th:last-child,
td:last-child {
  border-right: none;
}

button i {
  font-size: 1.25rem;
}

/* Primary color for buttons */
.bg-primary {
  background-color: #3b82f6;
}

.bg-primary:hover {
  background-color: #2563eb;
}

.bg-primary-dark {
  background-color: #2563eb;
}

/* Dark mode adjustments */
.dark .bg-primary {
  background-color: #60a5fa;
}

.dark .bg-primary:hover {
  background-color: #3b82f6;
}

.dark .bg-primary-dark {
  background-color: #3b82f6;
}
</style>