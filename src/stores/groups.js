import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useGroups } from '../composable/useGroups'

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    userGroups: ref([]),
    allGroups: ref([]),
    isLoading: ref(true),
    isCreating: ref(false),
    unsubscribe: ref(null),
    unsubscribeAll: ref(null),
  }),
  actions: {
    // Suscribirse a los grupos en los que el usuario es miembro
    subscribeUserGroups(uid) {
      if (this.unsubscribe) {
        console.log('Suscripción a grupo de usuario ya activa, ignorando...')
        return
      }
      console.log('Iniciando suscripción a grupos del usuario...')
      const { subscribeToUserGroups } = useGroups()
      this.unsubscribe = subscribeToUserGroups(uid, (groups) => {
        this.userGroups.value = groups
        this.isLoading = false
      })
    },
    // Cancelar la suscripción
    unsubscribeUserGroups() {
      if (this.unsubscribe) {
        console.log('Cancelando suscripción a grupos de usuario...')
        this.unsubscribe()
        this.unsubscribe = null
      }
    },
    // Suscribirse a los grupos en los que el usuario es miembro
    subscribeAllGroups() {
      if (this.unsubscribeAll) {
        console.log('Suscripción a todos los grupos ya activa, ignorando...')
        return
      }
      console.log('Iniciando suscripción a todos los grupos...')
      const { subscribeToGroups } = useGroups()
      this.unsubscribeAll = subscribeToGroups((groups) => {
        this.allGroups.value = groups
        this.isLoading = false
      })
    },
    // Cancelar la suscripción
    unsubscribeAllGroups() {
      if (this.unsubscribeAll) {
        console.log('Cancelando suscripción a todos los grupos...')
        this.unsubscribeAll()
        this.unsubscribeAll = null
      }
    },
    // Crear un nuevo grupo
    async createGroup(groupData) {
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
    // Crear un nuevo evento
    async editGroup(idDoc, groupData) {
        const { updateGroup } = useGroups()
        this.isCreating = true
        try {
            await updateGroup(idDoc, groupData)
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
    // Busca evento por idDoc
    async findGroupById(idDoc) {
      const { findById } = useGroups()
      try {
          return await findById(idDoc)
      } catch (error) {
          console.error(`Error al buscar grupo con id: ${ idDoc }`, error)
          throw error
      }
    },
    // Me uno al grupo seleecionado por idDoc y userId
    async joinGroup(groupId, userId) {
      debugger
      const { joinGroup } = useGroups()
      try {
          return await joinGroup(groupId, userId)
      } catch (error) {
          console.error(`Error al unirse al grupo con id: ${ idDoc }`, error)
          throw error
      }
    },
    // salgo del grupo seleecionado por idDoc y userId
    async leaveGroup(groupId, userId) {
      debugger
      const { leaveGroup } = useGroups()
      try {
          return await leaveGroup(groupId, userId)
      } catch (error) {
          console.error(`Error al unirse al grupo con id: ${ idDoc }`, error)
          throw error
      }
    },
  },
})
