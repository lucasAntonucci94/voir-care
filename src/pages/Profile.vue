<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 font-poppins relative">
    <!-- Loader -->
    <div v-if="!activeUser" class="flex-grow flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div class="text-center">
        <img src="../assets/loaders/pawOrange.gif" alt="">
        <p class="text-primary dark:text-secondary text-lg font-medium animate-pulse">Cargando perfil...</p>
      </div>
    </div>

    <!-- Contenido del perfil -->
    <div v-if="activeUser" class="contents">
      <ProfileHeader
        ref="profileHeader"
        :activeUser="activeUser"
        :activeTab="activeTab"
        :isOwnProfile="isOwnProfile"
        :setTabConexiones="setTabConexiones"
        :setTabInformation="setTabInformation"
        :connections="connections"
        :updateRefData="updateDataFromChild"
      />
      <!-- Tabs con flechas -->
      <div class="container mx-auto  mt-10 md:mt-5  sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-10 rounded-lg">
        <div class="relative">
          <!-- Botón de flecha izquierda -->
          <button
            v-if="showArrows && canScrollLeft"
            @click="scrollLeft"
            class="absolute left-0 top-1/2 -translate-y-1/2 bg-primary dark:bg-secondary text-white p-2 rounded-full shadow-md hover:bg-primary-md dark:hover:bg-secondary-md transition-colors md:hidden z-20"
            aria-label="Desplazar pestañas a la izquierda"
          >
            <i class="fa-solid fa-chevron-left w-5 h-5"></i>
          </button>

          <!-- Contenedor de tabs -->
          <div
            ref="tabsContainer"
            class=" flex gap-1 md:gap-3 py-3 overflow-x-auto scrollbar-hide whitespace-nowrap snap-x snap-mandatory md:justify-center"
            @scroll="updateScrollState"
          >
            <button
              v-for="tab in allTabs"
              :key="tab.name"
              @click="activeTab = tab.name.toLowerCase()"
              :class="[
                'relative py-2 px-2 md:px-5 text-sm font-medium transition-all duration-300 snap-start flex items-center space-x-2',
                activeTab === tab.name.toLowerCase()
                  ? 'text-primary dark:text-secondary border-b-2 border-primary dark:border-secondary'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700',
                  tab.hidden && (activeUser.uid !== authUser.uid) ? 'hidden' : '',
                ]"
              :aria-selected="activeTab === tab.name.toLowerCase()"
              role="tab"
              >
              <i :class="tab.icon" aria-hidden="true"></i>
              <span>{{ tab.name }}</span>
              <span
                v-if="activeTab === tab.name.toLowerCase()"
                class="absolute inset-x-0 bottom-0 h-0.5 bg-primary dark:bg-secondary"
              ></span>
            </button>
          </div>
          <!-- Botón de flecha derecha -->
          <button
            v-if="showArrows && canScrollRight"
            @click="scrollRight"
            class="absolute right-0 top-1/2 -translate-y-1/2 bg-primary dark:bg-secondary text-white p-2 rounded-full shadow-md hover:bg-primary-md dark:hover:bg-secondary-md transition-colors md:hidden z-20"
            aria-label="Desplazar pestañas a la derecha"
          >
            <i class="fa-solid fa-chevron-right w-5 h-5"></i>
          </button>
        </div>
      </div>

      <!-- Contenido del perfil -->
      <div class="container mx-auto px-4 md:px-8 lg:px-16 my-6">
        <div class="grid grid-cols-1 gap-6 max-w-full mx-4 md:mx-0">
          <div class="md:col-span-2">
            <h2 class="text-lg font-semibold text-[#2c3e50] mb-4 sr-only">Publicaciones</h2>
            <div v-if="activeTab === 'publicaciones'" class="space-y-6 mx-auto max-w-lg">
              <PostCard v-for="post in filteredProfilePosts" :key="post.id" :post="post" @delete="deletePost(post.id)" />
              <div  v-if="!filteredProfilePosts?.length" class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <p class="text-gray-500 dark:text-gray-400">No tienes publicaciones guardadas aún.</p>
                <button
                  class="mt-4 ml-4 px-4 py-2 bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white rounded-lg text-sm transition-colors"
                  @click="navigateToFeed"
                >
                  Explorar publicaciones
                </button>
              </div>
            </div>
            <ReelsTab v-else-if="activeTab === 'reels'" :userId="activeUser.uid" />
            <UserEventsTab v-else-if="activeTab === 'eventos'" :userId="activeUser.uid" />
            <UserGroupsTab v-else-if="activeTab === 'grupos'" :userId="activeUser.uid" />
            <MapTab v-else-if="activeTab === 'mapa'" />
            <ProfileInfo v-else-if="activeTab === 'información'" :userInfo="activeUser" @trigger-edit="triggerEditProfile" :isOwnProfile="isOwnProfile" />
            <ConnectionsTab v-else-if="activeTab === 'conexiones'" :connections="connections" @active-tab="setActiveTab" />
            <GalleryTab v-else-if="activeTab === 'galería'" :activeUser="activeUser" />
            <SavedPostTab v-else-if="activeTab === 'guardado'" />
            <HiddenPostsTab v-else-if="activeTab === 'oculto'" />
          </div>
        </div>
      </div>
    </div>
     
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router'
import { useAuth } from '../api/auth/useAuth';
import { usePostsStore } from '../stores/posts';
import PostCard from '../components/organisms/PostCard.vue';
import { useUsers } from '../composable/useUsers';
import ProfileHeader from '../components/molecules/ProfileHeader.vue';
import ProfileInfo from '../components/molecules/ProfileInfoTab.vue';
import ConnectionsTab from '../components/organisms/ConnectionsTab.vue';
import GalleryTab from '../components/organisms/ProfileGalleryTab.vue';
import UserEventsTab from '../components/molecules/ProfileUserEventsTab.vue';
import UserGroupsTab from '../components/molecules/ProfileUserGroupsTab.vue';
import SavedPostTab from '../components/molecules/SavedPostsTab.vue';
import HiddenPostsTab from '../components/molecules/HiddenPostsTab.vue';
import MapTab from '../components/molecules/ProfileUserMapTab.vue';
import ReelsTab from '../components/molecules/ProfileUserReelsTab.vue';
// Instancias
const route = useRoute();
const { user: authUser } = useAuth();
const postsStore = usePostsStore();
const { getUserProfileByEmail } = useUsers();

// Estados
const activeUser = ref(null);
const activeTab = ref('grupos');
const tabsContainer = ref(null);
const showArrows = ref(false);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const connections = ref([]);
const router = useRouter()
const profileHeader = ref(null); // Ref to ProfileHeader component

// Tabs
const allTabs = [
  { name: 'Grupos', icon: 'fa-solid fa-users', hidden: false },
  { name: 'Eventos', icon: 'fa-solid fa-calendar-days', hidden: true },
  { name: 'Mapa', icon: 'fa-solid fa-map', hidden: true },
  { name: 'Publicaciones', icon: 'fa-solid fa-square-share-nodes', hidden: false },
  { name: 'Reels', icon: 'fa-solid fa-video', hidden: false },
  // { name: 'Galería', icon: 'fa-solid fa-images', hidden: false },
  { name: 'Información', icon: 'fa-solid fa-circle-info', hidden: false },
  { name: 'Conexiones', icon: 'fa-solid fa-user-group', hidden: false },
  { name: 'Guardado', icon: 'fa-solid fa-bookmark', hidden: true },
  { name: 'Oculto', icon: 'fa-solid fa-ban', hidden: true },
];

const setActiveTab = (selectedTab) => {
  activeTab.value = selectedTab;
};
const setTabConexiones = () => {
  activeTab.value = 'conexiones';
};
const setTabInformation = () => {
  activeTab.value = 'información';
};
const updateDataFromChild = updatedData => {
  activeUser.value = updatedData;
  authUser.value = updatedData;
};

// Computados
const activeUserEmail = computed(() => route.params.email || authUser.value?.email);
const isOwnProfile = computed(() => activeUserEmail.value === authUser.value?.email);
const filteredProfilePosts = computed(() => {
  const profilePosts = postsStore.profilePosts?.value || [];
  const hiddenPostIds = authUser.value?.hiddenPosts?.map(hp => hp.postId) || [];
  return profilePosts.filter(post => !hiddenPostIds.includes(post.idDoc));
});

// Watcher
watch(activeUserEmail, async newEmail => {
  if (!newEmail) return;
  await fetchUserData(newEmail);
  if (activeUser && (activeUser?.value?.uid || activeUser?.value?.id)) {
    postsStore.subscribeProfile(activeUser?.value?.uid || activeUser?.value?.id);
  }
  // Subscribe to savedPosts if this is the user's own profile
  if (isOwnProfile.value && authUser.value?.uid) {
    // console.log('Iniciando suscripción a posts guardados en Profile.vue...');
    postsStore.subscribeToSavedPosts(authUser.value.uid);
  }
});

// Funciones para desplazamiento
const scrollLeft = () => {
  if (tabsContainer.value) {
    const currentScroll = tabsContainer.value.scrollLeft;
    const tabElements = tabsContainer.value.querySelectorAll('button[role="tab"]');
    let targetScroll = 0;

    // Encuentra la pestaña más cercana a la izquierda
    for (let i = tabElements.length - 1; i >= 0; i--) {
      const tab = tabElements[i];
      const tabLeft = tab.offsetLeft;
      if (tabLeft < currentScroll) {
        targetScroll = tabLeft;
        break;
      }
    }

    tabsContainer.value.scrollTo({ left: targetScroll, behavior: 'smooth' });
    requestAnimationFrame(updateScrollState);
  }
};

const scrollRight = () => {
  if (tabsContainer.value) {
    const currentScroll = tabsContainer.value.scrollLeft;
    const tabElements = tabsContainer.value.querySelectorAll('button[role="tab"]');
    let targetScroll = tabsContainer.value.scrollWidth;

    // Encuentra la pestaña más cercana a la derecha
    for (let i = 0; i < tabElements.length; i++) {
      const tab = tabElements[i];
      const tabLeft = tab.offsetLeft;
      if (tabLeft > currentScroll) {
        targetScroll = tabLeft;
        break;
      }
    }

    tabsContainer.value.scrollTo({ left: targetScroll, behavior: 'smooth' });
    requestAnimationFrame(updateScrollState);
  }
};

const updateScrollState = () => {
  if (tabsContainer.value) {
    const { scrollLeft, scrollWidth, clientWidth } = tabsContainer.value;
    canScrollLeft.value = scrollLeft > 0;
    canScrollRight.value = Math.ceil(scrollLeft + clientWidth) < scrollWidth;
  }
};

const checkScroll = () => {
  if (tabsContainer.value) {
    const { scrollWidth, clientWidth } = tabsContainer.value;
    showArrows.value = scrollWidth > clientWidth && window.innerWidth < 768;
    updateScrollState();
  }
};

// Fetch de datos
const fetchUserData = async userEmail => {
  activeUser.value = await getUserProfileByEmail(userEmail);
  connections.value = activeUser?.value?.connections?.filter(c => c.email !== activeUser?.email) ?? [];
};

function deletePost(postId) {
  postsStore.posts.value = postsStore.posts.value.filter(p => p.id !== postId);
}

// Navigate to feed
function navigateToFeed() {
  router.push('/feed')
}
  
// Method to trigger editProfile in ProfileHeader
function triggerEditProfile() {
  if (profileHeader.value && profileHeader.value.editProfile) {
    profileHeader.value.editProfile();
  } else {
    console.error('ProfileHeader component does not expose editProfile method');
  }
}
// Ciclo de vida
onMounted(async () => {
  if (!activeUserEmail.value) return;
  await fetchUserData(activeUserEmail.value);
  if (activeUser && (activeUser?.value?.uid || activeUser?.value?.id)) {
    postsStore.subscribeProfile(activeUser?.value?.uid || activeUser?.value?.id);
  }
  // Subscribe to savedPosts if this is the user's own profile
  if (isOwnProfile.value && authUser.value?.uid) {
    // console.log('Iniciando suscripción a posts guardados en Profile.vue...');
    postsStore.subscribeToSavedPosts(authUser.value.uid);
  }
  checkScroll();
  window.addEventListener('resize', checkScroll);
});

onUnmounted(() => {
  postsStore.unsubscribeProfile();
  postsStore.unsubscribeSavedPosts(); // Cancela la suscripción a savedPosts
  window.removeEventListener('resize', checkScroll);
});
</script>

<style scoped>
.font-poppins {
  font-family: 'Poppins', sans-serif;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Estilo para el foco en las pestañas (accesibilidad) */
button[role="tab"]:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  z-index: 10;
}

/* Transiciones suaves para la línea indicadora */
button[role="tab"] > span {
  transition: background-color 0.3s ease;
}

/* Ajustes para las flechas */
button[aria-label^="Desplazar pestañas"] {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Estilos del loader */
.loader {
  width: 70px;
  height: 70px;
  border: 8px solid #e5e7eb;
  border-top: 8px solid transparent;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #4f46e5, #7c3aed, #4f46e5);
  animation: spin 1.2s ease-in-out infinite;
  position: relative;
}

.loader::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50px;
  height: 50px;
  background: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>