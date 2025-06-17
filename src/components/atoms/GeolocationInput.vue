<template>
  <div class="relative w-full mb-4">
    <input
      ref="inputRef"
      type="text"
      :placeholder="placeholder"
      :value="modelValue?.address"
      class="w-full p-3 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      :disabled="isLoading"
    />
    <p v-if="error" class="text-sm text-red-500 mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useGoogleMaps } from '../../composable/useGoogleMaps';

const props = defineProps({
  modelValue: { type: Object, default: () => ({ address: '', lat: null, lng: null }) },
  placeholder: { type: String, default: 'Buscar dirección...' },
});

const emit = defineEmits(['update:modelValue']);
const inputRef = ref(null);
const { loadGoogleMaps } = useGoogleMaps();
const isLoading = ref(false);
const error = ref('');

onMounted(async () => {
  try {
    isLoading.value = true;
    await loadGoogleMaps();
    await initAutocomplete();
  } catch (err) {
    console.error('Error al cargar Google Maps para autocompletado:', err);
    error.value = 'No se pudo cargar el autocompletado. Verifica tu conexión.';
  } finally {
    isLoading.value = false;
  }
});

async function initAutocomplete() {
  if (!window.google?.maps?.places) {
    throw new Error('Biblioteca de Places no disponible');
  }

  const options = {
    componentRestrictions: { country: 'AR' },
    types: ['geocode'],
    fields: ['formatted_address', 'geometry'],
  };

  const autocomplete = new google.maps.places.Autocomplete(inputRef.value, options);

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) {
      error.value = 'No se encontró una ubicación válida';
      return;
    }

    error.value = '';
    const location = {
      address: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    emit('update:modelValue', location);
  });
}

watch(
  () => props.modelValue?.address,
  (val) => {
    if (inputRef.value && val !== inputRef.value.value) {
      inputRef.value.value = val || '';
    }
  }
);
</script>