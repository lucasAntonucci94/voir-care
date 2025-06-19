<template>
  <div class="relative">
    <!-- Botón de notificaciones -->
    <button
      @click="toggle"
      class="relative flex flex-col items-center  gap-1 text-white hover:text-primary-lighter dark:hover:text-secondary-lighter transition"
      title="Notificaciones"
      aria-haspopup="true"
      :aria-expanded="props.isOpen.toString()"
      aria-controls="notificationsDropdown"
      aria-label="Abrir menú de notificaciones"
    >
      <i class="fa-solid fa-bell text-xl" aria-hidden="true"></i>
      <p class="text-xs lg:text-sm mt-1 font-bold hidden sm:block">Notificaciones</p>
      <span
        v-if="unreadCount > 0"      
        role="status"
        aria-live="polite"
        aria-atomic="true"
        class="absolute -top-1 -right-2 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs font-bold"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <transition name="dropdown-smooth">
      <div
        v-if="props.isOpen"
        id="notificationsDropdown"
        ref="dropdownRef"
        tabindex="-1"
        role="menu"
        aria-labelledby="notification-button"
        @keydown="onDropdownKeydown"
        class="fixed sm:absolute top-0 sm:top-auto left-0 sm:left-auto sm:right-0 w-full sm:w-80 max-h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-lg sm:rounded-lg z-30 overflow-y-auto flex flex-col pt-12 sm:pt-0"
      >
        <!-- Botón cerrar en mobile -->
        <button
          @click="toggle"
          class="sm:hidden absolute top-4 right-2 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
          title="Notificaciones"
          aria-label="Cerrar menú de notificaciones"
        >
          <i class="fa-solid fa-times text-xl"></i>
        </button>

        <!-- Tabs -->
        <div class="flex justify-around border-b border-gray-200 dark:border-gray-700 text-sm font-medium">
          <button
            class="w-1/2 py-2 transition"
            :class="activeTab === 'unread' ? 'text-primary dark:text-secondary border-b-2 border-primary dark:border-secondary' : 'text-gray-500 dark:text-gray-400'"
            @click="activeTab = 'unread'"
          >
            No leídas
          </button>
          <button
            class="w-1/2 py-2 transition"
            :class="activeTab === 'read' ? 'text-primary dark:text-secondary border-b-2 border-primary dark:border-secondary' : 'text-gray-500 dark:text-gray-400'"
            @click="activeTab = 'read'"
          >
            Leídas
          </button>
        </div>

        <!-- Acciones -->
        <div class="flex justify-end px-4 py-2 border-b border-gray-100 dark:border-gray-700">
          <button
            v-if="activeTab === 'unread'"
            @click="markAllAsRead"
            aria-label="Marcar todas las notificaciones como leídas"
            :class="[
              'text-xs',
              {
                'text-gray-800 dark:text-gray-400 opacity-50 cursor-not-allowed': filteredNotifications.length === 0,
                'text-gray-600 dark:text-gray-300 hover:underline': filteredNotifications.length > 0
              }
            ]"
            :disabled="filteredNotifications.length === 0"
          >
            Marcar todas como leídas
          </button>
          <button
            v-else-if="activeTab === 'read'"
            @click="deleteAllRead"
            :class="[
              'text-xs',
              {
                'text-red-500 dark:text-red-400 opacity-50 cursor-not-allowed': filteredNotifications.length === 0,
                'text-red-600 dark:text-red-400 hover:underline': filteredNotifications.length > 0
              }
            ]"
            :disabled="filteredNotifications.length === 0"
          >
            Borrar todo
          </button>
        </div>

        <!-- Lista -->
        <ul
          v-if="filteredNotifications.length > 0"
          role="listbox"
          aria-label="Lista de notificaciones"
        >
          <li
            v-for="notification in filteredNotifications"
            :key="notification.id"
            role="option"
            tabindex="0"
            @click="handleClick(notification)"
            @keydown="onKeydown(notification, $event)"
            :class="[
              'group px-4 py-3 flex justify-between items-start gap-2 relative cursor-pointer transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <!-- Cuerpo de la notificación -->
            <div
              class="flex-1"
              :class="notification.read ? 'text-gray-400 dark:text-gray-500' : 'text-black dark:text-gray-200 font-semibold'"
            >
              {{ notification.message }}
            </div>

            <!-- Botón de acciones -->
            <div class="relative">
              <button
                @click.stop="toggleActionsMenu(notification.id, $event)"
                class="p-1 text-gray-600 dark:text-gray-300 bg-gray-300/50 dark:bg-gray-900/50 rounded-full hover:bg-gray-300/90 dark:hover:bg-gray-900/90 transition-colors"
                aria-label="Opciones de notificación"
              >
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <!-- Dropdown de acciones -->
              <Teleport to="body">
                <transition name="fade">
                  <ul
                    v-if="activeActionsMenuId === notification.id"
                    class="notification-actions fixed w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[1000] text-sm"
                    :style="dropdownPositions[notification.id] || {}"
                  >
                    <li
                      @click.stop="toggleRead(notification)"
                      class="px-4 py-2 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      {{ notification.read ? 'Marcar como no leída' : 'Marcar como leída' }}
                    </li>
                    <li
                      @click.stop="deleteNotification(notification)"
                      class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-red-500"
                    >
                      Eliminar
                    </li>
                  </ul>
                </transition>
              </Teleport>
            </div>
          </li>
        </ul>

        <div v-else class="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
          No hay notificaciones {{ activeTab === 'read' ? 'leídas' : 'no leídas' }}.
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick  } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useNotificationsStore } from '../../stores/notifications';
import { useAuth } from '../../api/auth/useAuth';
import { usePrivateChatsStore } from '../../stores/privateChats';
import { useSnackbarStore } from '../../stores/snackbar';

const props = defineProps({ isOpen: Boolean });
const emit = defineEmits(['toggle']);

const { user } = useAuth();
const notificationsStore = useNotificationsStore();
const privateChatsStore = usePrivateChatsStore();
const snackbarStore = useSnackbarStore();
const { notifications, unreadCount } = storeToRefs(notificationsStore);
const router = useRouter();

const activeTab = ref('unread');
const activeActionsMenuId = ref(null);
const dropdownRef = ref(null);
const dropdownPositions = ref({});

watch(() => props.isOpen, (val) => {
  if (val) {
    notificationsStore.markAllAsViewed(user.value.uid);
    nextTick(() => {
      const firstItem = document.querySelector('[role="listbox"] [role="option"]');
      if (firstItem) {
        firstItem.focus();
      } else {
        dropdownRef.value?.focus();
      }
    });
  }
});
function toggle() {
  emit('toggle');
}

const filteredNotifications = computed(() =>
  notifications.value.filter(n =>
    activeTab.value === 'unread' ? !n.read : n.read
  )
);

async function markAllAsRead() {
  const promises = filteredNotifications.value.map(n =>
    notificationsStore.markNotificationAsRead(n.recipientId, n.id)
  );
  try {
    await Promise.all(promises);
    snackbarStore.show('Todas las notificaciones marcadas como leídas', 'success');
  } catch (error) {
    snackbarStore.show('Error al marcar las notificaciones', 'error');
    console.error('Error marking all as read:', error);
  }
}

async function deleteAllRead() {
  const readNotifications = filteredNotifications.value;
  const promises = readNotifications.map(n =>
    notificationsStore.deleteNotification(user.value.uid, n.id)
  );
  try {
    await Promise.all(promises);
    snackbarStore.show('Todas las notificaciones leídas han sido eliminadas', 'success');
  } catch (error) {
    snackbarStore.show('Error al eliminar las notificaciones', 'error');
    console.error('Error deleting read notifications:', error);
  }
}

async function handleClick(notification) {
  await notificationsStore.markNotificationAsRead(notification.recipientId, notification.id);
  if (notification.type === 'message') {
    await privateChatsStore.markChatAsReaded(user.value.email, notification.entityId);
    privateChatsStore.setSelectedChatId(notification.entityId);
    toggle();
    router.push('/chats');
  } else if (notification.type === 'newFollower') {
    router.push(`/profile/${notification.fromUid ?? notification.extra.senderEmail}`);
  } else if (notification.type === 'groupInvitation') {
    router.push(`/group/${notification.extra.groupId ?? notification.entityId}`);
  } else if (notification.type === 'eventInvitation') {
    router.push(`/event/${notification.extra.eventId ?? notification.entityId}`);
  }
  toggle();
}

async function toggleRead(notification) {
  try {
    if (notification.read) {
      await notificationsStore.markNotificationAsUnread(notification.recipientId, notification.id);
      snackbarStore.show('Notificación marcada como no leída', 'success');
    } else {
      await notificationsStore.markNotificationAsRead(notification.recipientId, notification.id);
      snackbarStore.show('Notificación marcada como leída', 'success');
    }
  } catch (error) {
    snackbarStore.show('Error al actualizar la notificación', 'error');
    console.error('Error toggling read status:', error);
  }
}

function toggleActionsMenu(id, event) {
  if (activeActionsMenuId.value === id) {
    activeActionsMenuId.value = null;
  } else {
    activeActionsMenuId.value = null; // Close any other open menus
    const button = event.currentTarget.getBoundingClientRect();
    dropdownPositions.value = {
      [id]: {
        position: 'absolute',
        top: `${button.bottom + window.scrollY}px`,
        left: `${button.right - 160 + window.scrollX}px`
      }
    };
    activeActionsMenuId.value = id;
  }
}

async function deleteNotification(notification) {
  try {
    await notificationsStore.deleteNotification(user.value.uid, notification.id);
    snackbarStore.show('Notificación eliminada', 'success');
  } catch (error) {
    snackbarStore.show('Error al eliminar la notificación', 'error');
    console.error('Error deleting notification:', error);
  }
}

function closeMenuOnClickOutside(e) {
  if (!e.target.closest('.notification-actions') && !e.target.closest('.fa-ellipsis-v')) {
    activeActionsMenuId.value = null;
  }
}

function onKeydown(notification, event) {
  const current = event.target;

  if (event.key === 'Enter') {
    handleClick(notification);
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    const next = current.nextElementSibling;
    if (next) next.focus();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    const prev = current.previousElementSibling;
    if (prev) prev.focus();
  } else if (event.key === 'Escape') {
    toggle(); // Cierra el menú
  }
}

function onDropdownKeydown(event) {
  if (event.key === 'Escape') {
    toggle(); // cerrar dropdown con Escape si no hay items
  }
}

onMounted(() => {
  document.addEventListener('click', closeMenuOnClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenuOnClickOutside);
});
</script>

<style scoped>
.dropdown-smooth-enter-active,
.dropdown-smooth-leave-active {
  transition: all 0.25s ease;
  transform-origin: top;
}
.dropdown-smooth-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.dropdown-smooth-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>