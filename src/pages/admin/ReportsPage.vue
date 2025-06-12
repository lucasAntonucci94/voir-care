<template>
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">Reportes de la Comunidad</h1>
  
      <!-- Tabs para tipo de reporte -->
      <div class="mb-6 flex gap-4">
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition"
          :class="activeTab === 'posts' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'"
          @click="activeTab = 'posts'"
        >
          Posteos Reportados
        </button>
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition"
          :class="activeTab === 'users' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'"
          @click="activeTab = 'users'"
        >
          Usuarios Reportados
        </button>
      </div>
  
      <div class="overflow-x-auto rounded-lg shadow-sm">
        <table class="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <thead>
            <tr class="bg-gray-100 dark:bg-gray-700 text-left text-gray-600 dark:text-gray-200 text-sm">
              <th class="px-4 py-3 border-b dark:border-gray-600">#</th>
              <th class="px-4 py-3 border-b dark:border-gray-600">Motivo</th>
              <th class="px-4 py-3 border-b dark:border-gray-600">Fecha</th>
              <th class="px-4 py-3 border-b dark:border-gray-600">{{activeTab === 'posts' ? 'ID Post' : 'ID Usuario'}}</th>
              <th class="px-4 py-3 border-b dark:border-gray-600">Estado</th>
              <th class="px-4 py-3 border-b dark:border-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(report, index) in filteredReports" :key="report.reportId" class="text-sm text-gray-700 dark:text-gray-300">
              <td class="px-4 py-3 border-b dark:border-gray-700">{{ index + 1 }}</td>
              <td class="px-4 py-3 border-b dark:border-gray-700">{{ report.reason }}</td>
              <td class="px-4 py-3 border-b dark:border-gray-700">{{ formatDate(report.created_at) }}</td>
              <td class="px-4 py-3 border-b dark:border-gray-700">{{ activeTab === 'posts' ? report.postId : report.userReportedId }}</td>
              <td class="px-4 py-3 border-b dark:border-gray-700">
                <span class="inline-block px-2 py-1 rounded text-xs font-semibold"
                  :class="statusColor(report.status)">{{ report.status }}</span>
              </td>
              <td class="px-4 py-3 border-b dark:border-gray-700">
                <button class="text-blue-600 hover:underline mr-2" @click="viewDetails(report)">
                  Ver
                </button>
                <button class="text-red-600 hover:underline" @click="takeAction(report)">
                  Accionar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const activeTab = ref('posts')
  
  // Simulación de reportes
  const reports = ref([
    {
      reportId: 'r1',
      postId: 'p123',
      reason: 'Contenido ofensivo',
      created_at: new Date(),
      status: 'pending',
      userId: 'userA'
    },
    {
      reportId: 'r2',
      userReportedId: 'userB',
      reason: 'Conducta inapropiada',
      created_at: new Date(),
      status: 'completed',
      userId: 'userX'
    }
  ])
  
  const filteredReports = computed(() => {
    return reports.value.filter(r => activeTab.value === 'posts' ? r.postId : r.userReportedId)
  })
  
  function formatDate(date) {
    return new Date(date).toLocaleDateString()
  }
  
  function statusColor(status) {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  }
  
  function viewDetails(report) {
    // console.log('Ver detalles del reporte:', report)
  }
  
  function takeAction(report) {
    // console.log('Tomar acción sobre el reporte:', report)
  }
  </script>
  
  <style scoped>
  </style>
  