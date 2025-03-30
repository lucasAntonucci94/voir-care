import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useGroups } from '../composable/useGroups'

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    groups: ref([]),
    isLoading: ref(true),
    isCreating: ref(false),
    unsubscribe: ref(null),
  }),
  actions: {
    // Suscribirse a los grupos en los que el usuario es miembro
    subscribeUserGroups(uid) {
        debugger
      if (this.unsubscribe) {
        console.log('Suscripción ya activa, ignorando...')
        return
      }
      console.log('Iniciando suscripción a grupos del usuario...')
      const { subscribeToUserGroups } = useGroups()
      this.unsubscribe = subscribeToUserGroups(uid, (groups) => {
        this.groups.value = groups
        this.isLoading = false
      })
    },
    // Cancelar la suscripción
    unsubscribeGroups() {
      if (this.unsubscribe.value) {
        console.log('Cancelando suscripción a grupos...')
        this.unsubscribe()
        this.unsubscribe = null
      }
    },
    // Crear un nuevo grupo
    async createGroup(groupData) {
        debugger
      const { createGroup } = useGroups()
      this.isCreating = true
      try {
        await createGroup(groupData)
      } catch (error) {
        console.error('Error al crear grupo:', error)
        throw error
      } finally {
        this.isCreating = false
      }
    },
    // Eliminar un grupo por idDoc
    async deleteGroup(idDoc) {
      const { deleteGroup } = useGroups()
      try {
        await deleteGroup(idDoc)
      } catch (error) {
        console.error('Error al eliminar grupo:', error)
        throw error
      }
    },
  },
})
