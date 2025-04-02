import { ref, watch } from 'vue'
import {
  isSameDay, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO
} from 'date-fns'

export function useUpcomingEventFilters(eventsRef) {
  const filteredEvents = ref({
    today: [],
    tomorrow: [],
    thisWeek: [],
    thisMonth: [],
    custom: []
  })

  const filterEventsByCategory = (range = null) => {
    const now = new Date()
    const tomorrow = addDays(now, 1)
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const result = {
      today: [],
      tomorrow: [],
      thisWeek: [],
      thisMonth: [],
      custom: []
    }

    eventsRef.value.forEach(event => {
      const start = event.startTime?.toDate?.() || new Date(event.startTime)

      if (isSameDay(start, now)) result.today.push(event)
      else if (isSameDay(start, tomorrow)) result.tomorrow.push(event)
      else if (start >= weekStart && start <= weekEnd) result.thisWeek.push(event)
      else if (start >= monthStart && start <= monthEnd) result.thisMonth.push(event)

      if (range?.start && range?.end) {
        const startDate = typeof range.start === 'string' ? parseISO(range.start) : range.start
        const endDate = typeof range.end === 'string' ? parseISO(range.end) : range.end
        if (start >= startDate && start <= endDate) {
          result.custom.push(event)
        }
      }
    })

    filteredEvents.value = result
  }

  // Recalcular automáticamente si cambia el array de eventos
  watch(eventsRef, () => {
    filterEventsByCategory()
  }, { immediate: true })

  return {
    filteredEvents,
    filterEventsByCategory
  }
}
