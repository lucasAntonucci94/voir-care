import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../components/templates/MainLayout.vue';
import Feed from '../pages/Feed.vue';
import Profile from '../pages/Profile.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Faqs from '../pages/Faqs.vue';
import Explore from '../pages/Explore.vue';
import LandingPage from '../pages/LandingPage.vue';
import ChatView from '../pages/ChatView.vue';
import { useAuth } from '../api/auth/useAuth';

const routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '/feed',
        name: 'feed',
        component: Feed,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path: '/',
        name: 'landingPage',
        component: LandingPage,
      },
      {
        path: '/login',
        name: 'login',
        component: Login,
      },
      {
        path: '/register',
        name: 'register',
        component: Register,
      },
      {
        path: '/profile/:email?',
        name: 'profile',
        component: Profile,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path: '/faqs',
        name: 'faqs',
        component: Faqs,
      },
      {
        path: '/explorar',
        name: 'explorar',
        component: Explore,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path: '/chats/:idChat?',
        name: 'chats',
        component: ChatView,
        meta: {
            requiresAuth: true,
        }
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const { isAuthenticated } = useAuth();
// Verificamos si una ruta requiere de autenticación para poder acceder.
router.beforeEach((to, from) => {
  if(to.meta.requiresAuth && !isAuthenticated.value) {
      return {
          path: '/login',
      }
  }
  if(to.path === '/' && isAuthenticated.value) {
      return {
          path: '/feed',
      }
  }
});

export default router;