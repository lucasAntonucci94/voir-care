<template>
  <div>
    <!-- Contenedor principal del card -->
    <div
      class="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden w-full max-w-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col h-full transition transition-transform hover:scale-101"
      @click="goToDetail"
    >
      <!-- Media -->
      <div class="relative h-40 w-full">
        <img
          v-if="group.media?.url && group?.media.type === 'image'"
          :src="group.media.url"
          :alt="group.title"
          class="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />
        <video
          v-else-if="group.media?.url && group?.media.type === 'video'"
          :src="group?.media?.url"
          class="w-full h-full object-cover"
          autoplay
          loop
          muted
        />
        <div
          v-else
          class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500"
        >
          <i class="fas fa-image text-3xl"></i>
        </div>
        <!-- Badge de privacidad -->
        <span
          class="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold text-white rounded-full shadow-sm"
          :class="group.privacy === 'public' ? 'bg-green-500' : 'bg-red-500'"
        >
          {{ group.privacy === 'public' ? 'Público' : 'Privado' }}
        </span>
        <!-- Botón de elipsis -->
        <div class="absolute top-3 right-3">
          <button
            ref="menuButton"
            v-if="isAdmin(group)"
            @click.stop="toggleMenu"
            class="p-2 text-white bg-gray-900/50 dark:bg-gray-900/70 rounded-full hover:bg-gray-900/70 dark:hover:bg-gray-900/90 transition-colors"
          >
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <!-- Menú desplegable con Teleport -->
          <Teleport to="body">
            <div
              ref="menu"
              v-if="showMenu && isAdmin(group)"
              class="absolute top-10 right-0 bg-white dark:bg-gray-700 rounded-lg shadow-lg w-48 py-2 z-50 border border-gray-100 dark:border-gray-600"
              :style="menuPosition"
            >
              <button
                @click.stop="editGroup(group)"
                class="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <i class="fas fa-edit"></i>
                Editar
              </button>
              <button
                @click.stop="handleDelete"
                class="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <i class="fas fa-trash-can"></i>
                Eliminar
              </button>
            </div>
          </Teleport>
        </div>
      </div>

      <!-- Contenido -->
      <div class="p-4 space-y-2 text-sm text-gray-800 dark:text-gray-200 flex-grow">
        <h3 class="text-xl font-semibold">{{ group.title }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {{ group.description || 'Sin descripción' }}
        </p>
        <!-- Categorías -->
        <div class="flex flex-wrap gap-2">
          <span
            v-for="category in group.categories"
            :key="category.id"
            class="text-xs px-2 py-1 rounded-full bg-teal-200 text-teal-900 dark:bg-teal-600 dark:text-white"
          >
            {{ category.name }}
          </span>
        </div>
      </div>

      <!-- Footer con miembros y botón -->
      <div class="p-4 border-t border-gray-100 dark:border-gray-700">
        <div class="flex justify-between items-center flex-wrap gap-y-2">
          <div class="flex gap-2">
            <span
              class="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              <i class="fas fa-users text-primary dark:text-secondary"></i>
              {{ (group?.members && group?.members?.length ? group.members.length - 1 : 0) || 0 }} {{ (group?.members && group?.members?.length ? group.members.length - 1 : 0) === 1 ? 'miembro' : 'miembros' }}            </span>
            <span
              v-if="isMember"
              class="px-2 py-1 text-xs font-medium rounded-full transition-colors"
              :class="{
                'bg-primary text-white dark:bg-secondary hover:bg-primary/80 dark:hover:bg-secondary/80': roleLabel(group) === 'Administrador',
                'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500': roleLabel(group) === 'Miembro'
              }"
            >
              {{ roleLabel(group) }}
            </span>
          </div>
          <!-- Botón de membresía -->
          <button
            v-if="!isAdmin(group)"
            @click.stop="toggleMembership"
            class="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg shadow-sm transition-colors duration-200"
            :class="
              isMember
                ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
            "
          >
            <i :class="isMember ? 'fas fa-user-minus' : 'fas fa-user-plus'"></i>
            <p class="hidden lg:block">{{ isMember ? 'Salir' : 'Unirme' }}</p>
          </button>
          <!-- <button
            v-if="!isAdmin(group)"
            @click.stop="toggleMembership"
            class="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg shadow-sm transition-colors duration-200"
            :class="isMember ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700' : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'"
          >
            <i :class="isMember ? 'fas fa-user-minus' : 'fas fa-user-plus'"></i>
            <p class="hidden lg:block">{{ isMember ? 'Salir' : 'Unirme' }}</p>
          </button> -->
        </div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../api/auth/useAuth';
import { useGroupsStore } from '../../stores/groups';
import GenericConfirmModal from '../../components/molecules/GenericConfirmModal.vue';
import EditGroupModal from './EditGroupModal.vue';
import { useSnackbarStore } from '../../stores/snackbar';

const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
});

const router = useRouter();
const { user } = useAuth();
const groupsStore = useGroupsStore();
const showDeleteModal = ref(false);
const showEditModal = ref(false);
const groupToEdit = ref(null);
const showMenu = ref(false);
const snackbarStore = useSnackbarStore();
const menuButton = ref(null);
const menu = ref(null);
const menuPosition = ref({ top: '0px', right: '0px' });

function goToDetail() {
  router.push({ name: 'groupDetail', params: { idGroup: props.group.idDoc } });
}

function isAdmin(group) {
  return group.ownerId === user.value?.uid || user.value?.isAdmin;
}

const isMember = computed(() => props.group.members?.includes(user.value?.uid));

function roleLabel(group) {
  if (group.ownerId === user.value?.uid || group.admins?.includes(user.value?.uid)) return 'Administrador';
  return 'Miembro';
}

function toggleMenu() {
  showMenu.value = !showMenu.value;
  if (showMenu.value) {
    updateMenuPosition();
  }
}

// Calcular la posición del menú
const updateMenuPosition = () => {
  if (menuButton.value) {
    const rect = menuButton.value.getBoundingClientRect();
    menuPosition.value = {
      top: `${rect.bottom + window.scrollY + 4}px`, // Justo debajo del botón (top-10 ≈ 40px, ajustado con +4 para el espacio)
      right: `${document.documentElement.clientWidth - rect.right + window.scrollX}px`, // Alineado a la derecha del botón
    };
  }
};

// Actualizar posición al redimensionar o desplazar
const handleResizeOrScroll = () => {
  if (showMenu.value) {
    updateMenuPosition();
  }
};

// Handle clicks outside the menu
const handleClickOutside = (event) => {
  if (
    showMenu.value &&
    menu.value &&
    menuButton.value &&
    !menu.value.contains(event.target) &&
    !menuButton.value.contains(event.target)
  ) {
    showMenu.value = false;
  }
};

function handleDelete() {
  showDeleteModal.value = true;
  showMenu.value = false;
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  document.body.style.overflow = '';
}

async function confirmDelete() {
  try {
    await groupsStore.deleteGroup(props.group.idDoc);
    // console.log(`Grupo ${props.group.idDoc} eliminado`);
    snackbarStore.show(`Evento ${props.group.title} eliminado exitosamente`, 'success');
  } catch (error) {
    snackbarStore.show(`Error al eliminar grupo. Error: ${error}.`, 'error');
    console.error('Error al eliminar grupo.', error);
  }
  closeDeleteModal();
}

function editGroup(group) {
  groupToEdit.value = group;
  showEditModal.value = true;
  showMenu.value = false;
}

function closeEditModal() {
  showEditModal.value = false;
  groupToEdit.value = null;
}

function handleGroupUpdated(updatedGroup) {
  closeEditModal();
}

async function toggleMembership() {
  const groupId = props.group.idDoc;
  const userId = user.value?.uid;
  try {
    if (isMember.value) {
      await groupsStore.leaveGroup(groupId, userId);
    } else {
      await groupsStore.joinGroup(groupId, userId);
    }
    snackbarStore.show(`Usuario ${!isMember.value ? 'se unió al' : 'ha salido del'} grupo: ${props.group.title}`, 'success');
  } catch (err) {
    snackbarStore.show(`Error al cambiar la membresía del grupo: ${err}`, 'error');
    console.error('Error al cambiar la membresía del grupo:', err);
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', handleResizeOrScroll);
  window.addEventListener('scroll', handleResizeOrScroll);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleResizeOrScroll);
  window.removeEventListener('scroll', handleResizeOrScroll);
});
</script>

<style scoped>
/* Ajustar el diseño del card */
.rounded-2xl {
  border-radius: 1rem;
}

/* Mejorar sombras */
.shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.shadow-xl {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.15);
}

/* Mejorar el texto */
.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.leading-relaxed {
  line-height: 1.625;
}

/* Estilo para el badge de privacidad y menú */
.rounded-full {
  font-size: 0.75rem;
  line-height: 1rem;
}

/* Asegura que el card ocupe toda la altura disponible */
.card-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Hacer que el contenido crezca para ocupar el espacio disponible */
.card-content {
  flex-grow: 1;
}

/* Footer no necesita position absolute, se queda al final del flex */
.card-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}
</style>