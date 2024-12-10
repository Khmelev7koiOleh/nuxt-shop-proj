<script setup lang="ts">
import { MENU_DATA } from "./menu.data";
</script>

<template>
  <section
    class="bg-slate-700 text-gray-100 text-xl h-screen flex flex-col p-8 justify-center gap-10"
  >
    <div v-for="item in MENU_DATA" :key="item.name">
      <LayoutMenu :item="item" />
    </div>
  </section>
</template>

<style scoped></style>
