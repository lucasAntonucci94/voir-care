<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-101 p-4 animate-fade-in"
    role="dialog"
    aria-labelledby="user-admin-modal-title"
    aria-modal="true"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
    >
      <!-- Encabezado -->
      <div class="flex items-center justify-between pb-3 mb-4">
        <h2
          id="user-admin-modal-title"
          class="text-lg font-bold text-[#2c3e50] dark:text-white"
        >
          Detalle del usuario
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary transition-colors"
          aria-label="Cerrar modal de detalle del usuario"
        >
          <i class="fa-solid fa-times text-xl"></i>
        </button>
      </div>

      <!-- Contenido principal -->
      <div class="grid grid-cols-1 gap-4">
        <!-- Sección de información básica -->
        <div>
          <!-- Foto de perfil -->
          <div class="flex items-center gap-4 mb-4">
            <div class="relative">
              <img
                v-if="user.photoURLFile"
                :src="user.photoURLFile"
                :alt="`Foto de perfil de ${user.displayName || 'usuario'}`"
                class="w-12 h-12 rounded-full border-2 border-gray-200 object-cover shadow-sm"
              />
              <div
                v-else
                class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-gray-200 shadow-sm"
              >
                <i class="fa-solid fa-user text-lg"></i>
              </div>
            </div>
            <div>
              <h3
                class="text-base font-bold text-[#2c3e50] dark:text-white"
                :title="user.displayName || user.email"
              >
                {{ user.displayName || user.email || "Usuario" }}
              </h3>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                ID: {{ user.uid }}
              </p>
            </div>
          </div>

          <!-- Información personal -->
          <dl class="space-y-2 text-sm">
            <div>
              <dt class="font-medium text-gray-600 dark:text-gray-300">
                Email
              </dt>
              <dd class="text-[#2c3e50] dark:text-white">
                {{ user.email || "No especificado" }}
              </dd>
            </div>
            <div>
              <dt class="font-medium text-gray-600 dark:text-gray-300">
                Nombre completo
              </dt>
              <dd class="text-[#2c3e50] dark:text-white">
                {{ user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "No especificado" }}
              </dd>
            </div>
            <div>
              <dt class="font-medium text-gray-600 dark:text-gray-300">
                Teléfono
              </dt>
              <dd class="text-[#2c3e50] dark:text-white">
                {{ user.phoneNumber || "No especificado" }}
              </dd>
            </div>
            <div>
              <dt class="font-medium text-gray-600 dark:text-gray-300">
                Fecha de nacimiento
              </dt>
              <dd class="text-[#2c3e50] dark:text-white">
                {{ formatDate(user.birthday) || "No especificada" }}
              </dd>
            </div>
            <div>
              <dt class="font-medium text-gray-600 dark:text-gray-300">
                Género
              </dt>
              <dd class="text-[#2c3e50] dark:text-white">
                {{ user.genre || "No especificado" }}
              </dd>
            </div>
            <div>
              <dt class="font-medium text-gray-600 dark:text-gray-300">
                País
              </dt>
              <dd class="text-[#2c3e50] dark:text-white">
                {{ user.country || "No especificado" }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Sección de roles y estado -->
        <div class="mt-4">
          <!-- Estado de la cuenta -->
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-600 dark:text-gray-300">
              Estado de la cuenta
            </h4>
            <p
              class="text-sm font-semibold"
              :class="{
                'text-primary dark:text-secondary': !user.isBlocked && !user.isDeleted,
                'text-red-500': user.isBlocked,
                'text-gray-500': user.isDeleted,
              }"
            >
              {{ statusLabel(user.isBlocked, user.isDeleted) }}
            </p>
          </div>

          <!-- Roles -->
          <div>
            <h4 class="text-sm font-medium text-gray-600 dark:text-gray-300">
              Roles
            </h4>
            <div class="flex flex-col gap-2 mt-2">
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="localUser.isAdmin"
                  @change="toggleAdminRole"
                  :disabled="isLoading || user.isDeleted"
                  class="h-4 w-4 text-primary focus:ring-primary dark:text-secondary dark:focus:ring-secondary border-gray-300 rounded"
                  :aria-label="`Alternar rol de administrador para ${user.displayName || user.email}`"
                />
                <span class="text-sm text-[#2c3e50] dark:text-white">
                  Administrador
                </span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="localUser.isSuscribed"
                  @change="toggleSubscriberRole"
                  :disabled="isLoading || user.isDeleted"
                  class="h-4 w-4 text-primary focus:ring-primary dark:text-secondary dark:focus:ring-secondary border-gray-300 rounded"
                  :aria-label="`Alternar rol de suscriptor para ${user.displayName || user.email}`"
                />
                <span class="text-sm text-[#2c3e50] dark:text-white">
                  Suscriptor
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones administrativas -->
      <div class="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4">
          Acciones administrativas
        </h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-if="!user.isBlocked && !user.isDeleted"
            @click="toggleBlockUser"
            :disabled="isLoading"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            :aria-label="`Bloquear usuario ${user.displayName || user.email}`"
          >
            <i class="fa-solid fa-ban"></i>
            <span>Bloquear</span>
          </button>
          <button
            v-if="user.isBlocked && !user.isDeleted"
            @click="toggleBlockUser"
            :disabled="isLoading"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 dark:bg-secondary dark:hover:bg-secondary/90 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            :aria-label="`Desbloquear usuario ${user.displayName || user.email}`"
          >
            <i class="fa-solid fa-check"></i>
            <span>Desbloquear</span>
          </button>
          <button
            v-if="!user.isDeleted"
            @click="softDeleteUser"
            :disabled="isLoading"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            :aria-label="`Eliminar lógicamente usuario ${user.displayName || user.email}`"
          >
            <i class="fa-solid fa-trash"></i>
            <span>Eliminar</span>
          </button>
          <button
            @click="viewReports"
            :disabled="isLoading || user.isDeleted"
            class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            :aria-label="`Ver reportes de ${user.displayName || user.email}`"
          >
            <i class="fa-solid fa-flag"></i>
            <span>Ver reportes</span>
          </button>
        </div>
      </div>

      <!-- Mensaje de error -->
      <p
        v-if="errorMessage"
        class="mt-4 text-red-500 text-sm"
        role="alert"
        aria-live="assertive"
      >
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>
<script setup>
// Importaciones
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useSnackbarStore } from "../../stores/snackbar";
import { useUsersStore } from '../../stores/users';

// Props
const props = defineProps({
  user: { type: Object, required: true },
  visible: { type: Boolean, required: true },
});

// Emits
const emit = defineEmits(["close", "update"]);

// Estados
const isLoading = ref(false);
const errorMessage = ref("");
const snackbarStore = useSnackbarStore();
const usersStore = useUsersStore();

// Copia local del usuario para manejar toggles
const localUser = reactive({
  isAdmin: props.user.isAdmin || false,
  isSuscribed: props.user.isSuscribed || false,
});

// Listener para la tecla Escape
const handleEscape = (event) => {
  if (event.key === 'Escape' && props.visible) {
    emit('close');
  }
};

// Agregar y remover el eventListener
onMounted(() => {
  window.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape);
});

// Formateo de fechas
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Etiqueta para el estado
const statusLabel = (isBlocked, isDeleted) => {
  if (isDeleted) return "Eliminado";
  if (isBlocked) return "Bloqueado";
  return "Activo";
};

// Acciones administrativas
const toggleBlockUser = async () => {
  try {
    const block = !props.user.isBlocked;
    await usersStore.blockUserGlobally(props.user.uid, block);
    props.user.isBlocked = block;
    snackbarStore.show(`Usuario ${block ? 'bloqueado' : 'desbloqueado'} exitosamente`, 'success');
  } catch (error) {
    snackbarStore.show(`Error al ${props.isBlocked ? 'desbloquear' : 'bloquear'} usuario`, 'error');
  }
};

const toggleAdminRole = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const adminRol = !props.user.isAdmin;
    await usersStore.setAdmin(props.user.uid, adminRol);
    snackbarStore.show(`Usuario ${adminRol ? 'suscripto' : 'desuscripto'} exitosamente`, 'success');
    props.user.isAdmin = adminRol; // Actualizar el estado local
    emit("update", { ...props.user, isAdmin: adminRol }); // Emitir el cambio
  } catch (err) {
    errorMessage.value = "Error al actualizar el rol de administrador.";
    snackbarStore.show("Error al actualizar el rol de administrador.", "error");
    localUser.isAdmin = !localUser.isAdmin; // Revertir cambio local en caso de error
  } finally {
    isLoading.value = false;
  }
};

const toggleSubscriberRole = async () => {
  try {
    const suscribe = !props.user.isSuscribed;
    await usersStore.suscribeUser(props.user.uid, suscribe);
    snackbarStore.show(`Usuario ${suscribe ? 'suscripto' : 'desuscripto'} exitosamente`, 'success');
    props.user.isSuscribed = suscribe; // Actualizar el estado local
    emit("update", { ...props.user, isSuscribed: suscribe }); // Emitir el cambio
  } catch (error) {
    snackbarStore.show(`Error al ${props.user.isSuscribed ? 'suscrir' : 'desuscrir'} usuario`, 'error');
  }
};

const softDeleteUser = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    await usersStore.softDelete(props.user.uid);
    const updatedUser = { ...props.user, isDeleted: true, deletedAt: new Date().toISOString() };
    emit("update", updatedUser);
    snackbarStore.show("Usuario eliminado.", "success");
    emit("close"); // Cerrar el modal tras eliminar
  } catch (err) {
    errorMessage.value = "Error al eliminar el usuario.";
    snackbarStore.show("Error al eliminar el usuario.", "error");
  } finally {
    isLoading.value = false;
  }
};

const viewReports = () => {
  snackbarStore.show("Función de visualización de reportes en desarrollo.", "info");
};
</script>

<style scoped>
</style>