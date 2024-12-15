<script setup lang="ts">
import { onMounted } from "vue";
import { MENU_DATA } from "./menu.data";
import { account } from "~/lib/appwrite";
import { useRouter } from "vue-router";
import { useIsSidebarOpenStore } from "~/store/auth.store";

const isSidebarOpen = useIsSidebarOpenStore();

const router = useRouter();

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

const logout = () => {
  account.deleteSession("current");
  isSidebarOpen.set(false);
  router.push("/login");
  console.log(isSidebarOpen);
};

onMounted(() => {
  ifUser();
});
</script>

<template>
  <section
    class="bg-slate-700 text-gray-100 text-xl h-screen flex flex-col justify-center gap-4"
  >
    <div class="mt-10"></div>
    <div v-for="item in MENU_DATA" :key="item.name">
      <LayoutMenu :item="item" />
    </div>

    <div
      class="flex gap-2 h-full items-end justify-end cursor-pointer p-2"
      @click="logout"
    >
      <div>Logout</div>
      <Icon name="line-md:logout" size="25" />
    </div>
  </section>
</template>

<style scoped></style>
