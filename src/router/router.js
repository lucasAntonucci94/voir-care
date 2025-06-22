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
import Groups from '../pages/GroupsPage.vue';
import GroupDetail from '../pages/GroupDetail.vue';
import Events from '../pages/EventsPage.vue';
import EventDetail from '../pages/EventDetail.vue';
import NotFound from '../pages/NotFound.vue';
import EducationPage from '../pages/EducationPage.vue';
import PremiumPage from '../pages/PremiumPage.vue';
import AdminDashboardPage from '../pages/admin/AdminDashboard.vue';
import ReportsPage from '../pages/admin/ReportsPage.vue';
import AdmUsersPage from '../pages/admin/UsersPage.vue';
import AdmEventsPage from '../pages/admin/EventsPage.vue';
import AdmGroupsPage from '../pages/admin/GroupsPage.vue';
import AdmDefaultReelsPage from '../pages/admin/DefaultReelsPage.vue';
import AdmEducationsPage from '../pages/admin/EducationsPage.vue';
import BlogDetailPage from '../pages/BlogDetail.vue';
import AdoptionPage from '../pages/AdoptionPage.vue';
import AdmCategoriesPage from '../pages/admin/CategoriesPage.vue';
import AdmBlogCategoriesPage from '../pages/admin/BlogCategoriesPage.vue';
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
        path:  '/admin/adoption',
        name: 'adoptionAdm',
        component: AdmUsersPage,
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
        path: '/:pathMatch(.*)*', //este path es para capturar cualquier ruta que no exista
        name: 'NotFound',
        component: NotFound
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
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