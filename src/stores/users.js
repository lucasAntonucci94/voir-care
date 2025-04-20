// stores/users.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUsers } from '../composable/useUsers'

export const useUsersStore = defineStore('users', {
  state: () => ({
    usersCache: ref({}),
  }),
  actions: {
    async getUser(id) {
      if (this.usersCache[id]) {
        return this.usersCache[id]
      }
      const { getUser } = useUsers()
      const user = await getUser(id)
      this.usersCache[id] = user
      return user
    },
  },
})