import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useEvents } from '../composable/useEvents'

export const useEventsStore = defineStore('events', {
    state: () => ({
        events:ref([]),
        allEvents:ref([]),
        upcomingEvents:ref([]),
        adoptionEvents: ref([]),
        isLoading: ref(true),
        isCreating: ref(false),
        unsubscribeAll: ref(null),
        unsubscribeUser: ref(null),
        unsubscribeUpcoming: ref(null),
        unsubscribeAdoption: ref(null),
    }),
    actions: {
    // Suscribirse a los eventos en los que el usuario es miembro
    subscribeUserEvents(uid) {
        if (this.unsubscribeUser) {
            console.log('Suscripción ya activa, ignorando...')
            return
        }
        console.log('Iniciando suscripción a eventos del usuario...')
        const { subscribeToUserEvents } = useEvents()
        this.unsubscribeUser = subscribeToUserEvents(uid, (events) => {
            this.events.value = events
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
        if (this.unsubscribeAll) {
            console.log('Suscripción ya activa, ignorando...')
            return
        }
        console.log('Iniciando suscripción a todos los eventos...')
        const { subscribeToEvents } = useEvents()
        this.unsubscribeAll = subscribeToEvents((events) => {
            this.allEvents.value = events
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
        if (this.unsubscribeUpcoming) {
            console.log('Suscripción ya activa (próximos), ignorando...')
            return
        }
        console.log('Suscribiendo a eventos próximos...')
        const { subscribeToUpcomingEvents } = useEvents()
        this.unsubscribeUpcoming = subscribeToUpcomingEvents((events) => {
            this.upcomingEvents.value = events
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
    // Crear un nuevo evento
    async editEvent(idDoc, eventData) {
        const { updateEvent } = useEvents()
        this.isCreating = true
        try {
            await updateEvent(idDoc, eventData)
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
            debugger
            this.events.value = this.events?.value?.filter(event => event.idDoc !== idDoc);

        } catch (error) {
            console.error('Error al eliminar evento:', error)
            throw error
        }
    },
    // Busca evento por idDoc
    async findEventById(idDoc) {
        const { findById } = useEvents()
        try {
            return await findById(idDoc)
        } catch (error) {
            console.error('Error al eliminar evento:', error)
            throw error
        }
    },
    // Busca evento por idDoc
    async setUserAttendanceStatus(idDoc, userId, status) {
        const { setUserAttendanceStatus } = useEvents()
        try {
            return await setUserAttendanceStatus(idDoc, userId, status)
        } catch (error) {
            console.error('Error al eliminar evento:', error)
            throw error
        }
    },
     // Suscripción a eventos de adopción
    subscribeToAdoptionEvents() {
        if (this.unsubscribeAdoption) {
            console.log('Suscripción ya activa (adopción), ignorando...')
            return
        }
        console.log('Iniciando suscripción a eventos de adopción...')
        const { subscribeToAdoptionEvents } = useEvents()
        this.unsubscribeAdoption = subscribeToAdoptionEvents((events) => {
            this.adoptionEvents.value = events
            this.isLoading = false
        })
    },
    // Cancelar suscripción de eventos de adopción
    unsubscribeAdoptionEvents() {
        if (this.unsubscribeAdoption) {
            console.log('Cancelando suscripción a eventos de adopción...')
            this.unsubscribeAdoption()
            this.unsubscribeAdoption = null
        }
    }},
})