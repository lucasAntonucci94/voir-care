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
        <h1 class="dosis-font text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 leading-tight text-white">Tu comunidad para el amor y cuidado animal</h1>
        <p class="josefin-font text-md sm:text-lg mb-6 text-gray-100">Conectá con otros amantes de los animales, aprendé sobre bienestar y colaborá para que cada mascota tenga un hogar feliz.</p>
        <div class="flex flex-col sm:flex-row gap-4">
          <router-link to="/register" class="dosis-font px-6 py-3 bg-primary dark:bg-secondary-md text-white font-semibold rounded-lg hover:bg-primary-md hover:dark:bg-secondary-darker transition-transform transform hover:scale-105" aria-label="Únete a la comunidad de Voir">
            Unite ahora
          </router-link>
          <router-link :to="{ path: '/', hash: '#que-ofrecemos' }" class="dosis-font text-bold px-6 py-3 bg-transparent border border-2 border-white text-white font-semibold rounded-lg hover:bg-gray-300/20 transition-colors dark:hover:bg-gray-800/10" aria-label="Explora las funcionalidades de Voir">
            Descubrí Voir
          </router-link>
        </div>
      </div>
    </div>
  </section>

  <!-- Que ofrecemos -->
  <section id="que-ofrecemos" class="py-16 bg-gray-200 dark:bg-gray-800 josefin-font">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-700 dark:text-white mb-12 dosis-font">Todo lo que necesitás para cuidar a tus mascotas</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        <div v-for="feature in coreFeatures" :key="feature.title" class="p-4">
          <div class="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow animate-fade-in">
            <i :class="feature.icon" class="text-4xl text-primary/70 dark:text-secondary/70 mb-4"></i>
            <h3 class="text-lg font-semibold text-gray-600 dark:text-white mb-2 dosis-font">{{ feature.title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Mision y Vision -->
  <section class="py-16 bg-gray-100/50 dark:bg-gray-900 josefin-font">
    <div class="container mx-auto max-w-290 px-4 flex flex-col md:flex-row gap-10">
      <div class="md:w-1/2 px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-[#333333] dark:text-white mb-6 dosis-font">Un mundo mejor para los animales</h2>
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
  <section class="py-16 bg-gradient-to-b from-primary to-primary-md  dark:from-secondary dark:to-secondary-md text-white josefin-font">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-12 dosis-font">Explorá nuestra comunidad</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto md:flex md:flex-wrap md:justify-center">
        <div v-for="service in coreServices" :key="service.name" class="bg-white dark:bg-gray-700 text-[#333333] dark:text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-[320px] mx-auto">
          <img :src="service.image" :alt="service.name" class="w-full h-40 object-cover rounded-lg mb-4" loading="lazy" />
          <h4 class="text-xl font-bold mb-2 dosis-font">{{ service.name }}</h4>
          <p class="text-sm text-[#666666] dark:text-gray-300 mb-6">{{ service.description }}</p>
          <!-- <router-link :to="service.link" class="dosis-font px-6 py-3 bg-primary dark:bg-secondary-md text-white font-semibold rounded-lg hover:bg-primary-md hover:dark:bg-secondary-darker transition-colors" :aria-label="`Ver más sobre ${service.name}`">Ver más</router-link> -->
        </div>
      </div>
    </div>
  </section>
  
  <!-- Chats Privados -->
  <section class="py-16 bg-[#F9FAFB] dark:bg-gray-900 josefin-font">
    <div class="container mx-auto px-4 text-center">
      <img :src="chatPrivadoImage" alt="Gato Chateando" class="w-55 h-55 mx-auto mb-4" loading="lazy">
      <h2 class="text-3xl md:text-4xl font-bold text-[#333333] dark:text-white mb-6 dosis-font">Comunicación privada y segura</h2>
      <p class="text-base text-[#666666] dark:text-gray-300 max-w-2xl mx-auto mb-8">Conectá con otros amantes de los animales a través de chats privados. Por ejemplo, coordiná un rescate por tu zona o pedí consejos a un veterinario de confianza.</p>
      <router-link to="/chats" class="inline-block dosis-font px-8 py-4 bg-primary dark:bg-secondary-md text-white font-semibold rounded-lg hover:bg-primary-md hover:dark:bg-secondary-darker transition-transform transform hover:scale-105" aria-label="Iniciar un chat privado en Voir">
        Empezá a chatear
      </router-link>
    </div>
  </section>

  <!-- Educación y Adopción -->
  <section class="py-16 bg-gray-100/50 dark:bg-gray-800 josefin-font">
    <div class="container flex flex-col items-center mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-12 dosis-font">Aprendé y adoptá</h2>
      <p class="text-base text-gray-600 dark:text-gray-300 max-w-2xl text-center">Conocé más consejos de adopción responsable y cuidado animal.</p>
      <p class="text-base text-gray-600 dark:text-gray-300 max-w-2xl text-center">Aprendé sobre razas, salud y bienestar para que tu mascota sea feliz y saludable.</p>

      <div class="relative w-full lg:w-auto mt-8">
        <video
          ref="videoPlayer"
          class="w-full lg:h-[450px] xl:h-[450px] xl:max-w-[1040px] object-cover z-0 rounded-xl shadow-sm"
          src="../assets/videos/ConsejosAdopcion.mp4"
          autoplay
          muted
          playsinline
          @timeupdate="updateProgressBar"
          @loadedmetadata="setVideoDuration"
          @ended="resetProgressBar"
          @error="handleVideoError"
        ></video>

        <div class="absolute bottom-4 left-0 w-full px-4">
          <div class="h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary dark:bg-secondary transition-all duration-300 ease-linear"
              :style="{ width: progressBarWidth }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Ultimo Section de cierre y llamado a la accion -->
  <section class="py-16 bg-gray-200/50 dark:bg-gray-900 josefin-font">
    <div class="container flex flex-col items-center mx-auto px-4">
      <!-- Título principal -->
      <h2 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6 dosis-font">Unite a la Comunidad Voir</h2>
      <!-- Subtítulo -->
      <h3 class="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-8 text-center">Hacé una diferencia, encontrá tu tribu, crezcamos juntos</h3>
      <!-- Descripción motivadora -->
      <p class="text-base text-gray-600 dark:text-gray-300 max-w-2xl text-center mb-8">
        ¿Sos un amante de los animales? En <span class="font-bold">Voir</span>, tu pasión encuentra un hogar. Unite a miles de personas en Buenos Aires y más allá que comparten tu amor por las mascotas. Juntos, podemos construir un mundo donde cada animal tenga un hogar feliz y saludable.
      </p>
      <!-- Lista de beneficios -->
      <ul class="text-base text-gray-600 dark:text-gray-300 max-w-2xl mb-10 space-y-4 text-center">
        <li><span class="font-semibold">Conectá:</span> Formá parte de una comunidad vibrante donde compartís experiencias, consejos y momentos especiales con tus mascotas.</li>
        <li><span class="font-semibold">Colaborá:</span> Sumate a iniciativas de adopción, rescate y cuidado responsable que transforman vidas.</li>
        <li><span class="font-semibold">Creá impacto:</span> Tu participación ayuda a fomentar el bienestar animal y a construir una red de apoyo para cada peludo.</li>
      </ul>
      <!-- Call to Action -->
      <router-link to="/register" class="dosis-font px-8 py-4 bg-primary dark:bg-secondary-md text-white font-semibold rounded-lg hover:bg-primary-md hover:dark:bg-secondary-darker transition-transform transform hover:scale-105" aria-label="Unite a la comunidad Voir">
        ¡Unite a Voir ahora!
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
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

// Referencia al elemento de video de adopcion (al final del landing page)
const videoPlayer = ref(null);
// Variables reactivas para el progreso
const currentTime = ref(0);
const videoDuration = ref(0);

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

// Método para obtener la duración total del video
const setVideoDuration = (event) => {
  if (videoPlayer.value) {
    videoDuration.value = videoPlayer.value.duration;
    console.log('Video duration set:', videoDuration.value);
  } else {
    console.warn('Video player reference is null');
  }
};

// Método para actualizar el tiempo actual del video
const updateProgressBar = (event) => {
  if (videoPlayer.value) {
    currentTime.value = videoPlayer.value.currentTime;
    console.log('Current time:', currentTime.value, 'Duration:', videoDuration.value);
  } else {
    console.warn('Video player reference is null');
  }
};

// Método para manejar el reinicio del video en bucle
const resetProgressBar = () => {
  if (videoPlayer.value) {
    videoPlayer.value.currentTime = 0;
    currentTime.value = 0;
    videoPlayer.value.play();
  }
};

// Método para manejar errores de carga del video
const handleVideoError = (event) => {
  console.error('Error loading video:', event);
};

// Propiedad computada para calcular el ancho de la barra de progreso
const progressBarWidth = computed(() => {
  if (videoDuration.value > 0) {
    debugger
    const percentage = (currentTime.value / videoDuration.value) * 100;
    return `${Math.min(percentage, 100)}%`;
  }
  return '0%';
});

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

.progress-bar {
  transition: width 0.1s linear;
}
</style>