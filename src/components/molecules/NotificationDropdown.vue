<template>
  <div class="relative">
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

    <transition name="dropdown">
      <div
        v-if="isOpen"
        class="fixed sm:absolute top-0 sm:top-auto left-0 sm:left-auto sm:right-0 w-full sm:w-80 max-h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-lg sm:rounded-lg z-30 overflow-y-auto flex flex-col pt-12 sm:pt-0"
      >
        <button
          @click="toggle"
          class="sm:hidden absolute top-4 right-2 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <i class="fa-solid fa-times text-xl"></i>
        </button>

        <ul v-if="notifications.length > 0">
          <li
            v-for="notification in notifications"
            :key="notification.id"
            @click="handleClick(notification)"
            :class="[
              'px-4 py-3 cursor-pointer transition-colors',
              notification.read ? 'text-gray-400' : 'text-black font-semibold',
              'hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            {{ notification.message }}
          </li>
        </ul>

        <div v-else class="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
          Sin notificaciones
        </div>
      </div>
    </transition>
  </div>
</template>


<script setup>
import { ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '../../stores/notifications'
import { useAuth } from '../../api/auth/useAuth'
import { usePrivateChatsStore } from '../../stores/privateChats'; // Importamos el store de chats privados
import { useRouter } from 'vue-router';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['toggle'])
const router = useRouter();
const { user } = useAuth()
const { notifications, unreadCount } = storeToRefs(useNotificationsStore()) //esto es lo mismo que instanciar store y usar store.propiedad. Mantiene la reactividad de la propiedad al desestructurar.
const { markAllAsViewed, markNotificationAsRead } = useNotificationsStore()
const privateChatsStore = usePrivateChatsStore();

function toggle() {
  emit('toggle')
}

watch(() => props.isOpen, (val) => {
  if (val) {
    markAllAsViewed(user.value.uid)
  }
})

async function handleClick(notification) {
  await markNotificationAsRead(notification.recipientId, notification.id)
  if(notification.type === 'message') {
    privateChatsStore.setSelectedChatId(notification.entityId);
    emit('toggle');
    router.push('/chats'); 
  } else if (notification.type === 'friendRequest') {
    router.push({ name: 'friends' })
  } else if (notification.type === 'groupInvite') {
    router.push({ name: 'groups' })
  }

}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
