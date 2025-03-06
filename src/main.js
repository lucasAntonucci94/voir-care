import './api/firebase'
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router/router';
import App from './App.vue';
import './style.css'

const app = createApp(App);
const pinia = createPinia();
app.use(pinia); // Integro Pinia
app.use(router); // Integro Router
app.mount('#app');