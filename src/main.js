import './api/firebase'
import { createApp } from 'vue';
import router from './router/router';
import App from './App.vue';
import './style.css'
// import { authState } from './api/auth/authState'; 

createApp(App)
.use(router)
// .provide('authState', authState)
.mount('#app');