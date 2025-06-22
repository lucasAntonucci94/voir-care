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
          class="w-full sm:w-1/3 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Buscar usuarios"
        />
        <select
          v-model="filterCountry"
          class="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          aria-label="Filtrar por país"
        >
          <option value="">Filtrar por país</option>
          <option v-for="country in uniqueCountries" :key="country" :value="country">{{ country }}</option>
        </select>
        <select
          v-model="filterRole"
          class="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          aria-label="Filtrar por rol"
        >
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="non-admin">Miembro</option>
        </select>
      </div>

      <!-- Users Table -->
      <div v-if="filteredUsers.length" class="overflow-x-auto">
        <table class="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal">
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
          <tbody class="text-gray-600 dark:text-gray-300 text-sm font-light">
            <tr
              v-for="user in filteredUsers"
              :key="user.uid"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
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
              <td class="py-3 px-6 text-center">
                <div class="flex item-center justify-center gap-2">
                  <button
                    @click="openUserDetailModal(user)"
                    class="text-pink-500 hover:text-blue-700"
                    title="Ver usuario"
                    aria-label="Ver usuario"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    @click="deleteUser(user.uid)"
                    class="text-red-500 hover:text-red-700"
                    :class="user.isDeleted ? 'opacity-50 cursor-not-allowed' : ''"
                    title="Eliminar"
                    aria-label="Eliminar usuario"
                    :disabled="user.isDeleted"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                  <button
                    @click="toggleBlockUser(user)"
                    :class="[user.isBlocked ? 'text-green-500 hover:text-green-700' : 'text-yellow-500 hover:text-yellow-700', user.isDeleted ? 'opacity-50 cursor-not-allowed' : '']"
                    :title="user.isBlocked ? 'Desbloquear' : 'Bloquear'"
                    :aria-label="user.isBlocked ? 'Desbloquear usuario' : 'Bloquear usuario'"
                    :disabled="user.isDeleted"
                  >
                    <i :class="user.isBlocked ? 'fas fa-unlock' : 'fas fa-ban'"></i>
                  </button>
                  <button
                    @click="toggleSuscriptionUser(user)"
                    :class="[!user.isSuscribed ? 'text-green-500 hover:text-green-700' : 'text-yellow-500 hover:text-yellow-700', user.isDeleted ? 'opacity-50 cursor-not-allowed' : '']"
                    :title="!user.isSuscribed ? 'Suscribir' : 'Desuscribir'"
                    :aria-label="!user.isSuscribed ? 'Suscribir usuario' : 'Desuscribir usuario'"
                    :disabled="user.isDeleted"
                  >
                    <i :class="!user.isSuscribed ? 'fa fa-check-circle' : 'fa fa-times-circle'"></i>
                  </button>
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
      <!-- @update="updateUserInList" -->

    <!-- Confirmation Modal -->
    <!-- <GenericConfirmModal
      v-if="showEConfirmationModal"
      :visible="showEConfirmationModal"
      title="¿Desea mostrar esta publicación?"
      message="Esta acción mostrará la publicación nuevamente en tu feed."
      confirmButtonText="Mostrar"
      cancelButtonText="Cancelar"
      @cancel="closeModal"
      @confirmed="deleteUser(selectedUser.uid)"
    /> -->
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUsers } from '../../composable/useUsers';
import { useUsersStore } from '../../stores/users';
import { useSnackbarStore } from '../../stores/snackbar';
import GenericConfirmModal from '../../components/molecules/GenericConfirmModal.vue';
import UserDetailModal from '../../components/molecules/UserDetailModal.vue';

const usersStore = useUsersStore();
const snackbarStore = useSnackbarStore();

const searchQuery = ref('');
const filterCountry = ref('');
const filterRole = ref('');
const showUserDetailModal = ref(false);
const showEditModal = ref(false);
const showEConfirmationModal = ref(false);
const selectedUser = ref(null);

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

// Unique countries for filter dropdown
const uniqueCountries = computed(() => {
  const countries = new Set(usersStore.users.map((user) => user.country).filter(Boolean));
  return [...countries].sort();
});

// Open edit modal
const openConfirmationModal = (action) => {
  
  showEConfirmationModal.value = true;
};

// Open detail modal
const openUserDetailModal = (user) => {
  selectedUser.value = { ...user };
  showUserDetailModal.value = true;
};
// close detail modal
const closeUserDetailModal = () => {
  selectedUser.value = null;
  showUserDetailModal.value = false;
};

// Delete user
const deleteUser = async (uid) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
  try {
    await usersStore.softDelete(uid);
  } catch (error) {
    alert(`Error al eliminar el usuario: ${usersStore.error || 'Intenta de nuevo.'}`);
  }
};

// Toggle global block status
const toggleBlockUser = async (user) => {
  try {
    debugger
    const block = !user.isBlocked;
    await usersStore.blockUserGlobally(user.uid, block);
    snackbarStore.show(`Usuario ${block ? 'bloqueado' : 'desbloqueado'} exitosamente`,'success');
  } catch (error) {
    snackbarStore.show(`Error al ${user.isBlocked ? 'desbloquear' : 'bloquear'} usuario`, 'error');
  }
};

// Toggle suscription status
const toggleSuscriptionUser = async (user) => {
  try {
    const suscribe = !user.isSuscribed;
    await usersStore.suscribeUser(user.uid, suscribe);
    snackbarStore.show(`Usuario ${suscribe ? 'suscripto' : 'desuscripto'} exitosamente`,'success');
  } catch (error) {
    snackbarStore.show(`Error al ${user.isSuscribed ? 'suscrir' : 'desuscrir'} usuario`, 'error');
  }
};

// Manage subscription lifecycle
onMounted(() => {
  usersStore.subscribeUsers();
});

onUnmounted(() => {
  usersStore.unsubscribeUsers();
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