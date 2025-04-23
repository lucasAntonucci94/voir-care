import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNotifications } from '../composable/useNotifications'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  const unreadCount = ref(0)

  const {
    subscribeToAllUserNotifications,
    markNotificationAsRead,
    markNotificationAsUnread,
    deleteNotification,
    markAllAsViewed: markAllAsViewedFromComposable,
    markNotificationAsViewed
  } = useNotifications()

  function initNotifications(uid) {
    return subscribeToAllUserNotifications(uid, (newNotifications) => {
      notifications.value = newNotifications
      unreadCount.value = newNotifications.filter(n => !n.viewed).length
    })
  }
  
  function markAllAsViewed(uid) {
    markAllAsViewedFromComposable(uid)
    unreadCount.value = 0
  }
  
  return {
    notifications,
    unreadCount,
    initNotifications,
    markNotificationAsRead,
    markNotificationAsUnread,
    deleteNotification,
    markAllAsViewed,
    markNotificationAsViewed
  }
})
