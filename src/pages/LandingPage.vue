<template>
  <!-- Hero Section -->
  <section class="relative h-[60vh] bg-[#A8D5BA] text-white flex items-center">
    <div class="absolute inset-0 opacity-30" :style="{ backgroundImage: `url(${HeroBanner})`, backgroundSize: 'cover', backgroundPosition: 'center' }"></div>
    <div class="container mx-auto px-6 sm:px-8 z-10">
      <div class="max-w-md sm:max-w-lg">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold font-abril mb-4 leading-tight">Un hogar para los amantes de los animales</h1>
        <p class="text-base sm:text-lg font-poppins mb-6">Conecta, aprende y colabora en una comunidad dedicada al bienestar de tus mascotas.</p>
        <div class="flex flex-col sm:flex-row gap-4">
          <router-link to="/register" class="px-6 py-3 bg-[#F4A261] text-white font-semibold rounded-lg hover:bg-[#E76F51] transition-transform transform hover:scale-105" aria-label="Únete a la comunidad de Voir">
            Únete ahora
          </router-link>
          <router-link to="/explore" class="px-6 py-3 bg-transparent border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#333333] transition-colors dark:hover:bg-gray-800 dark:hover:text-white" aria-label="Explora las funcionalidades de Voir">
            Explora Voir
          </router-link>
        </div>
      </div>
    </div>
  </section>

  <!-- What We Offer -->
  <section class="py-16 bg-[#F5E8C7] dark:bg-gray-800 font-poppins">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl md:text-4xl font-bold text-[#333333] dark:text-white mb-12 font-abril">Descubre lo que Voir tiene para ti</h2>
      <div class="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
        <div v-for="feature in coreFeatures" :key="feature.title" class="w-full sm:w-1/2 lg:w-1/3 p-4">
          <div class="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <i :class="feature.icon" class="text-4xl text-[#5C8D89] dark:text-[#A8D5BA] mb-4"></i>
            <h3 class="text-lg font-semibold text-[#333333] dark:text-white mb-2 font-poppins">{{ feature.title }}</h3>
            <p class="text-sm text-[#666666] dark:text-gray-300">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Mission and Vision -->
  <section class="py-16 bg-[#F9FAFB] dark:bg-gray-900 font-poppins">
    <div class="container mx-auto px-4 flex flex-col md:flex-row gap-10">
      <div class="md:w-1/2">
        <h2 class="text-3xl md:text-4xl font-bold text-[#333333] dark:text-white mb-6 font-abril">Por un mundo mejor para las mascotas</h2>
        <p class="text-base text-[#666666] dark:text-gray-300 mb-4">En Voir, unimos a personas apasionadas por el bienestar animal para educar, colaborar y transformar vidas.</p>
        <p class="text-base text-[#666666] dark:text-gray-300">Nuestra misión es crear una comunidad que promueva el cuidado responsable y la adopción, mientras ofrecemos herramientas para conectar y aprender.</p>
      </div>
      <div class="md:w-1/2">
        <img :src="BannerImage" alt="Mascota feliz en la comunidad de Voir" class="rounded-lg shadow-md w-full h-64 object-cover" loading="lazy" />
      </div>
    </div>
  </section>

  <!-- Services (Explore) -->
  <section class="py-16 bg-gradient-to-b from-[#5C8D89] to-[#3A6B67] text-white font-poppins">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-12 font-abril">Explora servicios para tus mascotas</h2>
      <div v-if="isLoadingServices" class="text-center text-gray-300">Cargando servicios...</div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto md:flex md:flex-wrap md:justify-center">
        <div v-for="service in coreServices" :key="service.name" class="bg-white dark:bg-gray-700 text-[#333333] dark:text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-[320px] mx-auto">
          <img :src="service.image" :alt="service.name" class="w-full h-40 object-cover rounded-lg mb-4" loading="lazy" />
          <h4 class="text-xl font-bold mb-2 font-abril">{{ service.name }}</h4>
          <p class="text-sm text-[#666666] dark:text-gray-300 mb-4">{{ service.description }}</p>
          <a href="#" class="inline-block px-6 py-2 bg-[#F4A261] text-white font-semibold rounded-lg hover:bg-[#E76F51] transition-colors" :aria-label="`Ver más sobre ${service.name}`">Ver más</a>
        </div>
      </div>
      <div class="text-center mt-12">
        <router-link to="/map" class="inline-block px-8 py-3 bg-[#F4A261] text-white font-semibold rounded-lg hover:bg-[#E76F51] transition-transform transform hover:scale-105" aria-label="Descubre el mapa interactivo de Voir">
          Descubre el mapa interactivo
        </router-link>
      </div>
    </div>
  </section>

  <!-- Private Chats -->
  <section class="py-16 bg-[#F9FAFB] dark:bg-gray-900 font-poppins">
    <div class="container mx-auto px-4 text-center">
      <i class="fas fa-comments text-4xl text-[#5C8D89] dark:text-[#A8D5BA] mb-4"></i>
      <h2 class="text-3xl md:text-4xl font-bold text-[#333333] dark:text-white mb-6 font-abril">Conversa con confianza</h2>
      <p class="text-base text-[#666666] dark:text-gray-300 max-w-2xl mx-auto mb-8">Chatea de forma privada y segura con otros amantes de los animales, veterinarios o paseadores para compartir consejos y coordinar ayuda.</p>
      <a href="#" class="inline-block px-6 py-3 bg-[#F4A261] text-white font-semibold rounded-lg hover:bg-[#E76F51] transition-transform transform hover:scale-105" aria-label="Iniciar un chat privado en Voir">
        Empieza a chatear
      </a>
    </div>
  </section>

  <!-- Events and Groups -->
  <CarouselAwareness title="Eventos y Grupos" :events="awarenessEvents" :auto-scroll="true" />

</template>

<script setup>
import { ref, onMounted } from 'vue';
import CarouselAwareness from '../components/organisms/CarrouselAwareness.vue';
import HeroBanner from '../assets/hero/hero1.png';
import BannerImage from '../assets/1.png';
import ServiceImage1 from '../assets/1.png';
import ServiceImage2 from '../assets/2.png';
import ServiceImage3 from '../assets/3.png';

// Core Features with Font Awesome icons
const coreFeatures = [
  { title: 'Comunidad', description: 'Conecta con amantes de los animales y comparte experiencias.', icon: 'fas fa-paw' },
  { title: 'Chats Seguros', description: 'Habla en privado con otros cuidadores y profesionales.', icon: 'fas fa-comments' },
  { title: 'Mapa Interactivo', description: 'Encuentra veterinarias, parques y servicios cerca de ti.', icon: 'fas fa-map-marked-alt' },
  { title: 'Eventos', description: 'Participa en talleres y jornadas de adopción.', icon: 'fas fa-calendar-alt' },
  { title: 'Grupos', description: 'Únete a grupos para aprender y colaborar.', icon: 'fas fa-users' },
  { title: 'Educación', description: 'Accede a guías y recursos para el cuidado animal.', icon: 'fas fa-book' },
];

// Core Services with local images
const coreServices = [
  { name: 'Mapa Interactivo', description: 'Encuentra parques, veterinarias y más cerca de ti.', image: ServiceImage1 },
  { name: 'Veterinarias', description: 'Conecta con clínicas confiables para tus mascotas.', image: ServiceImage2 },
  { name: 'Servicios', description: 'Paseadores, guarderías y más para tus animales.', image: ServiceImage3 },
];

// Events and Groups
const awarenessEvents = ref([
{ title: 'Taller de adiestramiento', date: '15 de abril, 2025', image: ServiceImage1 },
      { title: 'Jornada de adopción', date: '22 de abril, 2025', image: ServiceImage2 },
      { title: 'Grupo: Amantes de gatos', date: 'Únete hoy', image: ServiceImage3 },
      { title: 'Grupo: Rescate animal', date: 'Únete hoy', image: ServiceImage3 },
      { title: 'Grupo: Rescate animal', date: 'Únete hoy', image: ServiceImage3 },
      { title: 'Grupo: Rescate animal', date: 'Únete hoy', image: ServiceImage3 },
      { title: 'Grupo: Rescate animal', date: 'Únete hoy', image: ServiceImage3 },
      { title: 'Grupo: Rescate animal', date: 'Únete hoy', image: ServiceImage3 },
      { title: 'Grupo: Rescate animal', date: 'Únete hoy', image: ServiceImage3 },
      { title: 'Grupo: Rescate animal', date: 'Únete hoy', image: ServiceImage3 },
]);

// Loading state for services
const isLoadingServices = ref(false);

onMounted(() => {
  isLoadingServices.value = true;
  setTimeout(() => {
    isLoadingServices.value = false;
  }, 1000); // Simulate network delay
});
</script>

<style scoped>
/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

/* Fonts */
.font-poppins {
  font-family: 'Poppins', sans-serif;
  line-height: 1.6;
}

.font-abril {
  font-family: 'Abril Fatface', cursive;
  font-weight: 800;
  letter-spacing: 1px;
}

/* Scrollbar Hide */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Snap Scroll for Services */
.snap-x {
  scroll-snap-type: x mandatory;
}
.snap-center {
  scroll-snap-align: center;
}

/* Responsive Adjustments */
/* @media (max-width: 640px) {
  .min-w-[200px] {
    min-width: 180px;
  }
} */
</style>