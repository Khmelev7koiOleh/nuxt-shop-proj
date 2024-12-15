<script setup lang="ts">
console.log("default layout");
import { onMounted, watch } from "vue";
import { useIsSidebarOpenStore } from "~/store/auth.store";
import { account } from "~/lib/appwrite";

const isSidebarOpen = useIsSidebarOpenStore();
const ifUser = async () => {
  try {
    const response = await account.get(); // Get current user

    if (!response) {
      isSidebarOpen.set(false);
      return;
    } else {
      isSidebarOpen.set(true);
    }
  } catch (error) {
    console.error("User not logged in", error);
    isSidebarOpen.set(false);
  }
};
watch(isSidebarOpen, async () => {
  await ifUser();
});
</script>

<template>
  <div v-if="isSidebarOpen.isOpen">
    <!-- <LayoutLoader v-if="loadingStore.isLoading" /> -->
    <section class="w-screen min-h-[100vh] flex">
      <div class="w-[15%]">
        <div class="fixed w-[15%]">
          <LayoutSidebar />
        </div>
      </div>

      <div class="w-[85%]">
        <slot />
      </div>
    </section>
  </div>

  <div v-if="!isSidebarOpen.isOpen">
    <!-- <LayoutLoader v-if="loadingStore.isLoading" /> -->
    <section class="w-screen min-h-[100vh] flex">
      <div class="w-full">
        <slot />
      </div>
    </section>
  </div>
</template>

<style scoped></style>
