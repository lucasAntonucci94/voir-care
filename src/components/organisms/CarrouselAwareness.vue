<template>
  <section class="bg-gradient-to-r from-[#A8D5BA] to-[#F5E8C7] py-16 overflow-hidden">
    <div class="container mx-auto px-4 w-[90vw]">
      <h2 class="text-4xl md:text-5xl font-bold text-[#333333] text-center mb-12 font-abril">{{ title }}</h2>
      <div class="relative">
        <!-- Contenedor del carrusel -->
        <div
          ref="scrollContainer"
          class="flex overflow-x-auto space-x-6 scrollbar-hide snap-x snap-mandatory"
          style="scroll-behavior: smooth;"
          @mouseenter="pauseAutoScroll"
          @mouseleave="resumeAutoScroll"
        >
          <div
            v-for="(event, index) in events"
            :key="event.title"
            class="awareness-card bg-white p-6 rounded-xl text-center min-w-[250px] md:min-w-[300px] lg:min-w-[350px] flex-shrink-0 snap-center shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300"
          >
            <!-- Imagen o fondo con ícono por defecto -->
            <div
              class="awareness-image h-48 mb-4 rounded-lg relative"
              :style="event.image ? { backgroundImage: `url(${event.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: '#A8D5BA' }"
            >
              <!-- Ícono por defecto si no hay imagen -->
              <div v-if="!event.image" class="absolute inset-0 flex items-center justify-center">
                <img src="https://img.icons8.com/ios-filled/50/FFFFFF/paw.png" alt="Paw Icon" class="w-16 h-16 opacity-50" />
              </div>
              <!-- Etiqueta para diferenciar eventos y grupos -->
              <span
                class="absolute top-2 left-2 bg-[#F4A261] text-white text-xs font-semibold px-2 py-1 rounded-full"
              >
                {{ event.date.includes('Únete') ? 'Grupo' : 'Evento' }}
              </span>
            </div>
            <h3 class="text-xl font-semibold text-[#333333] mb-2 font-poppins">{{ event.title }}</h3>
            <p class="text-sm text-[#666666] mb-4 font-poppins">{{ event.date }}</p>
            <a
              href="#"
              class="inline-block px-6 py-2 bg-[#F4A261] text-white font-semibold rounded-lg hover:bg-[#E76F51] transition-transform transform hover:scale-105 font-poppins"
              :aria-label="event.date.includes('Únete') ? `Unirse al grupo ${event.title}` : `Inscribirse al evento ${event.title}`"
            >
              {{ event.date.includes('Únete') ? 'Unirme al grupo' : 'Inscribirme al evento' }}
            </a>
          </div>
        </div>

        <!-- Flechas de navegación -->
        <button
          class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-[#F4A261] hover:bg-[#E76F51] rounded-full w-12 h-12 flex items-center justify-center shadow-md z-10 transition-transform transform hover:scale-110"
          @click="scroll(-1)"
          aria-label="Desplazar carrusel a la izquierda"
        >
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <button
          class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[#F4A261] hover:bg-[#E76F51] rounded-full w-12 h-12 flex items-center justify-center shadow-md z-10 transition-transform transform hover:scale-110"
          @click="scroll(1)"
          aria-label="Desplazar carrusel a la derecha"
        >
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>

        <!-- Indicadores de progreso (dots) -->
        <div class="flex justify-center mt-6 space-x-2">
          <button
            v-for="(event, index) in events"
            :key="index"
            class="w-3 h-3 rounded-full"
            :class="currentIndex === index ? 'bg-[#F4A261]' : 'bg-gray-300'"
            @click="scrollToIndex(index)"
            :aria-label="`Ir al elemento ${index + 1} del carrusel`"
          ></button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'Concienciación Activa',
  },
  events: {
    type: Array,
    default: () => [
      { title: 'Taller de adiestramiento positivo', date: '15 de abril, 2025', image: 'https://images.unsplash.com/photo-1601758064955-6c2a8942e9b1?q=80&w=2070&auto=format&fit=crop' },
      { title: 'Jornada de adopción responsable', date: '22 de abril, 2025', image: 'https://images.unsplash.com/photo-1601758176119-1b4c4924a4a2?q=80&w=2070&auto=format&fit=crop' },
      { title: 'Charla: Cómo cuidar a tu gato en casa', date: '20 de abril, 2025', image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=2070&auto=format&fit=crop' },
      { title: 'Evento de socialización para perros', date: '6 de mayo, 2025', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop' },
      { title: 'Taller de primeros auxilios para mascotas', date: '10 de mayo, 2025', image: 'https://images.unsplash.com/photo-1583468982228-19f19164aee2?q=80&w=2073&auto=format&fit=crop' },
      { title: 'Grupo: Amantes de los gatos', date: 'Únete hoy', image: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?q=80&w=2064&auto=format&fit=crop' },
      { title: 'Grupo: Adopción y rescate', date: 'Únete hoy', image: 'https://images.unsplash.com/photo-1601758066440-2a9d0e3a77f5?q=80&w=2070&auto=format&fit=crop' },
    ],
  },
  autoScroll: {
    type: Boolean,
    default: true,
  },
});

// Referencia al contenedor del carrusel
const scrollContainer = ref(null);
let scrollInterval = null;
const currentIndex = ref(0);
let isPaused = ref(false);

// Función para desplazar el carrusel
const scroll = (direction) => {
  if (scrollContainer.value) {
    const scrollAmount = 300; // Ajusta según el ancho de las tarjetas
    scrollContainer.value.scrollLeft += direction * scrollAmount;

    // Actualiza el índice actual
    const newIndex = Math.round(scrollContainer.value.scrollLeft / scrollAmount);
    currentIndex.value = Math.max(0, Math.min(newIndex, props.events.length - 1));
  }
};

// Desplazar a un índice específico (para los dots)
const scrollToIndex = (index) => {
  if (scrollContainer.value) {
    const scrollAmount = 300; // Ajusta según el ancho de las tarjetas
    scrollContainer.value.scrollLeft = index * scrollAmount;
    currentIndex.value = index;
  }
};

// Pausar el auto-scroll
const pauseAutoScroll = () => {
  if (props.autoScroll) {
    isPaused.value = true;
    clearInterval(scrollInterval);
  }
};

// Reanudar el auto-scroll
const resumeAutoScroll = () => {
  if (props.autoScroll && isPaused.value) {
    isPaused.value = false;
    scrollInterval = setInterval(() => scroll(1), 5000);
  }
};

// Configuración del carrusel
onMounted(() => {
  if (scrollContainer.value) {
    // Soporte para rueda del ratón
    scrollContainer.value.addEventListener('wheel', (evt) => {
      evt.preventDefault();
      const scrollAmount = evt.deltaY * 0.5;
      scrollContainer.value.scrollLeft += scrollAmount;

      // Actualiza el índice actual
      const newIndex = Math.round(scrollContainer.value.scrollLeft / 300);
      currentIndex.value = Math.max(0, Math.min(newIndex, props.events.length - 1));
    });

    // Desplazamiento automático
    if (props.autoScroll) {
      scrollInterval = setInterval(() => {
        if (!isPaused.value) {
          scroll(1);
        }
      }, 5000);
    }

    // Actualizar el índice al desplazar manualmente
    scrollContainer.value.addEventListener('scroll', () => {
      const newIndex = Math.round(scrollContainer.value.scrollLeft / 300);
      currentIndex.value = Math.max(0, Math.min(newIndex, props.events.length - 1));
    });
  }
});

// Limpieza al desmontar
onUnmounted(() => {
  if (scrollInterval) clearInterval(scrollInterval);
});
</script>

<style scoped>
/* Ocultar scrollbar pero mantener funcionalidad */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none; /* IE y Edge */
  scrollbar-width: none; /* Firefox */
}

/* Estilos para las tarjetas */
.awareness-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Estilos para el contenedor del carrusel */
.awareness-card img {
  transition: transform 0.3s ease;
}

/* Estilos para las flechas */
button svg {
  transition: transform 0.3s ease;
}

/* Estilos para los indicadores (dots) */
button.w-3.h-3 {
  transition: background-color 0.3s ease;
}
</style>