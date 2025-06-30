import { ref, computed } from 'vue'
import { fetchBlogs, fetchCategories } from '../api/blogs.js'

export function useBlogs() {
  const blogs = ref([])
  const categories = ref([])
  const selectedFilter = ref('Todos')
  const searchQuery = ref('')
  const loading = ref(false)
  const error = ref(null)

  // Cargar datos iniciales
  const loadData = async () => {
    try {
      loading.value = true
      blogs.value = await fetchBlogs()
      categories.value = await fetchCategories()
    } catch (err) {
      error.value = 'Error al cargar los blogs'
    } finally {
      loading.value = false
    }
  }

  // Blogs filtrados por categoría y búsqueda
  const filteredBlogs = computed(() => {
    let result = blogs.value

    // Filtro por categoría
    if (selectedFilter.value !== 'Todos') {
      result = result.filter(blog => blog.categories.includes(selectedFilter.value))
    }

    // Filtro por búsqueda
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(blog =>
        blog.title.toLowerCase().includes(query) ||
        blog.intro.toLowerCase().includes(query) ||
        blog.summary.toLowerCase().includes(query)
      )
    }

    return result
  })

  return {
    blogs,
    categories,
    selectedFilter,
    searchQuery,
    filteredBlogs,
    loading,
    error,
    loadData
  }
}