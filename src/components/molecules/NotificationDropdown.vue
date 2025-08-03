<template>
  <div class="relative">
    <!-- Botón de notificaciones -->
    <button
      @click="toggle"
      class="relative flex flex-col items-center gap-1 text-white hover:text-primary-lighter dark:hover:text-secondary-lighter transition"
      title="Notificaciones"
      aria-haspopup="true"
      :aria-expanded="props.isOpen.toString()"
      aria-controls="notificationsDropdown"
      aria-label="Abrir menú de notificaciones"
      id="notification-button"
    >
      <i class="fa-solid fa-bell text-xl" aria-hidden="true"></i>
      <span class="text-xs lg:text-sm mt-1 font-bold hidden sm:block">Notificaciones</span>
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
    <transition name="dropdown">
      <div
        v-if="props.isOpen"
        id="notificationsDropdown"
        ref="dropdownRef"
        tabindex="-1"
        role="menu"
        aria-labelledby="notification-button"
        @keydown="onDropdownKeydown"
        class="fixed sm:absolute top-0 sm:top-auto left-0 sm:left-auto sm:right-0 w-full sm:w-80 max-h-[calc(100vh-4rem)] md:max-h-[calc(90vh-4rem)] bg-white dark:bg-gray-800 shadow-lg sm:rounded-lg z-30 overflow-y-auto flex flex-col pt-12 sm:pt-0"
      >
        <!-- Botón cerrar en mobile -->
        <button
          @click="toggle"
          class="sm:hidden absolute top-4 right-2 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
          title="Cerrar notificaciones"
          aria-label="Cerrar menú de notificaciones"
        >
          <i class="fa-solid fa-times text-xl" aria-hidden="true"></i>
        </button>

        <!-- Tabs -->
        <div role="tablist" class="flex justify-around border-b border-gray-200 dark:border-gray-700 text-sm font-medium">
          <button
            role="tab"
            :id="activeTab === 'unread' ? 'tab-unread' : 'tab-read'"
            :aria-selected="activeTab === 'unread' ? 'true' : 'false'"
            :aria-controls="activeTab === 'unread' ? 'panel-unread' : 'panel-read'"
            tabindex="0"
            class="w-1/2 py-2 transition"
            :class="activeTab === 'unread' ? 'text-primary dark:text-secondary border-b-2 border-primary dark:border-secondary' : 'text-gray-500 dark:text-gray-400'"
            @click="activeTab = 'unread'"
          >
            No leídas
          </button>
          <button
            role="tab"
            :id="activeTab === 'read' ? 'tab-read' : 'tab-unread'"
            :aria-selected="activeTab === 'read' ? 'true' : 'false'"
            :aria-controls="activeTab === 'read' ? 'panel-read' : 'panel-unread'"
            tabindex="-1"
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
            aria-label="Borrar todas las notificaciones leídas"
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

        <!-- Contenedor de paneles para las pestañas -->
        <div :id="activeTab === 'unread' ? 'panel-unread' : 'panel-read'" role="tabpanel" :aria-labelledby="activeTab === 'unread' ? 'tab-unread' : 'tab-read'" class="flex-grow">
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
                :id="`notification-${notification.id}`"
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
                    :aria-label="`Opciones para la notificación: ${notification.message.substring(0, 30)}...`"
                    :aria-expanded="activeActionsMenuId === notification.id ? 'true' : 'false'"
                    :aria-controls="`actions-menu-${notification.id}`"
                    :id="`actions-button-${notification.id}`"
                  >
                    <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                  </button>
                  <!-- Dropdown de acciones -->
                  <Teleport to="body">
                    <transition name="fade">
                      <ul
                        v-if="activeActionsMenuId === notification.id"
                        :id="`actions-menu-${notification.id}`"
                        role="menu"
                        :aria-labelledby="`actions-button-${notification.id}`"
                        tabindex="-1"
                        class="notification-actions fixed w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[1000] text-sm"
                        :style="dropdownPositions[notification.id] || {}"
                      >
                        <li
                          role="menuitem"
                          tabindex="0"
                          @click.stop="toggleRead(notification)"
                          class="px-4 py-2 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        >
                          {{ notification.read ? 'Marcar como no leída' : 'Marcar como leída' }}
                        </li>
                        <li
                          role="menuitem"
                          tabindex="0"
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
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
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
      // Enfocar el primer elemento de la lista de notificaciones si existe,
      // de lo contrario, enfocar el contenedor del dropdown.
      const firstItem = dropdownRef.value?.querySelector('[role="listbox"] [role="option"]');
      if (firstItem) {
        firstItem.focus();
      } else {
        dropdownRef.value?.focus();
      }
    });
  } else {
    // Cuando el dropdown se cierra, asegúrate de cerrar también cualquier menú de acciones
    activeActionsMenuId.value = null;
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
  // Solo marcar como leída si no lo está
  if (!notification.read) {
    await notificationsStore.markNotificationAsRead(notification.recipientId, notification.id);
  }
  
  // Navegar según el tipo de notificación
  if (notification.type === 'message') {
    await privateChatsStore.markChatAsReaded(user.value.email, notification.entityId);
    privateChatsStore.setSelectedChatId(notification.entityId);
    router.push('/chats');
  } else if (notification.type === 'newFollower') {
    router.push(`/profile/${notification.fromUid ?? notification.extra.senderEmail}`);
  } else if (notification.type === 'groupInvitation') {
    router.push(`/group/${notification.extra.groupId ?? notification.entityId}`);
  } else if (notification.type === 'eventInvitation') {
    router.push(`/event/${notification.extra.eventId ?? notification.entityId}`);
  } else if (notification.entityType === 'post' &&(notification.type === 'comment' || notification.type === 'like')) {
    router.push(`/post/${notification.entityId}`);
  }
  toggle(); // Cerrar el dropdown después de la acción
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
    activeActionsMenuId.value = null; // Cerrar el menú de acciones después de la acción
  } catch (error) {
    snackbarStore.show('Error al actualizar la notificación', 'error');
    console.error('Error toggling read status:', error);
  }
}

function toggleActionsMenu(id, event) {
  // Si ya está abierto y se hace clic en el mismo botón, cerrarlo
  if (activeActionsMenuId.value === id) {
    activeActionsMenuId.value = null;
  } else {
    // Cerrar cualquier otro menú de acciones abierto
    activeActionsMenuId.value = null; 
    nextTick(() => { // Esperar al DOM para obtener las posiciones correctas
        const button = event.currentTarget.getBoundingClientRect();
        dropdownPositions.value = {
            [id]: {
                position: 'fixed', // Usar 'fixed' para Teleport a 'body'
                top: `${button.bottom}px`,
                left: `${button.right - 160}px` // Ajustar para que el menú se alinee a la derecha del botón
            }
        };
        activeActionsMenuId.value = id;
        // Enfocar el primer elemento del menú de acciones para accesibilidad
        nextTick(() => {
            const firstMenuItem = document.querySelector(`#actions-menu-${id} [role="menuitem"]`);
            if (firstMenuItem) {
                firstMenuItem.focus();
            }
        });
    });
  }
}

async function deleteNotification(notification) {
  try {
    await notificationsStore.deleteNotification(user.value.uid, notification.id);
    snackbarStore.show('Notificación eliminada', 'success');
    activeActionsMenuId.value = null; // Cerrar el menú de acciones después de la acción
  } catch (error) {
    snackbarStore.show('Error al eliminar la notificación', 'error');
    console.error('Error deleting notification:', error);
  }
}

function closeMenuOnClickOutside(e) {
  // Asegurarse de que el clic no fue en el botón del menú de acciones ni en el propio menú
  if (activeActionsMenuId.value && 
      !e.target.closest('.notification-actions') && 
      !e.target.closest(`button[id="actions-button-${activeActionsMenuId.value}"]`)) {
    activeActionsMenuId.value = null;
  }
}

function onKeydown(notification, event) {
  const current = event.target;
  const isActionsMenuOpen = activeActionsMenuId.value === notification.id;
  const menuItems = isActionsMenuOpen ? Array.from(document.querySelectorAll(`#actions-menu-${notification.id} [role="menuitem"]`)) : [];
  let currentIndex = menuItems.indexOf(document.activeElement);

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (isActionsMenuOpen) {
        const nextIndex = (currentIndex + 1) % menuItems.length;
        menuItems[nextIndex].focus();
      } else {
        const next = current.nextElementSibling;
        if (next) next.focus();
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (isActionsMenuOpen) {
        const prevIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
        menuItems[prevIndex].focus();
      } else {
        const prev = current.previousElementSibling;
        if (prev) prev.focus();
      }
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      // Si el menú de acciones está abierto, ejecutar la acción del item enfocado
      if (isActionsMenuOpen && currentIndex !== -1) {
          menuItems[currentIndex].click(); // Simular clic en el item del menú
      } else {
          handleClick(notification); // Ejecutar la acción principal de la notificación
      }
      break;
    case 'Escape':
      event.preventDefault(); // Prevenir que el escape cierre todo el modal si solo se quiere cerrar el submenú
      if (isActionsMenuOpen) {
        activeActionsMenuId.value = null; // Cerrar el menú de acciones
        document.getElementById(`actions-button-${notification.id}`).focus(); // Volver el foco al botón de acciones
      } else {
        toggle(); // Cerrar el dropdown principal
      }
      break;
  }
}

function onDropdownKeydown(event) {
  if (event.key === 'Escape' && activeActionsMenuId.value === null) {
    // Solo cerrar el dropdown principal si ningún submenú de acciones está abierto
    toggle();
  }
  // Implementar navegación con flechas para las pestañas si aplica
  // Implementar navegación con flechas para los items de notificación si no hay submenú abierto
}

onMounted(() => {
  document.addEventListener('click', closeMenuOnClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenuOnClickOutside);
});
</script>

<style scoped>
/* Animación del desplegable */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

/* Mobile: Deslizamiento desde arriba */
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* Desktop: Desvanecimiento y deslizamiento desde el botón */
@media (min-width: 640px) {
  .dropdown-enter-from,
  .dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* Barra de desplazamiento suave para overflow */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

/* Efectos de hover y focus para botones */
/* NOTA: Estas reglas pueden ser redundantes si ya usas clases de Tailwind como hover:scale-105 */
/* button:hover,
a:hover {
  transform: translateY(-1px);
} */

button:focus,
a:focus {
  outline: none;
}

/* Estilos para el menú de acciones (mantener consistencia con el diseño) */
.notification-actions {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.notification-actions::-webkit-scrollbar {
  width: 6px;
}

.notification-actions::-webkit-scrollbar-track {
  background: transparent;
}

.notification-actions::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
</style>