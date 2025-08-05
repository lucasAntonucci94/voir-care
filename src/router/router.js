import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../components/templates/MainLayout.vue';
import Home from '../pages/Home.vue';
import Feed from '../pages/Feed.vue';
import Profile from '../pages/Profile.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Faqs from '../pages/Faqs.vue';
import Explore from '../pages/Explore.vue';
import LandingPage from '../pages/LandingPage.vue';
import ChatView from '../pages/ChatView.vue';
import Groups from '../pages/GroupsPage.vue';
import GroupDetail from '../pages/GroupDetail.vue';
import Events from '../pages/EventsPage.vue';
import EventDetail from '../pages/EventDetail.vue';
import LocationDetail from '../pages/LocationDetail.vue';
import NotFound from '../pages/NotFound.vue';
import EducationPage from '../pages/EducationPage.vue';
import PremiumPage from '../pages/PremiumPage.vue';
import TermsAndConditionsPage from '../pages/ConditionsAndTermsPage.vue';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage.vue';
import DonatePage from '../pages/DonatePage.vue';
import AdminDashboardPage from '../pages/admin/AdminDashboard.vue';
import ReportsPage from '../pages/admin/ReportsPage.vue';
import PostDetailPage from '../pages/PostDetailPage.vue';
import ReelDetailPage from '../pages/ReelDetailPage.vue';
import AdmUsersPage from '../pages/admin/UsersPage.vue';
import AdmEventsPage from '../pages/admin/EventsPage.vue';
import AdmGroupsPage from '../pages/admin/GroupsPage.vue';
import AdmDefaultReelsPage from '../pages/admin/DefaultReelsPage.vue';
import AdmEducationsPage from '../pages/admin/EducationsPage.vue';
import BlogDetailPage from '../pages/BlogDetail.vue';
import AdoptionPage from '../pages/AdoptionPage.vue';
import AdmCategoriesPage from '../pages/admin/CategoriesPage.vue';
import AdmBlogCategoriesPage from '../pages/admin/BlogCategoriesPage.vue';
import AdmPostsPage from '../pages/admin/PostsPage.vue';
import AdmSubscriptionsPage from '../pages/admin/SubscriptionsPage.vue';
import AdmLocationsPage from '../pages/admin/LocationsPage.vue';
import CategoriesDashboard from '../pages/admin/CategoriesDashboard.vue';
import { useAuth } from '../api/auth/useAuth';

const routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '/feed',
        name: 'feed',
        component: Home,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path: '/social',
        name: 'social',
        component: Feed,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path: '',
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
      {
        path: '/groups',
        name: 'groups',
        component: Groups,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/group/:idGroup?',
        name: 'groupDetail',
        component: GroupDetail,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path: '/events',
        name: 'events',
        component: Events,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/event/:idEvent?',
        name: 'eventDetail',
        component: EventDetail,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/location/:idLocation?',
        name: 'locationDetail',
        component: LocationDetail,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/education',
        name: 'education',
        component: EducationPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/adoption',
        name: 'adoption',
        component: AdoptionPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/blog/:idBlog?',
        name: 'blogDetail',
        component: BlogDetailPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/premium',
        name: 'premium',
        component: PremiumPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path: '/post/:id',
        name: 'PostDetail',
        component: PostDetailPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path: '/reel/:id',
        name: 'ReelDetail',
        component: ReelDetailPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path: '/termsandconditions',
        name: 'TermsAndConditions',
        component: TermsAndConditionsPage,
        meta: {
            requiresAuth: false,
        }
      },
      {
        path: '/privacypolicy',
        name: 'PrivacyPolicy',
        component: PrivacyPolicyPage,
        meta: {
            requiresAuth: false,
        }
      },
      {
        path: '/donate',
        name: 'Donate',
        component: DonatePage,
        meta: {
            requiresAuth: false,
        }
      },
      {
        path:  '/admin/dashboard',
        name: 'dashboard',
        component: AdminDashboardPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/admin/reports',
        name: 'reportsAdm',
        component: ReportsPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/admin/users',
        name: 'usersAdm',
        component: AdmUsersPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/admin/defaultReels',
        name: 'defaultReelsAdm',
        component: AdmDefaultReelsPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/admin/events',
        name: 'eventsAdm',
        component: AdmEventsPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/admin/groups',
        name: 'groupsAdm',
        component: AdmGroupsPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/admin/education',
        name: 'educationAdm',
        component: AdmEducationsPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/admin/posts',
        name: 'postsAdm',
        component: AdmPostsPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/admin/categories/posts',
        name: 'categoriesAdm',
        component: AdmCategoriesPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/admin/categories/blogs',
        name: 'BlogcategoriesAdm',
        component: AdmBlogCategoriesPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/admin/subscriptions',
        name: 'SubscriptionsAdm',
        component: AdmSubscriptionsPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/admin/locations',
        name: 'LocationsAdm',
        component: AdmLocationsPage,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path:  '/admin/categories',
        name: 'CategoriesDashboard',
        component: CategoriesDashboard,
        meta: {
            requiresAuth: true,
        }
      },
      {
        path: '/:pathMatch(.*)*', //este path es para capturar cualquier ruta que no exista
        name: 'NotFound',
        component: NotFound
      },
    ],
  },
];

const scrollBehavior = (to, from, savedPosition) => {
  // Si hay una posición guardada
  if (savedPosition) {
    return savedPosition;
  }
  // Si hay un hash en la URL (un anclaje)
  else if (to.hash) {
    // Busca el elemento en el DOM con el ID del hash
    const el = document.querySelector(to.hash);
    
    if (el) {
      // Retorna la configuración de scroll para desplazar al elemento
      // top: el.getBoundingClientRect().top + window.scrollY - 0, 
      // Si tienes un header fijo, ajusta el '0' a la altura de tu header para que no se oculte el contenido
      return {
        el: to.hash,
        behavior: 'smooth', // Desplazamiento suave
      };
    }
    // Si el elemento no existe, simplemente desplázate al top
    return { top: 0, behavior: 'smooth' };
  }
  // Si no hay hash y no hay posición guardada, desplázate al inicio de la página
  else {
    return { top: 0, behavior: 'smooth' };
  }
};

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior,  
});

const { isAuthenticated, user } = useAuth();
// Verificamos si una ruta requiere de autenticación para poder acceder.
router.beforeEach((to, from) => {
  if(to.meta.requiresAuth && !isAuthenticated.value) {
      return {
          path: '/login',
      }
  }
  if(to.path.includes('/admin') && !user?.value?.isAdmin) {
      return {
          path: '/feed',
      }
  }
  if(to.path === '/' && isAuthenticated.value) {
      return {
          path: '/feed',
      }
  }
});

export default router;