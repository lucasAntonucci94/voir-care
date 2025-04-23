import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSnackbarStore = defineStore('snackbar', () => {
  const message = ref('')
  const type = ref('info') // default
  const visible = ref(false)
  const timeoutId = ref(null)

  function show(msg, msgType = 'info', duration = 4000) {
    clearTimeout(timeoutId.value)
    message.value = msg
    type.value = msgType
    visible.value = true

    timeoutId.value = setTimeout(() => {
      visible.value = false
    }, duration)
  }

  function close() {
    visible.value = false
    clearTimeout(timeoutId.value)
  }

  return { message, type, visible, show, close }
})
