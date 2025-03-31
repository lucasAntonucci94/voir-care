import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useEvents } from '../composable/useEvents'

export const useEventsStore = defineStore('events', {
    state: () => ({
        events:ref([]),
        allEvents:ref([]),
        upcomingEvents:ref([]),
        isLoading: ref(true),
        isCreating: ref(false),
        unsubscribeAll: ref(null),
        unsubscribeUser: ref(null),
        unsubscribeUpcoming: ref(null),
    }),
    actions: {
    // Suscribirse a los eventos en los que el usuario es miembro
    subscribeUserEvents(uid) {
        debugger
        if (this.unsubscribeUser) {
            console.log('Suscripción ya activa, ignorando...')
            return
        }
        console.log('Iniciando suscripción a eventos del usuario...')
        const { subscribeToUserEvents } = useEvents()
        this.unsubscribeUser = subscribeToUserEvents(uid, (events) => {
            this.events.value = events
            debugger
            this.isLoading = false
        })
    },
    // Cancelar la suscripción
    unsubscribeUserEvents() {
        if (this.unsubscribeUser) {
        console.log('Cancelando suscripción a eventos...')
        this.unsubscribeUser()
        this.unsubscribeUser = null
        }
    },
    // Suscribirse a los eventos en los que el usuario es miembro
    subscribeAllEvents() {
        debugger
        if (this.unsubscribeAll) {
            console.log('Suscripción ya activa, ignorando...')
            return
        }
        console.log('Iniciando suscripción a todos los eventos...')
        const { subscribeToEvents } = useEvents()
        this.unsubscribeAll = subscribeToEvents((events) => {
            this.allEvents.value = events
            debugger
            this.isLoading = false
        })
    },
    // Cancelar la suscripción
    unsubscribeAllEvents() {
        if (this.unsubscribeAll) {
        console.log('Cancelando suscripción a todos los eventos...')
        this.unsubscribeAll()
        this.unsubscribeAll = null
        }
    },
    // Suscripción a eventos próximos
    subscribeUpcomingEvents() {
        debugger
    if (this.unsubscribeUpcoming) {
        console.log('Suscripción ya activa (próximos), ignorando...')
        return
    }
    console.log('Suscribiendo a eventos próximos...')
    const { subscribeToUpcomingEvents } = useEvents()
    this.unsubscribeUpcoming = subscribeToUpcomingEvents((events) => {
        this.upcomingEvents.value = events
        debugger
        this.isLoading = false
    })
    },
    // Cancelar suscripción de eventos próximos
    unsubscribeUpcomingEvents() {
    if (this.unsubscribeUpcoming) {
        console.log('Cancelando suscripción a eventos próximos...')
        this.unsubscribeUpcoming()
        this.unsubscribeUpcoming = null
    }
    },
    // Crear un nuevo evento
    async createEvent(eventData) {
        debugger
        const { createEvent } = useEvents()
        this.isCreating = true
        try {
        await createEvent(eventData)
        } catch (error) {
        console.error('Error al crear evento:', error)
        throw error
        } finally {
        this.isCreating = false
        }
    },
    // Eliminar un evento por idDoc
    async deleteEvent(idDoc) {
        const { deleteEvent } = useEvents()
        try {
        await deleteEvent(idDoc)
        } catch (error) {
        console.error('Error al eliminar evento:', error)
        throw error
        }
    },
},
    // getters: {
    //     getEvents() {
    //         return this.events
    //     },
    //     isLoadingEvents() {
    //         return this.isLoading
    //     },
    //     isCreatingEvent() {
    //         return this.isCreating
    //     },
    // },
    // persist: {
        // enabled: true,
        // strategies: [
        //   {
        //     key: 'events',
        //     storage: localStorage,
        //   },
        // ],
    //   },
})