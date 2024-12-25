<template>
  <div>
    <NuxtLink
      :to="item.url"
      class="w-[100%] flex items-center gap-2 p-3 rounded-md hover:bg-accent hover:text-gray-400 cursor-pointer"
    >
      <Icon :name="item.icon" />
      <!-- <div>{{ item.name }}</div> -->
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { MENU_DATA } from "./menu.data";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped></style>
