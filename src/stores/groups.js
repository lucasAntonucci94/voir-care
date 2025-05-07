import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useGroups } from '../composable/useGroups'

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    userGroups: ref([]),
    allGroups: ref([]),
    isLoading: ref(true),
    isCreating: ref(false),
    unsubscribeUserGroups : ref(null),
    unsubscribeAll: ref(null),
    unsubscribePosts: ref(null),
    userGroupFeed: ref([]),
    unsubscribePostsUserFeed: ref([]),
  }),
  actions: {
    // Suscribirse a los grupos en los que el usuario es miembro
    subscribeUserGroups(uid) {
      console.log('Iniciando suscripción a grupos del usuario...')
      const { subscribeToUserGroups } = useGroups()

      if (this.unsubscribeUserGroups) {
        console.log('Suscripción a grupo de usuario ya activa, ignorando...')
        return
      }

      this.unsubscribeUserGroups = subscribeToUserGroups(uid, (groups) => {
        this.userGroups.value = groups
        this.isLoading = false
      })
    },
    // Cancelar la suscripción
    unsubscribeFromUserGroups() {
      if (this.unsubscribeUserGroups) {
        console.log('Cancelando suscripción a grupos de usuario...')
        this.unsubscribeUserGroups()
        this.unsubscribeUserGroups  = null
      }
    },
    // Suscribirse a todos los grupos
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
    async suscribePostsByGroupId(groupId, callback) {
      const { suscribePostsByGroupId } = useGroups()
      
      if(this.unsubscribePosts) {
        this.unsuscribePostsByGroupId()
      }

      this.unsubscribePosts = suscribePostsByGroupId(groupId, callback)
    },
    // Cancelar la suscripción
    unsuscribePostsByGroupId() {
      if (this.unsubscribePosts) {
        console.log('Cancelando suscripción a todos los grupos...')
        this.unsubscribePosts()
        this.unsubscribePosts = null
      }
    },
    subscribeUserGroupFeed(uid) {
      const { subscribeToUserGroups, suscribePostsByGroupId } = useGroups()
    
      // Evitar doble suscripción
      if (this.unsubscribeUserGroups || this.unsubscribePostsUserFeed?.length) {
        console.log('[Feed] Ya está suscrito, cancelando...')
        this.unsubscribeUserGroupFeed()
      }
    
      console.log('[Feed] Suscribiendo a los grupos del usuario...')
      this.unsubscribeUserGroups = subscribeToUserGroups(uid, (groups) => {
        if (!Array.isArray(groups)) {
          console.warn('[Feed] No se pudo obtener la lista de grupos del usuario')
          this.userGroupFeed.value = []
          return
        }
    
        this.userGroups.value = groups
        const groupIds = groups.map(g => g.idDoc)
    
        if (groupIds.length === 0) {
          console.log('[Feed] El usuario no tiene grupos, cancelando feed')
          this.userGroupFeed.value = []
          return
        }
    
        // Array para almacenar las funciones de desuscripción de los posteos
        this.unsubscribePostsUserFeed = []
        this.userGroups?.value?.forEach(group => {
          const unsubscribe = suscribePostsByGroupId(group.idDoc, (posts) => {
            const postsWithGroupDetail = posts.map(post => ({
              ...post,
              group:{
                id:group.idDoc,
                title:group.title,
                media:group.media,
              }
            }))
    
            const uniquePosts = [
              ...this.userGroupFeed?.value?.filter(
                p => p.group.id !== group.idDoc // Mantener posteos de otros grupos
              ),
              ...postsWithGroupDetail, // Agregar los nuevos posteos
            ]
    
            // Actualizar el feed, ordenando por fecha
            this.userGroupFeed.value = uniquePosts.sort(
              (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
            )
          })
    
          // Guardar la función de desuscripción
          this.unsubscribePostsUserFeed.push(unsubscribe)
        })
      })
    },
    unsubscribeUserGroupFeed() {
      if (this.unsubscribePostsUserFeed?.length) {
        console.log('[Feed] Cancelando suscripciones a posteos...')
        this.unsubscribePostsUserFeed.forEach(unsubscribe => unsubscribe())
        this.unsubscribePostsUserFeed = []
      }
    
      if (this.unsubscribeUserGroups) {
        console.log('[Feed] Cancelando suscripción a grupos del usuario...')
        this.unsubscribeUserGroups()
        this.unsubscribeUserGroups = null
      }
    
      this.userGroupFeed.value = []
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
      const { leaveGroup } = useGroups()
      try {
          return await leaveGroup(groupId, userId)
      } catch (error) {
          console.error(`Error al unirse al grupo con id: ${ idDoc }`, error)
          throw error
      }
    },
    // Crear un nuevo post en un grupo seleccionado por idDoc
    async createPostGroup(idGroup,postData) {
      const { createPostGroup } = useGroups()
      this.isCreating = true
      try {
        await createPostGroup(idGroup,postData)
      } catch (error) {
        console.error('Error al crear el post {iD}, ', error)
        throw error
      } finally {
        this.isCreating = false
      }
    },
  },
})
