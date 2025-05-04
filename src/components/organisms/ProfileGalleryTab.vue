<template>
    <div class="block bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mx-auto max-w-lg md:max-w-4xl">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Galería</h2>
  
      <!-- Subtabs -->
      <div class="flex gap-2 mb-4">
        <button
          v-for="subtab in subtabs"
          :key="subtab"
          @click="setSubtab(subtab.toLowerCase())"
          :class="[
            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200',
            activeSubtab === subtab.toLowerCase()
              ? 'bg-primary hover:bg-primary-md dark:bg-secondary dark:hover:bg-secondary-md text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          {{ subtab }}
        </button>
      </div>
  
      <!-- Filters -->
      <div class="flex gap-4 mb-4 flex-col sm:flex-row">
        <div class="flex-1">
          <label for="media-type-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo de Medio
          </label>
          <select
            id="media-type-filter"
            v-model="mediaTypeFilter"
            class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
          >
            <option value="all">Todos</option>
            <option value="image">Imágenes</option>
            <option value="video">Videos</option>
          </select>
        </div>
        <div class="flex-1">
          <label for="content-type-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo de Contenido
          </label>
          <select
            id="content-type-filter"
            v-model="contentTypeFilter"
            class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary"
          >
            <option value="all">Todos</option>
            <option value="posts">Publicaciones</option>
            <option value="reels">Reels</option>
          </select>
        </div>
      </div>
  
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-6">
        <div class="text-center">
          <img src="../assets/loaders/pawOrange.gif" alt="Loading" class="w-16 h-16 mx-auto" />
          <p class="text-primary dark:text-secondary text-sm font-medium animate-pulse">Cargando medios...</p>
        </div>
      </div>
  
      <!-- Content -->
      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div
            v-for="item in filteredMedia"
            :key="item.id"
            class="relative aspect-square overflow-hidden rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            @click="openModal(item.media)"
          >
            <img
              :src="item.media.type === 'image' ? item.media.url : (videoThumbnails[item.id] || defaultVideoThumbnail)"
              :alt="item.title || (item.media.type === 'image' ? `${item.source} image` : `${item.source} video thumbnail`)"
              class="w-full h-full object-cover"
              loading="lazy"
              @error="handleImageError"
            />
            <!-- Play icon for videos -->
            <div
              v-if="item.media.type === 'video'"
              class="absolute inset-0 flex items-center justify-center bg-black/30"
            >
              <i class="fa-solid fa-play text-white text-2xl"></i>
            </div>
          </div>
          <p v-if="!filteredMedia.length" class="text-center text-gray-500 col-span-full py-6">
            No hay medios disponibles para los filtros seleccionados.
          </p>
        </div>
      </div>
  
      <!-- Media Modal -->
      <MediaModalViewer
        :visible="showModal"
        :media="selectedMedia"
        @close="closeModal"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { usePostsStore } from '../../stores/posts';
  import MediaModalViewer from '../molecules/MediaViewerModal.vue';
  import DefaultImage from '../../assets/avatar1.jpg';
  
  // Subtabs
  const subtabs = ['All', 'Posts', 'Reels'];
  const activeSubtab = ref('all');
  
  // Filters
  const mediaTypeFilter = ref('all'); // all, image, video
  const contentTypeFilter = ref('all'); // all, posts, reels
  
  // Pinia store
  const postsStore = usePostsStore();
  
  // Default video thumbnail
  const defaultVideoThumbnail = DefaultImage;
  
  // Cache for video thumbnails
  const videoThumbnails = ref({});
  
  // Mock reels data (placeholder with image and video support)
  const mockReels = ref([
    {
      id: 'reel1',
      title: 'Reel 1',
      media: { url: DefaultImage, type: 'image' },
      source: 'reel',
    },
    {
      id: 'reel2',
      title: 'Reel 2',
      media: {
        url: 'https://firebasestorage.googleapis.com/v0/b/voir-432421.firebasestorage.app/o/sample%2Fsample-video.mp4?alt=media&token=...',
        type: 'video',
      },
      source: 'reel',
    },
  ]);
  
  // Combined and filtered media
  const filteredMedia = computed(() => {
    // Combine posts and reels
    const posts = postsStore.profilePosts.value
      .filter(post => 
        post.media && 
        ['image', 'video'].includes(post.media.type) && 
        post.media.url && 
        typeof post.media.url === 'string' && 
        post.media.url.startsWith('https://firebasestorage.googleapis.com')
      )
      .map(post => ({
        id: post.id,
        title: post.title,
        media: post.media,
        source: 'posts',
      }));
  
    const reels = mockReels.value.map(reel => ({
      id: reel.id,
      title: reel.title,
      media: reel.media,
      source: 'reels',
    }));
  
    let combined = [...posts, ...reels];
    // Apply content type filter
    if (contentTypeFilter.value !== 'all') {
      combined = combined.filter(item => item.source === contentTypeFilter.value);
    }
  
    // Apply media type filter
    if (mediaTypeFilter.value !== 'all') {
      combined = combined.filter(item => item.media.type === mediaTypeFilter.value);
    }
  
    return combined;
  });
  
  // Modal state
  const showModal = ref(false);
  const selectedMedia = ref({ src: '', type: 'image' });
  
  // Loading state
  const isLoading = ref(true);
  
  // Handle image loading errors
  const handleImageError = (event) => {
    event.target.src = DefaultImage;
  };
  
  // Generate video thumbnail
  const generateVideoThumbnail = async (videoUrl, itemId) => {
    if (videoThumbnails.value[itemId]) {
      return videoThumbnails.value[itemId]; // Return cached thumbnail
    }
  
    console.debug(`Generating thumbnail for item ${itemId}, URL: ${videoUrl}`);
  
    try {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous'; // Handle CORS
      video.src = videoUrl;
      video.muted = true; // Avoid permission issues
  
      // Test URL accessibility
      const response = await fetch(videoUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`URL inaccessible, status: ${response.status}`);
      }
  
      // Wait for video to load metadata
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          console.debug(`Metadata loaded for item ${itemId}: duration=${video.duration}`);
          resolve();
        };
        video.onerror = () => {
          console.error(`Failed to load video metadata for item ${itemId}: URL=${videoUrl}`);
          reject(new Error('Failed to load video metadata'));
        };
      });
  
      // Seek to 1 second (or video duration if shorter)
      const seekTime = Math.min(1, video.duration || 1);
      video.currentTime = seekTime;
  
      // Wait for seek to complete
      await new Promise((resolve, reject) => {
        video.onseeked = () => {
          console.debug(`Seeked to ${seekTime}s for item ${itemId}`);
          resolve();
        };
        video.onerror = () => reject(new Error('Failed to seek video'));
        video.onloadeddata = () => {
          // Ensure video frame is ready
          resolve();
        };
      });
  
      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
      // Convert to data URL
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      videoThumbnails.value[itemId] = thumbnail;
      console.debug(`Thumbnail generated for item ${itemId}`);
      return thumbnail;
    } catch (error) {
      console.error(`Failed to generate thumbnail for item ${itemId}:`, error.message, { url: videoUrl });
      videoThumbnails.value[itemId] = defaultVideoThumbnail;
      return defaultVideoThumbnail;
    }
  };
  
  // Modal functions
  const openModal = (media) => {
    selectedMedia.value = { src: media.url, type: media.type };
    showModal.value = true;
    document.body.style.overflow = 'hidden';
  };
  
  const closeModal = () => {
    showModal.value = false;
    selectedMedia.value = { src: '', type: 'image' };
    document.body.style.overflow = '';
  };
  
  // Sync subtab with content type filter
  const setSubtab = (subtab) => {
    activeSubtab.value = subtab;
    contentTypeFilter.value = subtab;
  };
  
  // Generate thumbnails on mount
  onMounted(async () => {
    console.debug('Mounted GalleryTab, checking posts:', postsStore.profilePosts.value.length);
    // Assume posts are loaded via Profile.vue's subscribeProfile
    setTimeout(async () => {
      // Generate thumbnails for video items
      // for (const item of filteredMedia.value) {
      //   if (item.media.type === 'video') {
      //     await generateVideoThumbnail(item.media.url, item.id);
      //   }
      // }
      isLoading.value = false;
      console.debug('Thumbnails generated, loading complete');
    }, 500); // Adjust delay if needed
  });
  </script>
  
  <style scoped>
  .font-poppins {
    font-family: 'Poppins', sans-serif;
  }
  
  /* Ensure grid responsiveness */
  @media (max-width: 640px) {
    .max-w-4xl {
      max-width: 100%;
    }
    .grid {
      grid-template-columns: 1fr;
    }
  }
  
  @media (min-width: 640px) and (max-width: 768px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  /* Select box styling */
  select {
    appearance: none;
    background-image: url("data:image/svg+xml;utf8,<svg fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'><path d='M7 7l3-3 3 3m0 6l-3 3-3-3'></path></svg>");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1em;
  }
  </style>