<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { account, DB } from "~/lib/appwrite";
import {
  useAuthStore,
  useIsLoadingStore,
  useIsSidebarOpenStore,
} from "~/store/auth.store";
import { useFavoritesStore } from "~/store/createDocument.store";

import {
  COLLECTION_MEALS,
  COLLECTION_FAVORITES,
  COLLECTION_CART,
  DB_ID,
} from "~/app.constants";
import type { IMeals } from "~/types/order.types";
import { useSidebarStore } from "~/store/sidebarStore";

const { mutate: loginMutate } = useLogin();
const { mutate: registerMutate } = useRegister();

const backup = ref(false);

// Example usage:

const login = () => {
  loginMutate({ email: emailRef.value, password: passwordRef.value });
};

const register = () => {
  registerMutate({
    email: emailRef.value,
    password: passwordRef.value,
    name: nameRef.value,
  });
};

const isSidebarOpen = useIsSidebarOpenStore();
const sidebarStore = useSidebarStore();
const emailRef = ref("");
const passwordRef = ref("");
const nameRef = ref("");

// Stores
const store = useAuthStore();
const authStore = useAuthStore();
const isLoadingStore = useIsLoadingStore();
const cDStore = useFavoritesStore();
const router = useRouter();

// Reactive Variables
const isLoading = ref(true);
const meals = ref<IMeals[]>([]);
const favorites = ref<IMeals[]>([]);
const carts = ref<IMeals[]>([]);
const favoriteMap = ref<Record<string, boolean>>({});
const cartMap = ref<Record<string, boolean>>({});
const errorMessage = ref<string | null>(null);

// Logout function

// Fetch meals
const fetchMeals = async () => {
  try {
    const response = await DB.listDocuments(DB_ID, COLLECTION_MEALS);
    meals.value = response.documents.map((doc) => ({
      $id: doc.$id,
      name: doc.name,
      price: doc.price,
      $createdAt: doc.$createdAt,
      image: doc.image,
    })) as IMeals[];
  } catch (error) {
    console.error("Error fetching meals:", error);
  }
};

// Fetch favorites
const fetchFavorites = async () => {
  try {
    const response = await DB.listDocuments(DB_ID, COLLECTION_FAVORITES);
    favorites.value = response.documents.map((doc) => ({
      $id: doc.$id,
      name: doc.name,
      price: doc.price,
      $createdAt: doc.$createdAt,
      image: doc.image,
    })) as IMeals[];
    favorites.value.forEach((meal) => {
      favoriteMap.value[meal.$id] = true;
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
  }
};

// Fetch cart items
const fetchCarts = async () => {
  try {
    const response = await DB.listDocuments(DB_ID, COLLECTION_CART);
    carts.value = response.documents
      .filter((doc) => doc.user === cDStore.user.email)
      .map((doc) => ({
        $id: doc.$id,
        name: doc.name,
        price: doc.price,
        user: doc.user,
        $createdAt: doc.$createdAt,
        image: doc.image,
        mealId: doc.mealId,
      })) as IMeals[];
    carts.value.forEach((cart) => {
      cartMap.value[cart.mealId] = true;
    });
  } catch (error) {
    console.error("Error fetching carts:", error);
  }
};

// Initialize data
const initializeData = async () => {
  console.log("Initializing data...");
  try {
    const user = await account.get();
    console.log("User fetched:", user);
    store.set({ email: user.email, name: user.name, status: true });
    await Promise.all([fetchMeals(), fetchFavorites(), fetchCarts()]);
    isLoading.value = false;
  } catch (error) {
    console.error("Initialization error:", error);
    router.push("/login");
  }
};
// const restartSession = async (email: string, password: string) => {
//   try {
//     // Delete the current session
//     await account.deleteSession("current");
//     console.log("Session deleted successfully.");

//     // Log the user back in
//     await account.createSession(email, password);
//     console.log("New session created successfully.");
//   } catch (error) {
//     console.error("Failed to restart session:", error);
//   }
// };
const marginClass = computed(() => {
  if (!store.isAuth) return "ml-0";
  return sidebarStore.onSidebarOpen
    ? "ml-[0px] duration-700"
    : "md:ml-[80px] ml-[40px] duration-700";
});
// Watch for authentication changes
watch(
  () => store.isAuth,
  (isAuth) => {
    console.log("Authentication state changed:", isAuth);
  }
);

// Lifecycle hook
onMounted(async () => {
  await initializeData();
  fetchCarts();
});
</script>

<template>
  <!-- Loader -->
  <LayoutLoader v-if="isLoadingStore.isLoading" />

  <!-- Main Layout -->
  <section class="min-h-screen flex flex-col md:flex-row">
    <!-- Sidebar for authenticated users -->
    <aside
      v-if="store.isAuth"
      class="md:block fixed top-0 left-0 z-50 w-[40px] md:w-[200px] bg-gray-200 h-full flex items-center justify-center duration-700"
      :class="[sidebarStore.onSidebarOpen ? 'w-full' : 'w-[40px] md:w-[80px]']"
    >
      <LayoutSidebar />
    </aside>

    <!-- Main Content -->

    <div :class="[marginClass, 'flex-1']">
      <slot />
    </div>
  </section>

  <div v-if="false">
    <form class="flex flex-col items-center justify-center">
      <UiInput
        v-model="emailRef"
        placeholder="Email"
        type="email"
        class="mb-4 placeholder:text-gray-300 text-black"
      />
      <UiInput
        v-model="passwordRef"
        placeholder="Password"
        type="password"
        class="mb-4 placeholder:text-gray-300 text-black"
      />
      <!-- Only show name input for registration -->
      <UiInput
        v-if="!authStore.isAuth"
        v-model="nameRef"
        placeholder="Name"
        type="text"
        class="mb-4 placeholder:text-gray-300 text-black"
      />
      <div class="flex justify-center items-center gap-5">
        <UiButton
          type="button"
          class="bg-gray-800 text-black rounded hover:bg-gray-700"
          @click="login"
          >Login</UiButton
        >
        <UiButton
          type="button"
          class="bg-gray-800 text-black rounded hover:bg-gray-700"
          @click="register"
          >Register</UiButton
        >
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Add custom styles if needed */
</style>
