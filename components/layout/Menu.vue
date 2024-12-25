<template>
  <div>
    <NuxtLink
      :to="item.url"
      @click="sidebarStore.onSidebarOpen = false"
      class="w-[100%] flex items-center gap-2 p-2 rounded-md hover:bg-accent hover:text-gray-400 cursor-pointer"
    >
      <Icon :name="props.item.icon" />
      <div>{{ item.name }}</div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { MENU_DATA } from "./menu.data";
import { useSidebarStore } from "~/store/sidebarStore";
const sidebarStore = useSidebarStore();

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped></style>
