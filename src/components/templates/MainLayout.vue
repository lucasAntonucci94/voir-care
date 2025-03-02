<!-- mainlayout.vue -->
<template>
  <div class="h-screen flex flex-col">
    <Header />
    <main class="flex-grow"> <!-- si quiero que queden tanto header como footer sticky puedo agregar esta clase overflow-y-auto-->
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from '../../components/organisms/Header.vue';
import Footer from '../../components/organisms/Footer.vue';
</script>