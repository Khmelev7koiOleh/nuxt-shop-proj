<script setup lang="ts">
console.log("default layout");
</script>

<template>
  <div>
    <!-- <LayoutLoader v-if="loadingStore.isLoading" /> -->
    <section class="w-screen min-h-[100vh] flex">
      <div class="w-[20%]">
        <div class="fixed w-[20%]">
          <LayoutSidebar />
        </div>
      </div>

      <div class="w-[80%]">
        <slot />
      </div>
    </section>
  </div>
</template>

<style scoped></style>
