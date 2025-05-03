import { firebaseApp } from './api/firebase/config';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router/router';
import App from './App.vue';
import './style.css'
import process from 'process'
import { mask } from 'vue-the-mask';

window.process = process

// Verifico tema dela web en localstorage
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.directive('mask', mask);
app.mount('#app');

app.provide('firebaseApp', firebaseApp); // Registro instancia de firebase de forma global.