<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <!-- Header with Back Button -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <RouterLink
          to="/admin/dashboard"
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center gap-2"
          aria-label="Volver al Dashboard"
        >
          <i class="fas fa-arrow-left"></i> Volver al Dashboard
        </RouterLink>
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Administración de Usuarios</h1>
      </div>
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
                <span :class="user.isBlockedGlobally ? 'text-red-500' : 'text-green-500'">
                  {{ user.isBlockedGlobally ? 'Bloqueado' : 'Activo' }}
                </span>
              </td>
              <td class="py-3 px-6 text-center">
                <div class="flex item-center justify-center gap-2">
                  <button
                    @click="openEditModal(user)"
                    class="text-blue-500 hover:text-blue-700"
                    title="Editar"
                    aria-label="Editar usuario"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="deleteUser(user.uid)"
                    class="text-red-500 hover:text-red-700"
                    title="Eliminar"
                    aria-label="Eliminar usuario"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                  <button
                    @click="toggleBlockUser(user)"
                    :class="user.isBlockedGlobally ? 'text-green-500 hover:text-green-700' : 'text-yellow-500 hover:text-yellow-700'"
                    :title="user.isBlockedGlobally ? 'Desbloquear' : 'Bloquear'"
                    :aria-label="user.isBlockedGlobally ? 'Desbloquear usuario' : 'Bloquear usuario'"
                  >
                    <i :class="user.isBlockedGlobally ? 'fas fa-unlock' : 'fas fa-ban'"></i>
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

    <!-- Edit Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Editar Usuario</h2>
        <form @submit.prevent="saveUser">
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="displayName">Nombre</label>
            <input
              id="displayName"
              v-model="editUser.displayName"
              type="text"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              aria-required="true"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="email">Email</label>
            <input
              id="email"
              v-model="editUser.email"
              type="email"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              disabled
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 mb-1" for="country">País</label>
            <input
              id="country"
              v-model="editUser.country"
              type="text"
              class="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div class="mb-4">
            <label class="flex items-center text-gray-700 dark:text-gray-300">
              <input
                v-model="editUser.isAdmin"
                type="checkbox"
                class="mr-2"
                aria-label="Es administrador"
              />
              Es Admin
            </label>
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md"
              aria-label="Cancelar"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary text-white rounded-md"
              aria-label="Guardar cambios"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useUsers } from '../../composable/useUsers';
import { useUsersStore } from '../../stores/users';
import { useSnackbarStore } from '../../stores/snackbar';

const usersStore = useUsersStore();
const snackbarStore = useSnackbarStore();
const { updateUser } = useUsers();

const searchQuery = ref('');
const filterCountry = ref('');
const filterRole = ref('');
const showEditModal = ref(false);
const editUser = ref(null);

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
const openEditModal = (user) => {
  editUser.value = { ...user };
  showEditModal.value = true;
};

// Save user changes
const saveUser = async () => {
  try {
    await updateUser(editUser.value.uid, {
      displayName: editUser.value.displayName,
      email: editUser.value.email,
      country: editUser.value.country,
      isAdmin: editUser.value.isAdmin,
    });
    showEditModal.value = false;
  } catch (error) {
    console.error('Error updating user:', error);
    alert('Error al guardar los cambios. Intenta de nuevo.');
  }
};

// Delete user
const deleteUser = async (uid) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
  try {
    await usersStore.deleteUser(uid);
  } catch (error) {
    alert(`Error al eliminar el usuario: ${usersStore.error || 'Intenta de nuevo.'}`);
  }
};

// Toggle global block status
const toggleBlockUser = async (user) => {
  try {
    const block = !user.isBlockedGlobally;
    await usersStore.blockUserGlobally(user.uid, block);
    snackbarStore.show(`Usuario ${block ? 'bloqueado' : 'desbloqueado'} exitosamente`,'success');
  } catch (error) {
    snackbarStore.show(`Error al ${user.isBlockedGlobally ? 'desbloquear' : 'bloquear'} usuario`, 'error');
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