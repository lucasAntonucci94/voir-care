<template>
  <div class="relative">
    <!-- Botón de notificaciones -->
    <button
      @click="toggle"
      class="relative flex flex-col items-center text-white hover:text-primary-lighter dark:hover:text-secondary-lighter transition"
      title="Notificaciones"
    >
      <i class="fa-solid fa-bell text-xl"></i>
      <p class="text-xs mt-1 hidden sm:block">Notificaciones</p>
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-2 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs font-bold"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <transition name="dropdown-smooth">
      <div
        v-if="props.isOpen"
        class="fixed sm:absolute top-0 sm:top-auto left-0 sm:left-auto sm:right-0 w-full sm:w-80 max-h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-lg sm:rounded-lg z-30 overflow-y-auto flex flex-col pt-12 sm:pt-0"
      >
        <!-- Botón cerrar en mobile -->
        <button
          @click="toggle"
          class="sm:hidden absolute top-4 right-2 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
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
            @click="markAllAsRead"
            class="text-xs text-gray-600 dark:text-gray-300 hover:underline"
          >
            Marcar todas como leídas
          </button>
        </div>

        <!-- Lista -->
        <ul v-if="filteredNotifications.length > 0">
          <li
            v-for="notification in filteredNotifications"
            :key="notification.id"
            class="group px-4 py-3 flex justify-between items-start gap-2 relative cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <!-- Cuerpo de la notificación -->
            <div
              @click="handleClick(notification)"
              class="flex-1"
              :class="notification.read ? 'text-gray-400 dark:text-gray-500' : 'text-black dark:text-gray-200 font-semibold'"
            >
              {{ notification.message }}
            </div>

            <!-- Botón de acciones -->
            <div class="relative">
              <button
                class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                @click.stop="toggleActionsMenu(notification.id, $event)"
              >
                <i class="fa-solid fa-ellipsis-vertical"></i>
              </button>

              <!-- Dropdown de acciones -->
              <Teleport to="body">
                <transition name="fade">
                  <ul
                    v-if="activeActionsMenuId === notification.id"
                    :style="getDropdownPosition($event, notification.id)"
                    class="notification-actions fixed w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[1000] text-sm"
                  >
                    <li @click.stop="toggleRead(notification)" class="px-4 py-2 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                      {{ notification.read ? 'Marcar como no leída' : 'Marcar como leída' }}
                    </li>
                    <li @click.stop="deleteNotification(notification)" class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-red-500">
                      Eliminar
                    </li>
                    <li @click.stop="reportNotification(notification)" class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-yellow-500">
                      Reportar
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
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '../../stores/notifications'
import { useAuth } from '../../api/auth/useAuth'
import { usePrivateChatsStore } from '../../stores/privateChats'
import { useSnackbarStore } from '../../stores/snackbar'

const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['toggle'])

const { user } = useAuth()
const notificationsStore = useNotificationsStore()
const privateChatsStore = usePrivateChatsStore()
const snackbarStore = useSnackbarStore()
const { notifications, unreadCount } = storeToRefs(notificationsStore)
const router = useRouter()

const activeTab = ref('unread')
const activeActionsMenuId = ref(null)
const dropdownPositions = ref({})
watch(() => props.isOpen, (val) => {
  if (val) notificationsStore.markAllAsViewed(user.value.uid)
})

function toggle() {
  emit('toggle')
}

const filteredNotifications = computed(() =>
  notifications.value.filter(n =>
    activeTab.value === 'unread' ? !n.read : n.read
  )
)

async function markAllAsRead() {
  const promises = filteredNotifications.value.map(n =>
    notificationsStore.markNotificationAsRead(n.recipientId, n.id)
  )
  await Promise.all(promises)
}

async function handleClick(notification) {
  await notificationsStore.markNotificationAsRead(notification.recipientId, notification.id)
  if (notification.type === 'message') {
    await privateChatsStore.markChatAsReaded(user.value.email, notification.entityId)
    privateChatsStore.setSelectedChatId(notification.entityId)
    toggle()
    router.push('/chats')
  } else if (notification.type === 'friendRequest') {
    router.push({ name: 'friends' })
  } else if (notification.type === 'groupInvite') {
    router.push({ name: 'groups' })
  }
}

async function toggleRead(notification) {
  if (notification.read) {
    await notificationsStore.markNotificationAsUnread(notification.recipientId, notification.id)
    snackbarStore.show('Notificación actualizada', 'success')
  } else {
    await notificationsStore.markNotificationAsRead(notification.recipientId, notification.id)
    snackbarStore.show('Notificación actualizada', 'success')
  }
}

function getDropdownPosition(event, id) {
  const position = dropdownPositions.value[id]
  return position ? {
    position: 'absolute',
    top: `${position.top}px`,
    left: `${position.left}px`
  } : {}
}

function toggleActionsMenu(id, event) {
  const button = event.currentTarget.getBoundingClientRect()
  dropdownPositions.value[id] = {
    top: button.bottom + window.scrollY,
    left: button.right - 160 + window.scrollX // ajustá 160 a tu ancho de menú
  }
  activeActionsMenuId.value = activeActionsMenuId.value === id ? null : id
}

async function deleteNotification(notification) {
  try {
    await notificationsStore.deleteNotification(user.value.uid, notification.id)
    snackbarStore.show('Notificación eliminada', 'success')
  } catch (error) {
    snackbarStore.show('Error al eliminar la notificación', 'error')
  }
}

function reportNotification(notification) {
  console.log('Reportar notificación:', notification)
  // Implementar luego
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.notification-item')) {
    activeActionsMenuId.value = null
  }
})

onMounted(() => {
  document.addEventListener('click', closeMenuOnClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenuOnClickOutside)
})

function closeMenuOnClickOutside(e) {
  if (!e.target.closest('.notification-actions')) {
    activeActionsMenuId.value = null
  }
}
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
