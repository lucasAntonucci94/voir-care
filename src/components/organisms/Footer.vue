<template>
  <footer class="dosis-font bg-primary dark:bg-secondary text-white py-6">
    <div class="container mx-auto px-4 text-center">
      <!-- Social Media Links -->
      <div class="flex justify-center space-x-6 mb-4">
        <a
          href="https://www.facebook.com/profile.php?id=61577842923197"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visita nuestro perfil de Facebook"
          class="hover:text-primary-md dark:hover:text-secondary-md transition-colors duration-300"
        >
          <i class="fab fa-facebook-f fa-lg"></i>
        </a>
        <a
          href="https://www.instagram.com/voir.arg/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visita nuestro perfil de Instagram"
          class="hover:text-primary-md dark:hover:text-secondary-md transition-colors duration-300"
        >
          <i class="fab fa-instagram fa-lg"></i>
        </a>
      </div>
      <!-- Copyright and Links -->
      <p class="text-sm mb-2">VOIR - 2025. Todos los derechos reservados.</p>
      <ul class="flex justify-center space-x-4 text-sm">
        <li>
          <a
            href="/terms-of-use"
            class="text-white hover:text-gray-200 transition-colors duration-300"
          >
            Términos de servicio
          </a>
        </li>
        <li>
          <a
            href="/privacy-policy"
            class="text-white hover:text-gray-200 transition-colors duration-300"
          >
            Política de privacidad
          </a>
        </li>
      </ul>
    </div>
  </footer>
</template>

<style scoped>
/* Additional custom styles */
footer {
  font-family: 'Arial', sans-serif;
}

@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  ul {
    flex-direction: column;
  }
}
</style>