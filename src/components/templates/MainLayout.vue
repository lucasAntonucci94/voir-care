<template>
  <div class="h-screen flex flex-col">
    <Header :show-sidebar="showSidebar" @toggle-sidebar="showSidebar = !showSidebar" />
    <div class="flex flex-1 overflow-hidden">
      <Sidebar :show="showSidebar" @toggle="showSidebar = !showSidebar" />
      <main class="flex-grow overflow-y-auto">
        <router-view />
      </main>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Header from '../../components/organisms/Header.vue';
import Footer from '../../components/organisms/Footer.vue';
import Sidebar from '../../components/organisms/Sidebar.vue';

const showSidebar = ref(false);
</script>