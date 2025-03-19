import { firebaseApp } from './api/firebase/config';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router/router';
import App from './App.vue';
import './style.css'

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.mount('#app');

app.provide('firebaseApp', firebaseApp); // Registro instancia de firebase deforma global.