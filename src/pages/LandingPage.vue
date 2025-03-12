
<template>
  <section
  class="relative h-[75vh] xs:h-[60vh] sm:h-[65vh] bg-gradient-to-tr from-black via-primary to-primary text-white pt-15 md:pt-25"
  :style="{ clipPath: 'polygon(0 0, 100% 0%, 100% 100%, 0 90%)' }"
>
  <div class="container mx-auto px-4 font-poppins">
    <div class="flex flex-col items-start gap-5 px-5 md:px-10 lg:px-40 xl:px-50">
      <p class="text-1xl font-bold text-blue-100">Explora la conexion total</p>
      <!-- <img src="../assets/icons/logoVoir.png" alt="Logo de Voir" class="w-40" /> -->
      <h1 class="text-2xl md:text-3xl lg:text-5xl font-bold mb-0">Une Comunidad, Servicios y Educación en un Solo Lugar</h1>
      <p class="text-lg mb-0">Descubre cómo esta plataforma transforma la interacción entre amantes de los animales, ofreciendo un espacio único para conectar, compartir y aprender.</p>
      <router-link to="register" class="inline-block px-12 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
        Unete ahora
      </router-link>
    </div>
  </div>
</section>
  <!-- Características Destacadas -->
  <section class="bg-white pt-34 py-30 -mt-14 font-poppins">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-4xl font-bold text-gray-800 mb-10 ">Características Destacadas</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-2xl mx-auto ">
        <div v-for="(feature, index) in features" :key="index" class="feature-item flex items-center p-2.5 bg-gray-100 rounded text-gray-600 text-base">
          <img src="../assets/icons/logoVoir.png" alt="Feature Logo" class="w-10 h-10 mr-3 rounded" />
          <!-- <img :src="`https://firebasestorage.googleapis.com/v0/b/parcialcwantonucci.appspot.com/o/profile%2Flucas.e.antonucci%40gmail.com.jpg?alt=media&token=a8d69477-990e-4e3d-bba3-8a19a83fccd4?text=Logo${index + 1}`" alt="Feature Logo" class="w-10 h-10 mr-3 rounded" /> -->
           <p>
             {{ feature }}
           </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Misión y Visión -->
  <section class="bg-gray-100 py-16 font-abril">
    <div class="container mx-auto px-4 font-poppins">
      <h2 class="text-4xl font-bold text-gray-800 text-center mb-10">Nuestra Misión y Visión</h2>
      <div class="flex flex-col md:flex-row gap-10">
        <div class="mission flex-1 p-5 bg-gray-100 rounded-lg">
          <h3 class="text-2xl text-gray-800 mb-4">Misión</h3>
          <p class="text-gray-600 text-base">Promover el bienestar animal y conectar a las personas con servicios y recursos esenciales para brindar un mejor cuidado a sus mascotas.</p>
        </div>
        <div class="vision flex-1 p-5 bg-gray-100 rounded-lg">
          <h3 class="text-2xl text-gray-800 mb-4">Visión</h3>
          <p class="text-gray-600 text-base">Ser la principal plataforma global donde los amantes de los animales encuentren apoyo, educación y una comunidad vibrante para mejorar la vida de sus mascotas.</p>
        </div>
      </div>
    </div>
  </section>
<!-- Servicios Geolocalizados -->
<section class="bg-gradient-to-tr from-primary via-primary to-black py-16 relative md:h-[50vh] font-poppins">
    <div class="container mx-auto px-4">
      <h2 class="text-4xl font-bold text-white text-center mb-10 md:mb-0">Servicios Geolocalizados</h2>
      <div class="flex flex-col md:flex-row justify-center gap-4 md:gap-10 md:-translate-y-2/3 lg:-translate-y-2/3">
        <div v-for="service in services" :key="service.name" class="service-card bg-white text-gray-800 p-5 rounded-lg text-center w-full md:w-1/4 lg:w-1/5 shadow-lg z-10 mx-auto md:mx-0">
          <div class="service-image bg-gray-300 h-40 mb-4 rounded"></div>
          <h4 class="text-xl font-bold mb-2">{{ service.name }}</h4>
          <p class="text-sm mb-4">{{ service.description }}</p>
          <a href="#" class="inline-block px-6 py-2 bg-primary text-white font-semibold rounded-full hover:bg-teal-600 transition-colors">Explorar {{ service.name }}</a>
        </div>
      </div>
    </div>
    <!-- Simulación de fondo con corte -->
    <div class="absolute inset-0 bg-gradient-to-b from-[#2c3e50] to-transparent opacity-50 -z-10"></div>
  </section>
<!-- Comunicación Privada -->
<section class="bg-gray-100 pb-15 pt-15 sm:pt-20 sm:pb-20 md:pt-80 md:pb-30 lg:pt-85 lg:pb-20 xl:pt-75 xl:pb-40 font-poppins">
    <div class="container mx-auto px-4 lg:px-40 xl:px-60">
      <div class="flex flex-col md:flex-row gap-20">
        <!-- Columna Izquierda -->
        <div class="w-full md:w-1/2 flex flex-col items-start gap-4">
          <p class="text-xs font-semibold text-primary font-poppins uppercase">Comunicación Privada</p>
          <h2 class="text-5xl font-bold text-gray-800 font-abril pb-2">Chat Seguro y Directo</h2>
          <p class="text-base text-gray-800 font-poppins pb-2">
            La integración de un chat privado en nuestra plataforma permite a los usuarios comunicarse directamente con proveedores de servicios y otros miembros de la comunidad. Esta herramienta no solo facilita las transacciones, sino que también fomenta conexiones personales y seguras, mejorando la experiencia de usuario al permitir interacciones fluidas y personalizadas.
          </p>
          <a href="#" class="inline-block px-6 py-2 bg-[#2c3e50] text-white font-semibold rounded-[25px] hover:bg-blue-700 transition-colors">
            Iniciar Chat
          </a>
        </div>
        <!-- Columna Derecha -->
        <div class="w-full md:w-1/2 flex items-start">
          <p class="text-base text-gray-800 font-poppins">
            El chat privado es esencial para coordinar servicios, discutir detalles de adopción o simplemente conectar con otros amantes de los animales. Al ofrecer un canal de comunicación seguro y directo, nuestra plataforma asegura que las interacciones sean confiables y efectivas, promoviendo un ambiente de confianza y colaboración.
          </p>
        </div>
      </div>
    </div>
  </section>
  <CarouselAwareness title="Eventos Próximos" :events="awarenessEvents" :auto-scroll="false" />
  <!-- Footer -->
  <footer class="bg-gray-800 text-white py-10">
    <div class="container mx-auto px-4 text-center">
      <div class="flex justify-around flex-col md:flex-row mb-5 gap-5">
        <div class="footer-widget">
          <h3 class="text-xl mb-3">Archives</h3>
          <ul class="list-none">
            <li><a href="#" class="text-gray-300 hover:text-blue-400">February 2025</a></li>
          </ul>
        </div>
        <div class="footer-widget">
          <h3 class="text-xl mb-3">Categories</h3>
          <ul class="list-none">
            <li><a href="#" class="text-gray-300 hover:text-blue-400">Blog</a></li>
          </ul>
        </div>
      </div>
      <div class="mb-5">
        <a href="#" class="text-white mx-2 hover:text-blue-400">Facebook</a>
        <a href="#" class="text-white mx-2 hover:text-blue-400">X</a>
        <a href="#" class="text-white mx-2 hover:text-blue-400">Instagram</a>
        <a href="#" class="text-white mx-2 hover:text-blue-400">RSS</a>
      </div>
      <p class="text-sm text-gray-400">© 2025 Voircare. All rights reserved. Designed by Elegant Themes | Powered by WordPress</p>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import CarouselAwareness from '../components/organisms/CarrouselAwareness.vue';

const features = [
  'Red Social Personalizada',
  'Servicios Geolocalizados',
  'Comunidad Activa',
  'Educación en un Solo Lugar',
  'Eventos y Talleres',
  'Interacción Personal',
  'Perfiles Personalizados',
  'Alertas de Servicios',
  'Adopciones Responsables',
  'Contenido Educativo',
  'Conexión con Refugios',
  'Experiencia Completa',
];

const services = [
  { name: 'Veterinarias cercanas', description: 'Encuentra clínicas veterinarias eficientes cerca de tu ubicación.' },
  { name: 'Paseadores', description: 'Conecta con paseadores de confianza en tu área.' },
  { name: 'Refugios', description: 'Descubre refugios cercanos y oportunidades de adopción.' },
];
const awarenessEvents = ref([
  { title: 'Taller de Bienestar Animal', date: '15 de Noviembre, 2023' },
  { title: 'Charla sobre Adopción Responsable', date: '22 de Noviembre, 2023' },
  { title: 'Jornada de Educación', date: '20 de Noviembre, 2023' },
  { title: 'Seminario de Cuidado de Mascotas', date: '6 de Diciembre, 2023' },
  { title: 'Jornada de Refugios', date: '10 de Diciembre, 2023' },
  { title: 'Taller de Adopción', date: '18 de Diciembre, 2023' },
  { title: 'Taller de Adopción', date: '18 de Diciembre, 2023' },
  { title: 'Taller de Adopción', date: '18 de Diciembre, 2023' },
  { title: 'Taller de Adopción', date: '18 de Diciembre, 2023' },
]);

const scrollContainer = ref(null);
let scrollInterval = null;

const scroll = (direction) => {
  if (scrollContainer.value) {
    const scrollAmount = 300; // Ajusta según el ancho de las tarjetas
    scrollContainer.value.scrollLeft += direction * scrollAmount;
  }
};

// Desplazamiento automático (opcional)
onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('wheel', (evt) => {
      evt.preventDefault();
      const scrollAmount = evt.deltaY * 0.5;
      scrollContainer.value.scrollLeft += scrollAmount;
    });

    // Opcional: Desplazamiento automático
    scrollInterval = setInterval(() => scroll(1), 5000); // Cambia cada 5 segundos
  }
});

onUnmounted(() => {
  if (scrollInterval) clearInterval(scrollInterval);
});
</script>

<style scoped>
/* Estilos personalizados mínimos */
.read-the-docs {
  color: #888;
}
/* Ocultar scrollbar en navegadores modernos */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none; /* IE y Edge */
  scrollbar-width: none; /* Firefox */
}

/* .service-card {
  max-width: 300px;
  margin-bottom: -5%; 
  transform: translateY(40%);
} */

.service-card {
  max-width: 300px;
  /* Control de margin-bottom por breakpoint */
  margin-bottom: 2%; /* Default (móvil) */
}
@media (min-width: 769px) { /* sm: tablet */
  .service-card {
    margin-top: -10%;
    margin-bottom: -20%;
  }
}
@media (min-width: 1024px) { /* lg: desktop */
  .service-card {
    margin-bottom: -15%;
  }
}

/* Ajuste de translateY para mantener el 70% dentro */
/* .service-card {
  transform: translateY(150%);
} */
@media (min-width: 769px) { /* sm: tablet */
  .service-card {
    transform: translateY(60%);
  }
}
@media (min-width: 1024px) { /* lg: desktop */
  .service-card {
    transform: translateY(70%);
  }
}
.font-poppins {
  font-family: 'Poppins', sans-serif;
}
.font-abril {
  font-family: 'Abril Fatface';
  font-weight: 800;
}
</style>