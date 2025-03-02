import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../components/templates/MainLayout.vue';
import Feed from '../pages/Feed.vue';
import Profile from '../pages/Profile.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Faqs from '../pages/Faqs.vue';
import Explore from '../pages/Explore.vue';
import LandingPage from '../pages/LandingPage.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '/feed',
        name: 'feed',
        component: Feed,
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
        path: '/profile',
        name: 'profile',
        component: Profile,
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
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;