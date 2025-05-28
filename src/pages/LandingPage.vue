<template>
  <!-- Hero Section -->
  <section class="relative h-[70vh] bg-[#A8D5BA] text-white flex items-center">
    <div class="absolute inset-0 opacity-40" :style="{ backgroundImage: `url(${HeroBanner})`, backgroundSize: 'cover', backgroundPosition: 'center' }"></div>
    <div class="container mx-auto px-6 sm:px-8 z-10">
      <div class="max-w-lg sm:max-w-xl">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold font-abril mb-4 leading-tight">Tu comunidad para el amor y cuidado animal</h1>
        <p class="text-lg sm:text-xl font-poppins mb-6">Conectá con otros amantes de los animales, aprendé sobre bienestar y colaborá para que cada mascota tenga un hogar feliz.</p>
        <div class="flex flex-col sm:flex-row gap-4">
          <router-link to="/register" class="px-6 py-3 bg-[#F4A261] text-white font-semibold rounded-lg hover:bg-[#E76F51] transition-transform transform hover:scale-105" aria-label="Únete a la comunidad de Voir">
            Unite ahora
          </router-link>
          <router-link to="/explore" class="px-6 py-3 bg-transparent border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#333333] transition-colors dark:hover:bg-gray-800 dark:hover:text-white" aria-label="Explora las funcionalidades de Voir">
            Descubrí Voir
          </router-link>
        </div>
      </div>
    </div>
  </section>

  <!-- What We Offer -->
  <section class="py-16 bg-[#F5E8C7] dark:bg-gray-800 font-poppins">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl md:text-4xl font-bold text-[#333333] dark:text-white mb-12 font-abril">Todo lo que necesitás para cuidar a tus mascotas</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        <div v-for="feature in coreFeatures" :key="feature.title" class="p-4">
          <div class="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow animate-fade-in">
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
        <h2 class="text-3xl md:text-4xl font-bold text-[#333333] dark:text-white mb-6 font-abril">Un mundo mejor para los animales</h2>
        <p class="text-base text-[#666666] dark:text-gray-300 mb-4">En Voir, creamos una comunidad unida por el amor a los animales, donde podés educarte, colaborar y hacer una diferencia en el bienestar de las mascotas.</p>
        <p class="text-base text-[#666666] dark:text-gray-300 mb-6">Nuestra misión es fomentar la adopción responsable y el cuidado consciente, conectando a personas apasionadas por los animales en Buenos Aires y más allá.</p>
        <router-link to="/adoption" class="inline-block px-6 py-3 bg-[#F4A261] text-white font-semibold rounded-lg hover:bg-[#E76F51] transition-transform transform hover:scale-105" aria-label="Explora la sección de adopción">
          Explorá Adopción
        </router-link>
      </div>
      <div class="md:w-1/2">
        <img :src="BannerImage" alt="Perro y gato felices en la comunidad de Voir" class="rounded-lg shadow-md w-full h-64 object-cover" loading="lazy" />
      </div>
    </div>
  </section>

  <!-- Explore Community -->
  <section class="py-16 bg-gradient-to-b from-[#5C8D89] to-[#3A6B67] text-white font-poppins">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-12 font-abril">Explorá tu comunidad</h2>
      <div v-if="isLoadingServices" class="text-center text-gray-300">Cargando servicios...</div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto md:flex md:flex-wrap md:justify-center">
        <div v-for="service in coreServices" :key="service.name" class="bg-white dark:bg-gray-700 text-[#333333] dark:text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-[320px] mx-auto">
          <img :src="service.image" :alt="service.name" class="w-full h-40 object-cover rounded-lg mb-4" loading="lazy" />
          <h4 class="text-xl font-bold mb-2 font-abril">{{ service.name }}</h4>
          <p class="text-sm text-[#666666] dark:text-gray-300 mb-4">{{ service.description }}</p>
          <router-link :to="service.link" class="inline-block px-6 py-2 bg-[#F4A261] text-white font-semibold rounded-lg hover:bg-[#E76F51] transition-colors" :aria-label="`Ver más sobre ${service.name}`">Ver más</router-link>
        </div>
      </div>
    </div>
  </section>

  <!-- Private Chats -->
  <section class="py-16 bg-[#F9FAFB] dark:bg-gray-900 font-poppins">
    <div class="container mx-auto px-4 text-center">
      <i class="fas fa-comments text-4xl text-[#5C8D89] dark:text-[#A8D5BA] mb-4"></i>
      <h2 class="text-3xl md:text-4xl font-bold text-[#333333] dark:text-white mb-6 font-abril">Comunicación privada y segura</h2>
      <p class="text-base text-[#666666] dark:text-gray-300 max-w-2xl mx-auto mb-8">Conectá con otros amantes de los animales a través de chats privados. Por ejemplo, coordiná un rescate en Villa Crespo o pedí consejos a un veterinario de confianza.</p>
      <router-link to="/chats" class="inline-block px-6 py-3 bg-[#F4A261] text-white font-semibold rounded-lg hover:bg-[#E76F51] transition-transform transform hover:scale-105" aria-label="Iniciar un chat privado en Voir">
        Empezá a chatear
      </router-link>
    </div>
  </section>

  <!-- Events and Groups -->
  <section class="py-16 bg-[#F5E8C7] dark:bg-gray-800 font-poppins">
    <div class="container mx-auto px-4 text-center">
      <CarouselAwareness title="Eventos y Grupos" :events="awarenessEvents" :auto-scroll="true" />
      <p class="text-base text-[#666666] dark:text-gray-300 max-w-2xl mx-auto mt-8">Participá en jornadas de adopción o unite a grupos como “Amantes de los Gatos” para compartir experiencias.</p>
    </div>
  </section>

  <!-- Education and Adoption -->
  <section class="py-16 bg-[#F9FAFB] dark:bg-gray-900 font-poppins">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl md:text-4xl font-bold text-[#333333] dark:text-white mb-12 font-abril">Aprendé y adoptá con amor</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div class="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <i class="fas fa-book text-4xl text-[#5C8D89] dark:text-[#A8D5BA] mb-4"></i>
          <h3 class="text-xl font-bold text-[#333333] dark:text-white mb-2 font-abril">Educación</h3>
          <p class="text-sm text-[#666666] dark:text-gray-300 mb-4">Accedé a blogs y recursos para aprender sobre cuidado animal, desde nutrición hasta adiestramiento.</p>
          <router-link to="/education" class="inline-block px-6 py-2 bg-[#F4A261] text-white font-semibold rounded-lg hover:bg-[#E76F51] transition-colors" aria-label="Explora la sección de educación">
            Explorá Educación
          </router-link>
        </div>
        <div class="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <i class="fas fa-heart text-4xl text-[#5C8D89] dark:text-[#A8D5BA] mb-4"></i>
          <h3 class="text-xl font-bold text-[#333333] dark:text-white mb-2 font-abril">Adopción</h3>
          <p class="text-sm text-[#666666] dark:text-gray-300 mb-4">Encontrá mascotas que necesitan un hogar y conectá con refugios o adoptantes en tu zona.</p>
          <router-link to="/adoption" class="inline-block px-6 py-2 bg-[#F4A261] text-white font-semibold rounded-lg hover:bg-[#E76F51] transition-colors" aria-label="Explora la sección de adopción">
            Explorá Adopción
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CarouselAwareness from '../components/organisms/CarrouselAwareness.vue';
import HeroBanner from '../assets/hero/hero1.png'; // Reemplazar con una imagen de un perro y gato juntos
import BannerImage from '../assets/1.png';
import ServiceImage1 from '../assets/1.png';
import ServiceImage2 from '../assets/2.png';
import ServiceImage3 from '../assets/3.png';

// Core Features with Font Awesome icons
const coreFeatures = [
  { title: 'Feed Interactivo', description: 'Mirá reels y posteos de la comunidad, como una historia de rescate en Palermo.', icon: 'fas fa-home' },
  { title: 'Grupos', description: 'Unite a grupos como “Adoptantes en Buenos Aires” para colaborar.', icon: 'fas fa-users' },
  { title: 'Eventos', description: 'Participá en jornadas de adopción o caminatas cerca de tu casa.', icon: 'fas fa-calendar-alt' },
  { title: 'Mapa Interactivo', description: 'Encontrá veterinarias o paseadores cerca de tu casa.', icon: 'fas fa-map-marked-alt' },
  { title: 'Chats Privados', description: 'Hablá en privado para coordinar ayuda o pedir consejos.', icon: 'fas fa-comments' },
  { title: 'Perfil Personal', description: 'Mostrá tus mascotas y compartí tus experiencias.', icon: 'fas fa-user' },
  { title: 'Educación', description: 'Aprendé con blogs sobre cuidado y bienestar animal.', icon: 'fas fa-book' },
  { title: 'Adopción', description: 'Encontrá un nuevo amigo peludo para tu familia.', icon: 'fas fa-heart' },
];

// Core Services with local images
const coreServices = [
  { name: 'Mapa Interactivo', description: 'Encontrá paseadores o refugios en tu zona con un clic.', image: ServiceImage1, link: '/map' },
  { name: 'Veterinarias', description: 'Conectá con clínicas confiables para tus mascotas.', image: ServiceImage2, link: '/map' },
  { name: 'Servicios', description: 'Guarderías, paseadores y más para tus animales.', image: ServiceImage3, link: '/map' },
];

// Events and Groups
const awarenessEvents = ref([
  { title: 'Jornada de Adopción en Plaza Italia', date: '5 de junio, 2025', image: ServiceImage1 },
  { title: 'Caminata Solidaria en el Rosedal', date: '12 de junio, 2025', image: ServiceImage2 },
  { title: 'Grupo: Amantes de los Gatos', date: 'Unite hoy', image: ServiceImage3 },
  { title: 'Grupo: Rescate Animal en Buenos Aires', date: 'Unite hoy', image: ServiceImage3 },
  { title: 'Grupo: Rescate Animal en Buenos Aires', date: 'Unite hoy', image: ServiceImage3 },
  { title: 'Grupo: Rescate Animal en Buenos Aires', date: 'Unite hoy', image: ServiceImage3 },
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
@media (max-width: 640px) {

  .text-4xl {
    font-size: 2.25rem;
  }
  .text-lg {
    font-size: 1rem;
  }
}
</style>