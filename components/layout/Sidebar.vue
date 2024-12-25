<script setup lang="ts">
import { onMounted } from "vue";
import { MENU_DATA } from "./menu.data";
import { account } from "~/lib/appwrite";
import { useRouter } from "vue-router";
import { useIsSidebarOpenStore } from "~/store/auth.store";
import { useAuthStore } from "~/store/auth.store";
import { useSidebarStore } from "~/store/sidebarStore";

const store = useAuthStore();

const isSidebarOpen = useIsSidebarOpenStore();

const router = useRouter();
const sidebarStore = useSidebarStore();

const isLoggedIn = ref(false);

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
const logout = async () => {
  try {
    await account.deleteSession("current");
    store.set({ email: "", name: "", status: false });

    router.push("/login");
  } catch (error) {
    console.error("Logout failed:", error);
    errorMessage.value = "Logout failed. Please try again.";
  }
};

const toggleSidebar = () => {
  sidebarStore.toggleSidebar();
};

onMounted(() => {
  ifUser();
});
</script>

<template>
  <section
    class="w-full bg-slate-700 text-gray-100 text-xl h-screen flex flex-col justify-center items-center"
  >
    <button @click="toggleSidebar" class="my-4">
      <Icon
        :name="
          sidebarStore.onSidebarOpen
            ? 'radix-icons:cross-2'
            : 'radix-icons:hamburger-menu'
        "
        size="30"
      />
    </button>
    <div class="flex flex-col justify-start items-start gap-4">
      <div v-for="item in MENU_DATA" :key="item.name">
        <div v-if="sidebarStore.onSidebarOpen">
          <LayoutMenu :item="item" />
        </div>
        <div v-if="!sidebarStore.onSidebarOpen">
          <LayoutIconMenu :item="item" />
        </div>
      </div>
    </div>

    <button
      @click="logout"
      class="absolute bottom-4 right-0 w-full flex items-center justify-center gap-2 text-white text-xl hover:text-gray-500 transition duration-300"
    >
      <div class="flex gap-2 bg-gray-00 px-2 py-1 rounded">
        <div v-if="sidebarStore.onSidebarOpen">Logout</div>
        <Icon name="line-md:logout" size="25" />
      </div>
    </button>
    <div class="py-10"></div>
  </section>
</template>

<style scoped></style>
