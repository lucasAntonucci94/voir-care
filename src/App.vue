<template>
  <router-view />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useAuth } from './api/auth/useAuth'
import { useNotificationsStore } from './stores/notifications'

const { user } = useAuth()
const notificationsStore = useNotificationsStore()

onMounted(() => {
  watch(
    () => user.value?.uid,
    uid => {
      if (uid) {
        notificationsStore.initNotifications(uid)
      }
    },
    { immediate: true }
  )
})
</script>