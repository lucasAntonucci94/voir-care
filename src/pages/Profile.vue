<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  

  <div class="m-2 flex flex-col gap-2 p-8  rounded-xl bg-white dark:bg-gray-800 shadow-md  sm:flex-row sm:items-center sm:gap-6 sm:py-4">
      <img class="mx-auto block h-24 rounded-full sm:mx-0 sm:shrink-0" src="../assets/logo.png" alt="" />
      <div class="space-y-2 text-center sm:text-left">
        <div class="space-y-0.5">
          <p class="text-lg font-semibold text-black dark:text-white">Erin Lindford</p>
          <p class="font-medium text-gray-500  dark:text-gray-300">Product Engineer</p>
        </div>
        <button class="border-purple-200  text-indigo-500 dark:text-indigo-300 hover:border-transparent hover:bg-purple-600 hover:text-white active:bg-purple-700 ...">
          Message
        </button>
      </div>
    </div>
    <div class="flex flex-nowrap">
      <div>01</div>
      <div>02</div>
      <div>03</div>
    </div>

    <div class="not-prose overflow-auto rounded-lg bg-white outline outline-white/5 dark:bg-gray-950/50">
      <div class="bg-white">
        <div class="mx-auto w-72 px-8 py-6 sm:w-96 sm:px-12 sm:py-8">
          <div class="flex items-center space-x-2 text-base">
            <h4 class="text-base font-semibold text-slate-900">Contributors</h4>
            <span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">204</span>
          </div>
          <div class="mt-3 flex -space-x-2 overflow-hidden">
              <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white" alt="" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80">
              <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white" alt="" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80">
              <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white" alt="" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2.25&amp;w=256&amp;h=256&amp;q=80">
              <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white" alt="" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80">
              <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white" alt="" src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80"></div><div class="mt-3 text-sm font-medium">
              <a href="#" class="text-blue-500">
                <ul>
                  <li>198 others</li>
                </ul>
              </a>
          </div>
        </div>
      </div>
    </div>

    <div class="not-prose overflow-auto rounded-lg bg-white outline outline-white/5 dark:bg-gray-950/50">
  <div class="bg-white">
    <div class="mx-auto w-72 px-8 py-6 sm:w-96 sm:px-12 sm:py-8">
      <div class="flex items-center space-x-2 text-base">
        <h4 class="text-base font-semibold text-slate-900 dark:text-white">Contributors</h4>
        <span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-gray-700 dark:text-slate-300">204</span>
      </div>
      <div class="mt-3 flex -space-x-2 overflow-hidden">
        <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white dark:ring-gray-800" alt="" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80">
        <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white dark:ring-gray-800" alt="" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80">
        <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white dark:ring-gray-800" alt="" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2.25&amp;w=256&amp;h=256&amp;q=80">
        <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white dark:ring-gray-800" alt="" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80">
        <img class="inline-block h-12 w-12 rounded-full ring-2 ring-white dark:ring-gray-800" alt="" src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=2&amp;w=256&amp;h=256&amp;q=80">
      </div>
      <div class="mt-3 text-sm font-medium">
        <a href="#" class="text-blue-500 dark:text-blue-400 hover:underline">
          <ul>
            <li>198 others</li>
          </ul>
        </a>
      </div>
    </div>
  </div>
</div>


</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
