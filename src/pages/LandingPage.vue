<template>
  <!-- Sección Hero -->
  <section
    class="relative h-[75vh] xs:h-[60vh] sm:h-[65vh] text-white pt-15 md:pt-25 bg-cover bg-center"
    :style="{ clipPath: 'polygon(0 0, 100% 0%, 100% 85%, 0 100%)', backgroundImage: 'url(https://images.unsplash.com/photo-1601758176119-1b4c4924a4a2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)' }"
  >
    <div class="absolute inset-0 bg-black opacity-50"></div> <!-- Overlay para legibilidad -->
    <div class="container mx-auto px-4 font-poppins relative z-10">
      <div class="flex flex-col items-start gap-5 px-5 md:px-10 lg:px-40 xl:px-50 animate-fade-in">
        <p class="text-1xl font-bold text-[#F4A261] animate-delay-1">Únete a la revolución del cuidado animal</p>
        <h1 class="text-3xl md:text-4xl lg:text-6xl font-bold mb-0 font-abril animate-delay-2">
          Juntos por el bienestar animal: Conecta, aprende y crece
        </h1>
        <p class="text-lg mb-0 font-poppins animate-delay-3">
          Somos la comunidad que ama y protege a los animales. Descubre un espacio para educarte, conectar con otros amantes de las mascotas y acceder a recursos que transformarán la vida de tus perros y gatos.
        </p>
        <router-link to="register" class="inline-block px-12 py-3 bg-[#F4A261] text-white font-semibold rounded-lg hover:bg-[#E76F51] transition-transform transform hover:scale-105 animate-pulse animate-delay-4">
          Únete a la comunidad
        </router-link>
      </div>
    </div>
  </section>

  <!-- Características Destacadas -->
  <section class="bg-[#F9FAFB] pt-34 py-30 -mt-14 font-poppins">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-4xl md:text-5xl font-bold text-[#333333] mb-10 font-abril">¿Qué ofrecemos para ti y tus mascotas?</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div v-for="(feature, index) in features" :key="index" class="feature-item flex items-center p-4 bg-white rounded-lg text-[#333333] text-base shadow-md hover:shadow-lg transition-shadow">
          <img src="https://img.icons8.com/ios-filled/50/5C8D89/paw.png" alt="Feature Icon" class="w-10 h-10 mr-3" />
          <p>{{ feature }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Misión y Visión -->
  <section class="bg-[#F5E8C7] py-20 font-abril">
    <div class="container mx-auto px-4 font-poppins">
      <h2 class="text-4xl md:text-5xl font-bold text-[#333333] text-center mb-12 font-abril">Nuestra misión: Un mundo mejor para los animales</h2>
      <div class="flex flex-col md:flex-row gap-10">
        <div class="mission flex-1 p-6 bg-white rounded-lg shadow-md">
          <h3 class="text-2xl text-[#333333] mb-4 font-abril">Misión</h3>
          <p class="text-[#333333] text-base">
            Concientizar y educar a las personas sobre el cuidado responsable de perros y gatos, creando una comunidad unida que promueva el bienestar animal y transforme vidas.
          </p>
        </div>
        <div class="vision flex-1 p-6 bg-white rounded-lg shadow-md">
          <h3 class="text-2xl text-[#333333] mb-4 font-abril">Visión</h3>
          <p class="text-[#333333] text-base">
            Ser el hogar digital de todos los amantes de los animales, donde encuentren inspiración, recursos y una comunidad apasionada para hacer del mundo un lugar más seguro y feliz para las mascotas.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Servicios Geolocalizados (Sección Explorar) -->
  <section class="bg-gradient-to-tr from-[#A8D5BA] via-[#5C8D89] to-[#2C3E50] py-16 relative md:h-[50vh] font-poppins">
    <div class="container mx-auto px-4">
      <h2 class="text-4xl md:text-5xl font-bold text-white text-center mb-10 md:mb-0 font-abril">Explora el mundo animal cerca de ti</h2>
      <div class="flex flex-col md:flex-row justify-center gap-4 md:gap-10 md:-translate-y-2/3 lg:-translate-y-2/3">
        <div v-for="service in services" :key="service.name" class="service-card bg-white text-[#333333] p-5 rounded-lg text-center w-full md:w-1/4 lg:w-1/5 shadow-lg z-10 mx-auto md:mx-0 hover:-translate-y-2 transition-transform">
          <div class="service-image h-40 mb-4 rounded" :style="{ backgroundImage: `url(${service.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }"></div>
          <h4 class="text-xl font-bold mb-2 font-abril">{{ service.name }}</h4>
          <p class="text-sm mb-4">{{ service.description }}</p>
          <a href="#" class="inline-block px-6 py-2 bg-[#F4A261] text-white font-semibold rounded-full hover:bg-[#E76F51] transition-colors">Descubre más</a>
        </div>
      </div>
    </div>
    <div class="absolute inset-0 bg-gradient-to-b from-[#2C3E50] to-transparent opacity-50 -z-10"></div>
  </section>

  <!-- Comunicación Privada -->
  <section class="bg-[#F9FAFB] pb-15 pt-15 sm:pt-20 sm:pb-20 md:pt-80 md:pb-30 lg:pt-85 lg:pb-20 xl:pt-75 xl:pb-40 font-poppins">
    <div class="container mx-auto px-4 lg:px-40 xl:px-60">
      <div class="flex flex-col md:flex-row gap-20">
        <!-- Columna Izquierda -->
        <div class="w-full md:w-1/2 flex flex-col items-start gap-4">
          <p class="text-xs font-semibold text-[#F4A261] font-poppins uppercase">Conecta con confianza</p>
          <h2 class="text-5xl font-bold text-[#333333] font-abril pb-2">Chats privados y seguros</h2>
          <p class="text-base text-[#333333] font-poppins pb-2">
            Comunícate directamente con otros amantes de los animales, veterinarios o paseadores en un espacio seguro. Comparte experiencias, coordina adopciones o encuentra el apoyo que necesitas.
          </p>
          <a href="#" class="inline-block px-6 py-2 bg-[#F4A261] text-white font-semibold rounded-[25px] hover:bg-[#E76F51] transition-transform transform hover:scale-105">
            Empieza a chatear
          </a>
        </div>
        <!-- Columna Derecha -->
        <div class="w-full md:w-1/2 flex items-start">
          <p class="text-base text-[#333333] font-poppins">
            Nuestro chat privado te permite conectar de forma segura con la comunidad, ya sea para organizar un evento, buscar consejos o simplemente charlar sobre tu amor por las mascotas.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Eventos y Grupos -->
  <CarouselAwareness title="Eventos y grupos para amantes de los animales" :events="awarenessEvents" :auto-scroll="false" />

  <!-- Footer -->
  <footer class="bg-[#2C3E50] text-white py-10">
    <div class="container mx-auto px-4 text-center">
      <div class="flex justify-around flex-col md:flex-row mb-5 gap-5">
        <div class="footer-widget">
          <h3 class="text-xl mb-3">Archivos</h3>
          <ul class="list-none">
            <li><a href="#" class="text-gray-300 hover:text-[#F4A261]">Abril 2025</a></li>
          </ul>
        </div>
        <div class="footer-widget">
          <h3 class="text-xl mb-3">Categorías</h3>
          <ul class="list-none">
            <li><a href="#" class="text-gray-300 hover:text-[#F4A261]">Blog de cuidado animal</a></li>
          </ul>
        </div>
      </div>
      <div class="mb-5">
        <a href="#" class="text-white mx-2 hover:text-[#F4A261]">Facebook</a>
        <a href="#" class="text-white mx-2 hover:text-[#F4A261]">X</a>
        <a href="#" class="text-white mx-2 hover:text-[#F4A261]">Instagram</a>
        <a href="#" class="text-white mx-2 hover:text-[#F4A261]">RSS</a>
      </div>
      <p class="text-sm text-gray-400">© 2025 [Nombre de tu red social]. Todos los derechos reservados. Juntos por un mundo mejor para los animales.</p>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import CarouselAwareness from '../components/organisms/CarrouselAwareness.vue';

// Características
const features = [
  'Comunidad de amantes de los animales',
  'Chats privados y seguros',
  'Mapa para encontrar veterinarias y parques',
  'Eventos y talleres de cuidado animal',
  'Grupos para compartir experiencias',
  'Guías y artículos educativos',
  'Apoyo a adopciones responsables',
  'Conexión con refugios locales',
  'Recursos para el bienestar animal',
  'Interacción con paseadores y guarderías',
  'Contenido exclusivo para miembros',
  'Espacio para aprender y crecer juntos',
];

// Servicios geolocalizados con imágenes
const services = [
  { name: 'Parques y áreas pet-friendly', description: 'Encuentra los mejores lugares para pasear y jugar con tu mascota.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop' },
  { name: 'Veterinarias y clínicas', description: 'Localiza veterinarios confiables cerca de tu ubicación.', image: 'https://images.unsplash.com/photo-1583468982228-19f19164aee2?q=80&w=2073&auto=format&fit=crop' },
  { name: 'Paseadores y guarderías', description: 'Conecta con profesionales para el cuidado de tu perro o gato.', image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=2070&auto=format&fit=crop' },
];

// Eventos y grupos
const awarenessEvents = ref([
  { title: 'Taller de adiestramiento positivo', date: '15 de abril, 2025' },
  { title: 'Jornada de adopción responsable', date: '22 de abril, 2025' },
  { title: 'Charla: Cómo cuidar a tu gato en casa', date: '20 de abril, 2025' },
  { title: 'Evento de socialización para perros', date: '6 de mayo, 2025' },
  { title: 'Taller de primeros auxilios para mascotas', date: '10 de mayo, 2025' },
  { title: 'Grupo: Amantes de los gatos', date: 'Únete hoy' },
  { title: 'Grupo: Adopción y rescate', date: 'Únete hoy' },
]);

const scrollContainer = ref(null);
let scrollInterval = null;

const scroll = (direction) => {
  if (scrollContainer.value) {
    const scrollAmount = 300;
    scrollContainer.value.scrollLeft += direction * scrollAmount;
  }
};

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('wheel', (evt) => {
      evt.preventDefault();
      const scrollAmount = evt.deltaY * 0.5;
      scrollContainer.value.scrollLeft += scrollAmount;
    });

    scrollInterval = setInterval(() => scroll(1), 5000);
  }
});

onUnmounted(() => {
  if (scrollInterval) clearInterval(scrollInterval);
});
</script>

<style scoped>
/* Animaciones */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}

.animate-delay-1 { animation-delay: 0.2s; }
.animate-delay-2 { animation-delay: 0.4s; }
.animate-delay-3 { animation-delay: 0.6s; }
.animate-delay-4 { animation-delay: 0.8s; }

.animate-pulse {
  animation: pulse 2s infinite;
}

/* Estilos generales */
.read-the-docs {
  color: #888;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.service-card {
  max-width: 300px;
  margin-bottom: 2%;
}
@media (min-width: 769px) {
  .service-card {
    margin-top: -10%;
    margin-bottom: -20%;
  }
}
@media (min-width: 1024px) {
  .service-card {
    margin-bottom: -15%;
  }
}

@media (min-width: 769px) {
  .service-card {
    transform: translateY(60%);
  }
}
@media (min-width: 1024px) {
  .service-card {
    transform: translateY(70%);
  }
}

.font-poppins {
  font-family: 'Poppins', sans-serif;
  line-height: 1.6;
}

.font-abril {
  font-family: 'Abril Fatface', cursive;
  font-weight: 800;
  letter-spacing: 1px;
}
</style>