<template>
  <div class="h-screen">
    <Header />
    <div class="flex">
      <!-- <Sidebar /> -->
      <main class="flex-grow">
        <router-view />
      </main>
    </div>
    <Footer />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import Header from '../organisms/Header.vue'
import Footer from '../organisms/Footer.vue'


export default defineComponent({
  name: 'MainLayout',
  components: {
    Header,
    Footer,
  }
})
</script>