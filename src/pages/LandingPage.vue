<template>
  <section class="relative h-[80vh] text-gray-700 dark:text-white flex items-center overflow-hidden">
    <video 
      class="absolute inset-0 w-full h-full object-cover z-0" 
      :src="currentHero"
      autoplay
      loop
      muted
      playsinline></video>

    <div class="container mx-auto px-6 sm:px-8 z-20"> <div class="max-w-lg sm:max-w-xl">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold font-abril mb-4 leading-tight text-gray-100">Tu comunidad para el amor y cuidado animal</h1>
        <p class="text-md sm:text-lg font-poppins mb-6 text-gray-200">Conectá con otros amantes de los animales, aprendé sobre bienestar y colaborá para que cada mascota tenga un hogar feliz.</p>
        <div class="flex flex-col sm:flex-row gap-4">
          <router-link to="/register" class="px-6 py-3 bg-primary dark:bg-secondary-md text-white font-semibold rounded-lg hover:bg-primary-md hover:dark:bg-secondary-darker transition-transform transform hover:scale-105" aria-label="Únete a la comunidad de Voir">
            Unite ahora
          </router-link>
          <router-link to="/feed" class="px-6 py-3 bg-transparent border border-gray-700 dark:border-white text-gray-700 dark:text-white font-semibold rounded-lg hover:text-gray-500 hover:bg-gray-100/50 transition-colors dark:hover:bg-gray-700 dark:hover:text-white" aria-label="Explora las funcionalidades de Voir">
            Descubrí Voir
          </router-link>
        </div>
      </div>
    </div>
  </section>

  <!-- Que ofrecemos -->
  <section class="py-16 bg-gray-200 dark:bg-gray-800 font-poppins">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-700 dark:text-white mb-12 font-abril">Todo lo que necesitás para cuidar a tus mascotas</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        <div v-for="feature in coreFeatures" :key="feature.title" class="p-4">
          <div class="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow animate-fade-in">
            <i :class="feature.icon" class="text-4xl text-primary/70 dark:text-secondary/70 mb-4"></i>
            <h3 class="text-lg font-semibold text-gray-600 dark:text-white mb-2 font-poppins">{{ feature.title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Mision y Vision -->
  <section class="py-16 bg-gray-100/50 dark:bg-gray-900 font-poppins">
    <div class="container mx-auto max-w-290 px-4 flex flex-col md:flex-row gap-10">
      <div class="md:w-1/2 px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-[#333333] dark:text-white mb-6 font-abril">Un mundo mejor para los animales</h2>
        <p class="text-base text-[#666666] dark:text-gray-300 mb-4">En Voir, creamos una comunidad unida por el amor a los animales, donde podés educarte, colaborar y hacer una diferencia en el bienestar de las mascotas.</p>
        <p class="text-base text-[#666666] dark:text-gray-300 mb-6">Nuestra misión es fomentar la adopción responsable y el cuidado consciente, conectando a personas apasionadas por los animales en Buenos Aires y más allá.</p>
      </div>
      <div class="md:w-1/2">
        <div class="relative h-70 xs:h-90 sm:h-80 md:h-70 rounded-lg overflow-hidden">
         <video
            src="../assets/videos/VideoAnimalsLight.mp4"
            alt="Gato jugando en la comunidad de Voir"
            autoplay
            loop
            muted
            class="rounded-lg shadow-sm object-cover absolute top-0"
          ></video>
        </div>
      </div>
    </div>
  </section>

  <!-- Explorar Comunidad -->
  <section class="py-16 bg-gradient-to-b from-primary to-primary-md  dark:from-secondary dark:to-secondary-md text-white font-poppins">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-12 font-abril">Explorá nuestra comunidad</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto md:flex md:flex-wrap md:justify-center">
        <div v-for="service in coreServices" :key="service.name" class="bg-white dark:bg-gray-700 text-[#333333] dark:text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-[320px] mx-auto">
          <img :src="service.image" :alt="service.name" class="w-full h-40 object-cover rounded-lg mb-4" loading="lazy" />
          <h4 class="text-xl font-bold mb-2 font-abril">{{ service.name }}</h4>
          <p class="text-sm text-[#666666] dark:text-gray-300 mb-4">{{ service.description }}</p>
          <router-link :to="service.link" class="inline-block px-6 py-2 bg-[#F4A261] text-white font-semibold rounded-lg hover:bg-[#E76F51] transition-colors" :aria-label="`Ver más sobre ${service.name}`">Ver más</router-link>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Chats Privados -->
  <section class="py-16 bg-[#F9FAFB] dark:bg-gray-900 font-poppins">
    <div class="container mx-auto px-4 text-center">
      <img :src="chatPrivadoImage" alt="Gato Chateando" class="w-55 h-55 mx-auto mb-4" loading="lazy">
      <h2 class="text-3xl md:text-4xl font-bold text-[#333333] dark:text-white mb-6 font-abril">Comunicación privada y segura</h2>
      <p class="text-base text-[#666666] dark:text-gray-300 max-w-2xl mx-auto mb-8">Conectá con otros amantes de los animales a través de chats privados. Por ejemplo, coordiná un rescate en Villa Crespo o pedí consejos a un veterinario de confianza.</p>
      <router-link to="/chats" class="inline-block px-6 py-3 bg-[#F4A261] text-white font-semibold rounded-lg hover:bg-[#E76F51] transition-transform transform hover:scale-105" aria-label="Iniciar un chat privado en Voir">
        Empezá a chatear
      </router-link>
    </div>
  </section>

  <!-- Educación y Adopción -->
  <section class="py-16 bg-gray-100/50 dark:bg-gray-800 font-poppins">
    <div class="container flex flex-col items-center mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-12 font-abril">Aprendé y adoptá</h2>
      <video 
        class="w-full lg:h-150 xl:h-100  object-content z-0 rounded-xl shadow-sm mt-8" 
        src="../assets/videos/ConsejosAdopcion.mp4"
        autoplay
        loop
        muted
        playsinline>
      </video>
    </div>
  </section>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import ServiceImage1 from '../assets/1.png';
import ServiceImage2 from '../assets/2.png';
import ServiceImage3 from '../assets/3.png';
import { useThemeStore } from '../stores/theme';
import HeroLight from '../assets/hero/heroLadingPageLight.mp4';
import HeroDark from '../assets/hero/heroLadingPageDark.mp4';
import chatPrivadoLight from '../assets/icons/gatetoAcostadoLight.png';
import chatPrivadoDark from '../assets/icons/gatetoAcostadoDark.png';

// Initialize theme store
const themeStore = useThemeStore();

// Computed property to select hero image based on theme
const currentHero = computed(() => {
  return themeStore.isDarkMode ? HeroDark : HeroLight;
});

// Computed property to select hero image based on theme
const chatPrivadoImage = computed(() => {
  return themeStore.isDarkMode ? chatPrivadoDark : chatPrivadoLight;
});

// Core Features with Font Awesome icons
const coreFeatures = [
  { title: 'Feed Interactivo', description: 'Mirá reels y posteos de la comunidad, historias de rescate, adopción y cuidado responsable.', icon: 'fas fa-home' },
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
  { 
    name: 'Mapa Interactivo', 
    description: 'Encontrá veterinarias, refugios, estéticas y especialistas en cuidado animal cerca de ti. ¡Explora y conecta!', 
    image: ServiceImage1, 
    link: '/explorar' 
  },
  { 
    name: 'Grupos', 
    description: 'Conectá con comunidades apasionadas: adopción, rescate, razas específicas y más. ¡Tu tribu te espera!', 
    image: ServiceImage2, 
    link: '/explorar' 
  },
  { 
    name: 'Eventos', 
    description: 'Descubrí jornadas de adopción, charlas de expertos, encuentros y actividades para amantes de los animales. ¡No te lo pierdas!', 
    image: ServiceImage3, 
    link: '/explorar' 
  },
];

onMounted(() => {
  themeStore.initializeTheme();
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
  .bg-parallax {
    background-attachment: scroll; /* deshabilito paralax */
  }
  .text-4xl {
    font-size: 2.25rem;
  }
  .text-lg {
    font-size: 1rem;
  }
}
</style>