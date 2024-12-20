<template>
  <LayoutLoader v-if="isLoadingStore.isLoading" />
  <section class="min-h-screen flex flex-col md:flex-row">
    <!-- Sidebar for medium and larger screens -->
    <aside
      v-if="store.isAuth"
      class="md:block fixed top-0 left-0 z-10 w-[70px] md:w-[200px] bg-gray-200 h-full flex items-center justify-center"
    >
      <LayoutSidebar />

      <button
        @click="logout"
        class="absolute bottom-4 right-0 w-full flex items-center justify-center gap-2 text-white text-xl hover:text-gray-500 transition duration-300"
      >
        <div>Logout</div>
        <Icon name="line-md:logout" size="25" />
      </button>
    </aside>

    <!-- Main Content -->
    <div :class="[{ 'md:ml-[200px] ml-[40px]': store.isAuth }, 'flex-1 p-4']">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { account } from "~/lib/appwrite";
import { useAuthStore, useIsLoadingStore } from "~/store/auth.store";
import { watch, onMounted } from "vue";
import { useRouter } from "vue-router";

const isLoadingStore = useIsLoadingStore();
const store = useAuthStore();
const router = useRouter();

const logout = () => {
  account.deleteSession("current");
  store.set({ email: "", name: "", status: false });
  router.push("/login");
};

// Watch the authentication state
watch(
  () => store.isAuth,
  (isAuth) => {
    if (!isAuth) {
      console.log("User logged out. Hiding sidebar...");
    } else {
      console.log("User logged in. Showing sidebar...");
    }
  }
);

onMounted(async () => {
  try {
    const user = await account.get();
    if (user) {
      store.set({ email: user.email, name: user.name, status: true });
    }
  } catch (error) {
    console.error("Error:", error);
    router.push("/login");
  } finally {
    isLoadingStore.set(false);
  }
});
</script>
