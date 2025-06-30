import { jsonBlogs } from '../data/blogs.js'

/**
 * Simula una llamada a una API para obtener blogs
 * @returns {Promise<Blog[]>}
 */
export const fetchBlogs = async () => {
  // Simulación de retardo de red
  return new Promise((resolve) => {
    setTimeout(() => resolve(jsonBlogs.value), 50)
  })
}

/**
 * Obtiene categorías únicas
 * @returns {Promise<string[]>}
 */
export const fetchCategories = async () => {
  const blogsData = await fetchBlogs()
  const categories = new Set()
  blogsData.forEach(blog => blog.categories.forEach(cat => categories.add(cat)))
  return ['Todos', ...categories]
}