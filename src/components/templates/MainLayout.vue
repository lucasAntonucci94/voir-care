<!-- mainlayout.vue -->
<template>
  <div class="h-screen flex flex-col">
    <Header @toggle-sidebar="handleToggleSidebar" />
    <main class="flex-grow overflow-y-auto">
      <router-view :show-sidebar="showSidebar" @toggle-sidebar="handleToggleSidebar" />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Header from '../../components/organisms/Header.vue';
import Footer from '../../components/organisms/Footer.vue';

// Estado del sidebar (lo manejamos aquí para propagarlo)
const showSidebar = ref(false);

// Función para alternar el sidebar
function handleToggleSidebar() {
  showSidebar.value = !showSidebar.value;
}
</script>