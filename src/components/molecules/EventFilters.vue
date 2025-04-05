<template>
    <div class="flex gap-3 flex-wrap items center">
        <!-- Filtro por texto -->
         <input v-if="showSearch" v-model="searchModel" type="text" placeholder="Buscar evento..." class="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
        <!-- Filtro por categoria -->
         <select v-if="showSelect" v-model="selectModel" name="selectCategories" id="selectCategories" class="px-3 py-2 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
            <option value="">Todas las categorías</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">{{category.name}}</option>
         </select>
    </div>
</template>
<script setup>
import { defineEmits, watch} from 'vue'

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    },
    selectedCategory: {
        type: String,
        default: ''
    },
    showSearch: {
        type: Boolean,
        default: true
    },
    showSelect: {
        type: Boolean,
        default: true
    },
    categories: {
        type: Array,
        default: () => []
    },
})
const emit = defineEmits(['update:modelValue', 'update:selectedCategory'])

const searchModel = defineModel('modelValue')
const selectModel = defineModel('selectedCategory')
</script>