// main.js
import './api/firebase'
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router/router';
import App from './App.vue';
import './style.css'

const app = createApp(App);
const pinia = createPinia();
// const { loadCategories } = useCategories();

// loadCategories().then(()=>{
    // Cargamos las categorías al inicio
    app.use(pinia); // Integra Pinia en la app
    app.use(router); // Integra el router
    app.mount('#app');
// }); 