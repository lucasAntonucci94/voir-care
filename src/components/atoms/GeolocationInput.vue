<template>
    <div class="relative w-full">
      <input
        ref="inputRef"
        type="text"
        :placeholder="placeholder"
        class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      />
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref, watch } from 'vue'
  import { useGoogleMaps } from '../../composable/useGoogleMaps'

  const props = defineProps({
    modelValue: { type: Object, default: () => ({ address: '', lat: null, lng: null }) },
    placeholder: { type: String, default: 'Buscar dirección...' }
  })
  
  const emit = defineEmits(['update:modelValue'])
  const inputRef = ref(null)
  const { loadGoogleMaps } = useGoogleMaps()
  let autocomplete = null
  
  onMounted(async () =>  {
    await loadGoogleMaps({ libraries: ['places'] })

    // Esperar a que Google Maps esté disponible
    if (window.google?.maps?.places) {
      await initAutocomplete()
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(interval)
          initAutocomplete()
        }
      }, 300)
    }
  })
  
  async function initAutocomplete() {
    const options = {
        componentRestrictions: { country: 'AR' },
        types: ['geocode'],
        fields: ['formatted_address', 'geometry']
    }
    autocomplete = new google.maps.places.Autocomplete(inputRef.value, options)
  
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.geometry) return
  
      const location = {
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }
      emit('update:modelValue', location)
    })
  }
  
  watch(
    () => props.modelValue?.address,
    (val) => {
      if (inputRef.value && val !== inputRef.value.value) {
        inputRef.value.value = val
      }
    }
  )
  </script>