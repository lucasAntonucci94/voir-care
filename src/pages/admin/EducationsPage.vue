<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Administración de Blogs</h1>
      <div class="flex gap-4">
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2"
          aria-label="Crear nuevo blog"
        >
          <i class="fas fa-plus"></i> Nuevo Blog
        </button>
        <button
          @click="blogsStore.migrateBlogs"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          aria-label="Migrar blogs desde JSON"
        >
          Migrar JSON
        </button>
      </div>
    </div>

    <!-- Loading and Error States -->
    <div v-if="blogsStore.isLoading" class="text-center text-gray-600 dark:text-gray-300">
      <i class="fas fa-spinner fa-spin mr-2"></i> Cargando blogs...
    </div>
    <div v-else-if="blogsStore.error" class="text-center text-red-500 dark:text-red-400">
      Error: {{ blogsStore.error }}
    </div>
    <div v-else>
      <!-- Search and Filters -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por título o introducción..."
          class="w-full sm:w-1/3 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Buscar blogs"
        />
        <div class="relative">
          <button
            @click="showCategoryFilter = !showCategoryFilter"
            class="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-full text-left"
            aria-label="Filtrar por categorías"
          >
            {{ selectedCategories.length ? `Categorías: ${selectedCategories.join(', ')}` : 'Filtrar por categorías' }}
          </button>
          <div
            v-if="showCategoryFilter"
            class="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg p-4"
          >
            <label v-for="category in uniqueCategories" :key="category" class="flex items-center">
              <input
                type="checkbox"
                v-model="selectedCategories"
                :value="category"
                class="mr-2"
                @change="showCategoryFilter = false"
              />
              {{ category }}
            </label>
          </div>
        </div>
        <select
          v-model="filterType"
          class="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          aria-label="Filtrar por tipo"
        >
          <option value="">Filtrar por tipo</option>
          <option v-for="type in uniqueTypes" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>

      <!-- Blogs Table -->
      <div v-if="filteredBlogs.length" class="overflow-x-auto">
        <table class="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr class="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200 uppercase text-sm leading-normal">
              <th class="py-3 px-6 text-left">Título</th>
              <th class="py-3 px-6 text-left">Fecha</th>
              <th class="py-3 px-6 text-left">Categorías</th>
              <th class="py-3 px-6 text-center">Tipo</th>
              <th class="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 dark:text-gray-300 text-sm font-light">
            <tr
              v-for="blog in filteredBlogs"
              :key="blog.id"
              class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <td class="py-3 px-6 text-left whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    :src="blog.image"
                    alt="Blog Image"
                    class="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  <span>{{ blog.title || 'Sin título' }}</span>
                </div>
              </td>
              <td class="py-3 px-6 text-left">{{ blog.date || 'N/A' }}</td>
              <td class="py-3 px-6 text-left">{{ blog.categories?.join(', ') || 'N/A' }}</td>
              <td class="py-3 px-6 text-center">{{ blog.type || 'N/A' }}</td>
              <td class="py-3 px-6 text-center">
                <div class="flex item-center justify-center gap-2">
                  <button
                    @click="openPreviewModal(blog)"
                    class="text-green-500 hover:text-green-700"
                    title="Vista previa"
                    aria-label="Vista previa del blog"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    @click="openEditModal(blog)"
                    class="text-blue-500 hover:text-blue-700"
                    title="Editar"
                    aria-label="Editar blog"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="deleteBlog(blog.id)"
                    class="text-red-500 hover:text-red-700"
                    title="Eliminar"
                    aria-label="Eliminar blog"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-600 dark:text-gray-300">
        No se encontraron blogs con los filtros aplicados.
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">
            {{ isEditing ? 'Editar Blog' : 'Crear Blog' }}
          </h3>
          <button
            @click="closeModal"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
            aria-label="Cerrar modal"
          >
            <i class="fa-solid fa-xmark w-6 h-6"></i>
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="p-6">
          <div class="flex justify-center mb-6">
            <div class="flex items-center space-x-2">
              <div v-for="(step, index) in steps" :key="index" class="relative flex items-center">
                <div
                  class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all duration-300"
                  :class="{
                    'bg-primary dark:bg-secondary text-white animate-pulse-step': currentStep === index + 1,
                    'bg-primary text-white': currentStep > index + 1,
                    'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300': currentStep < index + 1,
                  }"
                  :aria-current="currentStep === index + 1 ? 'step' : undefined"
                  :aria-label="`Paso ${index + 1}`"
                >
                  <span v-if="currentStep <= index + 1">{{ index + 1 }}</span>
                  <i v-else class="fa-solid fa-check"></i>
                </div>
                <div
                  v-if="index < steps.length - 1"
                  class="w-6 h-1 bg-gray-200 dark:bg-gray-600"
                >
                  <div
                    class="h-full transition-all duration-300"
                    :class="currentStep > index + 1 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Content -->
          <form @submit.prevent="handleSaveBlog" class="space-y-6">
            <!-- Step 1: Basic Info -->
            <div v-if="currentStep === 1">
              <div>
                <label for="blogTitle" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Título
                </label>
                <input
                  v-model="newBlog.title"
                  id="blogTitle"
                  type="text"
                  placeholder="Ej: Cómo cuidar a tu perro"
                  class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                  :disabled="isLoading"
                  required
                />
                <p v-if="formErrors.title" class="text-sm text-red-500 mt-1">{{ formErrors.title }}</p>
              </div>
              <div class="mt-4">
                <label for="blogDate" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Fecha
                </label>
                <input
                  v-model="newBlog.date"
                  id="blogDate"
                  type="text"
                  placeholder="Ej: 12 de Marzo de 2025"
                  class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                  :disabled="isLoading"
                  required
                />
                <p v-if="formErrors.date" class="text-sm text-red-500 mt-1">{{ formErrors.date }}</p>
              </div>
              <div class="mt-4">
                <label for="blogIntro" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Introducción
                </label>
                <textarea
                  v-model="newBlog.intro"
                  id="blogIntro"
                  placeholder="Ej: Una breve introducción al tema del blog..."
                  class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                  :disabled="isLoading"
                  required
                ></textarea>
                <p v-if="formErrors.intro" class="text-sm text-red-500 mt-1">{{ formErrors.intro }}</p>
              </div>
              <div class="mt-4">
                <label for="blogCategories" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Categorías (separadas por comas)
                </label>
                <input
                  v-model="categoriesInput"
                  id="blogCategories"
                  type="text"
                  placeholder="Ej: Salud, Perros"
                  class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                  :disabled="isLoading"
                />
                <p v-if="formErrors.categories" class="text-sm text-red-500 mt-1">{{ formErrors.categories }}</p>
              </div>
              <div class="mt-4">
                <label for="blogType" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Tipo
                </label>
                <input
                  v-model="newBlog.type"
                  id="blogType"
                  type="text"
                  placeholder="Ej: Consejos"
                  class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                  :disabled="isLoading"
                  required
                />
                <p v-if="formErrors.type" class="text-sm text-red-500 mt-1">{{ formErrors.type }}</p>
              </div>
              <div class="mt-4">
                <label for="blogSummary" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Resumen
                </label>
                <textarea
                  v-model="newBlog.summary"
                  id="blogSummary"
                  placeholder="Ej: Un resumen breve del contenido..."
                  class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                  :disabled="isLoading"
                  required
                ></textarea>
                <p v-if="formErrors.summary" class="text-sm text-red-500 mt-1">{{ formErrors.summary }}</p>
              </div>
            </div>

            <!-- Step 2: Sections -->
            <div v-if="currentStep === 2">
              <div class="space-y-4">
                <div v-for="(section, index) in newBlog.sections" :key="index" class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div class="flex justify-between items-center mb-2">
                    <h4 class="text-sm font-medium text-gray-700 dark:text-gray-200">Sección {{ index + 1 }}</h4>
                    <button
                      type="button"
                      @click="newBlog.sections.splice(index, 1)"
                      class="text-red-500 hover:text-red-700"
                      aria-label="Eliminar sección"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                  <div>
                    <label :for="`sectionTitle${index}`" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                      Título de la sección
                    </label>
                    <input
                      v-model="section.title"
                      :id="`sectionTitle${index}`"
                      type="text"
                      placeholder="Ej: Introducción al cuidado"
                      class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                      :disabled="isLoading"
                    />
                    <p v-if="formErrors[`section${index}Title`]" class="text-sm text-red-500 mt-1">{{ formErrors[`section${index}Title`] }}</p>
                  </div>
                  <div class="mt-2">
                    <label :for="`sectionText${index}`" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                      Texto
                    </label>
                    <textarea
                      v-model="section.text"
                      :id="`sectionText${index}`"
                      placeholder="Ej: Detalles de la sección..."
                      class="w-full p-3 border hover:bg-gray-100 border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-secondary bg-gray-50 text-gray-700 placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                      :disabled="isLoading"
                    ></textarea>
                    <p v-if="formErrors[`section${index}Text`]" class="text-sm text-red-500 mt-1">{{ formErrors[`section${index}Text`] }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="newBlog.sections.push({ title: '', text: '', image: '', imageFile: null })"
                  class="w-full p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  :disabled="isLoading"
                  aria-label="Agregar sección"
                >
                  Agregar Sección
                </button>
              </div>
            </div>

            <!-- Step 3: Images -->
            <div v-if="currentStep === 3">
              <div>
                <label for="blogImage" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Imagen Principal
                </label>
                <input
                  id="blogImage"
                  type="file"
                  accept="image/*"
                  @change="handleImageUpload"
                  :disabled="isLoading"
                  class="w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200"
                />
                <p v-if="formErrors.image" class="text-sm text-red-500 mt-1">{{ formErrors.image }}</p>
                <img
                  v-if="newBlog.imagePreview || newBlog.image"
                  :src="newBlog.imagePreview || newBlog.image"
                  alt="Main Image Preview"
                  class="w-full h-48 object-cover rounded-lg shadow-sm mt-2"
                />
              </div>
              <div class="mt-4 space-y-4">
                <div v-for="(section, index) in newBlog.sections" :key="index">
                  <label :for="`sectionImage${index}`" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                    Imagen de la sección {{ index + 1 }}
                  </label>
                  <input
                    :id="`sectionImage${index}`"
                    type="file"
                    accept="image/*"
                    @change="handleSectionImageUpload(index, $event)"
                    :disabled="isLoading"
                    class="w-full p-2 border dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary dark:file:bg-secondary file:text-white hover:file:bg-opacity-90 transition-colors duration-200"
                  />
                  <p v-if="formErrors[`section${index}Image`]" class="text-sm text-red-500 mt-1">{{ formErrors[`section${index}Image`] }}</p>
                  <img
                    v-if="section.imagePreview || section.image"
                    :src="section.imagePreview || section.image"
                    :alt="`Section ${index + 1} Image Preview`"
                    class="w-full h-48 object-cover rounded-lg shadow-sm mt-2"
                  />
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex justify-between gap-3 mt-6">
              <button
                v-if="currentStep > 1"
                type="button"
                @click="previousStep"
                :disabled="isLoading"
                class="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Volver al paso anterior"
              >
                <i class="fa-solid fa-arrow-left"></i>
                <p class="hidden md:block">Atrás</p>
              </button>
              <button
                v-if="currentStep === 1"
                type="button"
                @click="closeModal"
                :disabled="isLoading"
                class="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Cancelar"
              >
                <i class="fa-solid fa-times"></i>
                <p class="hidden md:block">Cancelar</p>
              </button>
              <button
                v-if="currentStep < steps.length"
                type="button"
                @click="nextStep"
                :disabled="isLoading"
                class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Siguiente paso"
              >
                <p class="hidden md:block">Siguiente</p>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
              <button
                v-if="currentStep === steps.length"
                type="submit"
                :disabled="isLoading"
                class="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:bg-primary/90 dark:hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Guardar blog"
              >
                <span v-if="isLoading">
                  <i class="fa-solid fa-spinner animate-spin"></i>
                </span>
                <p class="hidden md:block">
                  {{ isLoading ? 'Guardando...' : 'Guardar' }}
                </p>
                <i v-if="!isLoading" class="fa-solid fa-save"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <!-- Preview Modal -->
    <div
      v-if="showPreviewModal"
      class="fixed inset-0 bg-black/60 z-101 flex items-center justify-center p-4"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white dark:bg-gray-800 z-10 p-6 border-b flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-300">
            Vista previa del Blog
          </h3>
          <button
            @click="closePreviewModal"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
            aria-label="Cerrar modal de vista previa"
          >
            <i class="fa-solid fa-xmark w-6 h-6"></i>
          </button>
        </div>

        <!-- Blog Preview Content -->
        <div class="p-6 space-y-6">
          <!-- Main Image -->
          <img
            v-if="previewBlog.image"
            :src="previewBlog.image"
            :alt="previewBlog.title"
            class="w-full h-64 object-cover rounded-lg shadow-sm"
          />

          <!-- Blog Header -->
          <div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">{{ previewBlog.title || 'Sin título' }}</h2>
            <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{{ previewBlog.date || 'N/A' }}</span>
              <span v-if="previewBlog.categories?.length"> | {{ previewBlog.categories.join(', ') }}</span>
              <span v-if="previewBlog.type"> | {{ previewBlog.type }}</span>
            </div>
          </div>

          <!-- Introduction -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Introducción</h3>
            <p class="mt-2 text-gray-600 dark:text-gray-300">{{ previewBlog.intro || 'Sin introducción' }}</p>
          </div>

          <!-- Summary -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Resumen</h3>
            <p class="mt-2 text-gray-600 dark:text-gray-300">{{ previewBlog.summary || 'Sin resumen' }}</p>
          </div>

          <!-- Sections -->
          <div v-if="previewBlog.sections?.length" class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Secciones</h3>
            <div v-for="(section, index) in previewBlog.sections" :key="index" class="space-y-4">
              <h4 class="text-md font-medium text-gray-700 dark:text-gray-200">{{ section.title || `Sección ${index + 1}` }}</h4>
              <p class="text-gray-600 dark:text-gray-300">{{ section.text || 'Sin contenido' }}</p>
              <img
                v-if="section.image"
                :src="section.image"
                :alt="`Imagen de la sección ${index + 1}`"
                class="w-full h-48 object-cover rounded-lg shadow-sm"
              />
            </div>
          </div>
          <div v-else>
            <p class="text-gray-600 dark:text-gray-300">No hay secciones disponibles.</p>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-6 border-t flex justify-end">
          <button
            @click="closePreviewModal"
            class="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Cerrar vista previa"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useEducationBlogsStore } from '../../stores/educationBlogs';
import { useSnackbarStore } from '../../stores/snackbar';
import Img from '../../assets/3.png';

const blogsStore = useEducationBlogsStore();
const snackbarStore = useSnackbarStore();

const searchQuery = ref('');
const selectedCategories = ref([]);
const filterType = ref('');
const showCategoryFilter = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const currentStep = ref(1);
const formErrors = ref({});
const categoriesInput = ref('');
const showPreviewModal = ref(false);
const previewBlog = ref({});

const steps = ref([
  { label: 'Información Básica' },
  { label: 'Secciones' },
  { label: 'Imágenes' },
]);

const newBlog = ref({
  id: null,
  title: '',
  image: Img,
  imageFile: null,
  imagePreview: null,
  date: '',
  intro: '',
  categories: [],
  type: '',
  summary: '',
  sections: [],
});

// Computed properties
const filteredBlogs = computed(() => {
  let filtered = blogsStore.blogs.value || [];
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (blog) =>
        blog.title?.toLowerCase().includes(query) ||
        blog.intro?.toLowerCase().includes(query)
    );
  }

  if (selectedCategories.value.length) {
    filtered = filtered.filter((blog) =>
      selectedCategories.value.every((cat) => blog.categories?.includes(cat))
    );
  }

  if (filterType.value) {
    filtered = filtered.filter((blog) => blog.type === filterType.value);
  }

  return filtered;
});

const uniqueCategories = computed(() => {
  const categories = new Set();
  blogsStore.blogs.value.forEach((blog) => {
    blog.categories?.forEach((cat) => categories.add(cat));
  });
  return [...categories].sort();
});

const uniqueTypes = computed(() => {
  const types = new Set(blogsStore.blogs.value.map((blog) => blog.type).filter(Boolean));
  return [...types].sort();
});

// Modal handling
const openCreateModal = () => {
  resetForm();
  isEditing.value = false;
  showModal.value = true;
};

const openEditModal = async (blog) => {
  const blogData = await blogsStore.getBlogById(blog.id);
  newBlog.value = {
    id: blogData.id,
    title: blogData.title || '',
    image: blogData.image || Img,
    imageFile: null,
    imagePreview: null,
    date: blogData.date || '',
    intro: blogData.intro || '',
    categories: blogData.categories || [],
    type: blogData.type || '',
    summary: blogData.summary || '',
    sections: blogData.sections.map((section) => ({
      ...section,
      imageFile: null,
      imagePreview: null,
    })),
  };
  categoriesInput.value = blogData.categories?.join(', ') || '';
  isEditing.value = true;
  currentStep.value = 1;
  showModal.value = true;
};

const closeModal = () => {
  resetForm();
  showModal.value = false;
  currentStep.value = 1;
  formErrors.value = {};
};

const openPreviewModal = async (blog) => {
  try {
    const blogData = await blogsStore.getBlogById(blog.id);
    previewBlog.value = {
      id: blogData.id,
      title: blogData.title,
      image: blogData.image || Img,
      date: blogData.date,
      intro: blogData.intro,
      categories: blogData.categories || [],
      type: blogData.type,
      summary: blogData.summary,
      sections: blogData.sections || [],
    };
    showPreviewModal.value = true;
  } catch (error) {
    console.error('Error al cargar vista previa:', error);
    snackbarStore.show('Error al cargar vista previa: ' + error.message, 'error');
  }
};

const closePreviewModal = () => {
  showPreviewModal.value = false;
  previewBlog.value = {};
};

const resetForm = () => {
  newBlog.value = {
    id: null,
    title: '',
    image: Img,
    imageFile: null,
    imagePreview: null,
    date: new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    intro: '',
    categories: [],
    type: '',
    summary: '',
    sections: [],
  };
  categoriesInput.value = '';
};

// Form validation
const validateStep = (step) => {
  let isValid = true;
  const errors = {};

  if (step === 1) {
    if (!newBlog.value.title || newBlog.value.title.trim() === '') {
      errors.title = 'El título es obligatorio';
      isValid = false;
    }
    if (!newBlog.value.date || newBlog.value.date.trim() === '') {
      errors.date = 'La fecha es obligatoria';
      isValid = false;
    }
    if (!newBlog.value.intro || newBlog.value.intro.trim() === '') {
      errors.intro = 'La introducción es obligatoria';
      isValid = false;
    }
    if (!newBlog.value.type || newBlog.value.type.trim() === '') {
      errors.type = 'El tipo es obligatorio';
      isValid = false;
    }
    if (!newBlog.value.summary || newBlog.value.summary.trim() === '') {
      errors.summary = 'El resumen es obligatorio';
      isValid = false;
    }
  } else if (step === 2) {
    newBlog.value.sections.forEach((section, index) => {
      if (!section.title || section.title.trim() === '') {
        errors[`section${index}Title`] = 'El título de la sección es obligatorio';
        isValid = false;
      }
      if (!section.text || section.text.trim() === '') {
        errors[`section${index}Text`] = 'El texto de la sección es obligatorio';
        isValid = false;
      }
    });
  } else if (step === 3) {
    if (!isEditing.value && !newBlog.value.imageFile && !newBlog.value.image) {
      errors.image = 'La imagen principal es obligatoria';
      isValid = false;
    }
  }

  formErrors.value = errors;
  return isValid;
};

const nextStep = () => {
  if (validateStep(currentStep.value)) {
    currentStep.value += 1;
  }
};

const previousStep = () => {
  currentStep.value -= 1;
};

// Handle image upload
const handleImageUpload = (event) => {
  formErrors.value.image = '';
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    formErrors.value.image = 'El archivo debe ser una imagen';
    event.target.value = null;
    return;
  }
  const reader = new FileReader();
  reader.onloadend = () => {
    newBlog.value.imageFile = file;
    newBlog.value.imagePreview = URL.createObjectURL(file);
  };
  reader.onerror = (error) => {
    console.error('Error al leer la imagen:', error);
    formErrors.value.image = 'Error al leer la imagen';
    event.target.value = null;
  };
  reader.readAsDataURL(file);
};

// Handle section image upload
const handleSectionImageUpload = (index, event) => {
  formErrors.value[`section${index}Image`] = '';
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    formErrors.value[`section${index}Image`] = 'El archivo debe ser una imagen';
    event.target.value = null;
    return;
  }
  const reader = new FileReader();
  reader.onloadend = () => {
    newBlog.value.sections[index].imageFile = file;
    newBlog.value.sections[index].imagePreview = URL.createObjectURL(file);
  };
  reader.onerror = (error) => {
    console.error('Error al leer la imagen:', error);
    formErrors.value[`section${index}Image`] = 'Error al leer la imagen';
    event.target.value = null;
  };
  reader.readAsDataURL(file);
};

// Save blog
const handleSaveBlog = async () => {
  isLoading.value = true;
  try {
    for (let i = 1; i <= steps.value.length; i++) {
      if (!validateStep(i)) {
        currentStep.value = i;
        return;
      }
    }

    const blogData = {
      ...newBlog.value,
      categories: categoriesInput.value
        .split(',')
        .map((cat) => cat.trim())
        .filter(Boolean),
    };
    debugger
    if (isEditing.value) {
      await blogsStore.updateBlog(newBlog.value.id, blogData);
    } else {
      await blogsStore.addBlog(blogData);
    }
    closeModal();
  } catch (error) {
    console.error('Error al guardar blog:', error);
  } finally {
    isLoading.value = false;
  }
};

// Delete blog
const deleteBlog = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este blog?')) return;
  isLoading.value = true;
  try {
    await blogsStore.deleteBlog(id);
  } catch (error) {
    console.error('Error al eliminar blog:', error);
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  blogsStore.subscribeToBlogs();
});

onUnmounted(() => {
  blogsStore.unsubscribeFromBlogs();
});
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(155, 155, 155, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.animate-pulse-step {
  animation: pulseStep 0.5s ease-in-out;
}

@keyframes pulseStep {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 0 8px rgba(0, 0, 0, 0.1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}

table {
  border-collapse: separate;
  border-spacing: 0;
}

th,
td {
  border-right: 1px solid #e5e7eb;
}

th:last-child,
td:last-child {
  border-right: none;
}

button i {
  font-size: 1.25rem;
}

.bg-primary {
  background-color: #3b82f6;
}

.bg-primary:hover {
  background-color: #2563eb;
}

.bg-secondary {
  background-color: #60a5fa;
}

.bg-secondary:hover {
  background-color: #3b82f6;
}
</style>