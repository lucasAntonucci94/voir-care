<template>
    <div
      class="bg-white dark:bg-gray-700 rounded-2xl shadow-md overflow-hidden w-full max-w-sm border border-gray-200 dark:border-gray-700 transition-transform duration-300 hover:shadow-xl cursor-pointer"
      @click="goToDetail"
    >
      <!-- Media -->
      <div class="relative h-40 w-full">
        <img
          v-if="group.media?.url"
          :src="group.media.url"
          :alt="group.title"
          class="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />
        <div
          v-else
          class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400"
        >
          <i class="fas fa-image text-3xl"></i>
        </div>
        <span
          class="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold text-white rounded-full shadow-sm"
          :class="group.privacy === 'public' ? 'bg-green-500' : 'bg-red-500'"
        >
          {{ group.privacy === 'public' ? 'Público' : 'Privado' }}
        </span>
      </div>
  
      <!-- Contenido -->
      <div class="p-5 space-y-3 text-sm text-gray-800 dark:text-gray-200">
        <div class="flex justify-between items-start">
          <h3 class="text-lg font-semibold truncate">{{ group.title }}</h3>
          <button
            v-if="isAdmin(group)"
            class="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            @click.stop="handleDelete"
          >
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
          {{ group.description || 'Sin descripción' }}
        </p>
        <div class="flex gap-2">
          <span
            class="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <i class="fas fa-users text-primary dark:text-secondary"></i>
            {{ group.members?.length || 0 }} {{ group.members?.length === 1 ? 'miembro' : 'miembros' }}
          </span>
          <span
            class="px-2 py-1 text-xs font-medium rounded-full"
            :class="{
              'bg-primary text-white dark:bg-secondary': roleLabel(group) === 'Administrador',
              'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300': roleLabel(group) === 'Miembro'
            }"
          >
            {{ roleLabel(group) }}
          </span>
        </div>
      </div>
  
      <!-- Acciones -->
      <div class="p-5 pt-0 flex justify-end items-center">
        <button
          v-if="!isAdmin(group)"
          @click.stop="toggleMembership"
          class="px-4 py-2 text-white rounded-md shadow-sm focus:outline-none transition-colors duration-200 flex items-center gap-2"
          :class="isMember ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'"
        >
          <i
            :class="isMember ? 'fas fa-check-circle' : 'fas fa-plus-circle'"
            class="text-white text-sm"
          ></i>
          {{ isMember ? 'Salir del grupo' : 'Unirme al grupo' }}
        </button>
        <button
          v-if="isAdmin(group)"
          class="px-4 py-2 text-sm bg-primary dark:bg-secondary text-white rounded hover:bg-primary-md dark:hover:bg-secondary-md transition"
          @click.stop="editGroup(group)"
        >
          Editar
        </button>
      </div>
  
    </div>
    <!-- Modal de confirmación de eliminación -->
    <GenericConfirmModal
      v-if="showDeleteModal"
      :visible="showDeleteModal"
      title="¿Eliminar grupo?"
      message="Esta acción no se puede deshacer. ¿Estás seguro de que quieres continuar?"
      confirmButtonText="Eliminar"
      cancelButtonText="Cancelar"
      @cancel="closeDeleteModal"
      @confirmed="confirmDelete"
      />
      
      <!-- Modal de edición de grupo -->
      <EditGroupModal
        v-if="showEditModal"
        :visible="showEditModal"
        :group="groupToEdit"
        @close="closeEditModal"
        @groupUpdated="handleGroupUpdated"
      />
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuth } from '../../api/auth/useAuth'
  import { useGroupsStore } from '../../stores/groups'
  import GenericConfirmModal from '../../components/molecules/GenericConfirmModal.vue'
  import EditGroupModal from './EditGroupModal.vue'

  const props = defineProps({
    group: {
      type: Object,
      required: true
    }
  })
  
  const router = useRouter()
  const { user } = useAuth()
  const groupsStore = useGroupsStore()
  const showDeleteModal = ref(false)
  const showEditModal = ref(false)
  const groupToEdit = ref(null)
  
  function goToDetail() {
    router.push({ name: 'groupDetail', params: { idGroup: props.group.idDoc } })
  }
  
  function isAdmin(group) {
    return group.ownerId === user.value?.uid || user.value?.isAdmin
  }

  const isMember = computed(() => props.group.members?.includes(user.value?.uid))
  
  function roleLabel(group) {
    if (group.ownerId === user.value?.uid || group.admins?.includes(user.value?.uid)) return 'Administrador'
    return 'Miembro'
  }
  
  function handleDelete() {
    showDeleteModal.value = true
    document.body.style.overflow = 'hidden'
  }
  
  function closeDeleteModal() {
    showDeleteModal.value = false
    document.body.style.overflow = ''
  }
  
  async function confirmDelete() {
    try {
      await groupsStore.deleteGroup(props.group.idDoc)
      console.log(`Grupo ${props.group.idDoc} eliminado`)
    } catch (error) {
      console.error('Error al eliminar grupo:', error)
    }
    closeDeleteModal()
  }

  // Funciones para modal de edicion
  function editGroup(group) {
    // Suponemos que `group` ya tiene todos los datos completos
    groupToEdit.value = group
    showEditModal.value = true
  }

  function closeEditModal() {
    showEditModal.value = false
    groupToEdit.value = null
  }

  function handleGroupUpdated(updatedGroup) {
    // Podés hacer algo con los datos actualizados si querés (e.g. actualizar en el array de grupos)
    closeEditModal()
  }

  // Funcion toggle para gestion la suscripcion al grupo
  async function toggleMembership() {
    const groupId = props.group.idDoc
    const userId = user.value?.uid
    try {
      if (isMember.value) {
        await groupsStore.leaveGroup(groupId, userId)
        // Reflejar el cambio localmente
        // props.group.members = props.group.members.filter(id => id !== userId)
      } else {
        await groupsStore.joinGroup(groupId, userId)
        // Reflejar el cambio localmente
        // props.group.members.push(userId)
      }
    } catch (err) {
      console.error('Error al cambiar la membresía del grupo:', err)
    }
  }
  </script>
  
  <style scoped>
  /* Ajustar el diseño del card */
  .rounded-2xl {
    border-radius: 1rem;
  }
  
  .shadow-md {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .shadow-xl {
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.15);
  }
  
  /* Mejorar el texto */
  .text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
  
  .text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
  
  .leading-relaxed {
    line-height: 1.625;
  }
  
  /* Estilo para el badge de privacidad */
  .rounded-full {
    font-size: 0.75rem;
    line-height: 1rem;
  }
  </style>