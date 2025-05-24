<template>
  <div v-if="isOpen" class="fixed inset-0 z-101 flex items-center justify-center bg-black/50">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-200">{{ title || 'Invita a tus amigos' }}</h2>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre o email..."
          class="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
        />
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"></i>
      </div>
      <div v-if="filteredConnections.length" class="mt-2 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600">
        <div
          v-for="connection in filteredConnections"
          :key="connection.email"
          class="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
          @click="inviteConnection(connection)"
        >
          <img
            :src="connection.avatar || AvantarDefault"
            alt="User avatar"
            class="w-10 h-10 rounded-full mr-3 object-cover"
          />
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-gray-200">{{ connection.displayName || 'Sin nombre' }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ connection.email }}</p>
          </div>
        </div>
      </div>
      <div v-else-if="searchQuery" class="mt-2 text-center text-gray-500 dark:text-gray-400 text-sm">
        No se encontraron usuarios.
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button
          @click="closeModal"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAuth } from '../../api/auth/useAuth';
import { useNotifications } from '../../composable/useNotifications';
import AvantarDefault from '../../assets/avatar1.jpg';
import { useSnackbarStore } from '../../stores/snackbar';

const { user } = useAuth();
const { sendNotification } = useNotifications();
const snackbarStore = useSnackbarStore();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Invita a tus amigos',
    required: false,
  },
  module: {
    type: String,
    default: 'group',
    validator: value => ['group', 'event'].includes(value),
  },
  entity: {
    type: Object,
    required: true,
    validator: entity => entity.id && entity.title,
  },
});

const emit = defineEmits(['close']);

const isOpen = ref(false);
const searchQuery = ref('');

watch(() => props.visible, (newVal) => {
  isOpen.value = newVal;
});

// Compute filtered connections based on search query
const filteredConnections = computed(() => {
  if (!user.value?.connections) return [];

  const query = searchQuery.value.toLowerCase();
  if (!query) return user.value.connections;

  return user.value.connections.filter(connection =>
    connection.email.toLowerCase().includes(query) ||
    connection.displayName?.toLowerCase().includes(query)
  );
});

const closeModal = () => {
  searchQuery.value = '';
  emit('close');
  isOpen.value = false;
};

// Handle connection selection and send invitation notification
const inviteConnection = async (connection) => {
  if (!user.value || !connection.uid) return;
  try {
    await sendNotification({
      toUid: connection.uid,
      fromUid: user.value.uid,
      type: `${props.module === 'group' ? 'groupInvitation' : 'eventInvitation'}`,
      message: `${user.value.displayName} te invitó al ${props.module === 'group' ? 'grupo' : 'evento'} ${props.entity.title}.`,
      entityId: props.entity.id,
      entityType: props.module,
      extra: {
        [props.module === 'group' ? 'groupId' : 'eventId']: props.entity.id,
        [props.module === 'group' ? 'groupTitle' : 'eventTitle']: props.entity.title,
      },
    });
    closeModal();
    snackbarStore.show(`Invitación enviada a ${connection.displayName || connection.email}`,'success');
  } catch (error) {
    console.error('Error al enviar la invitación:', error);
  }
};
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>