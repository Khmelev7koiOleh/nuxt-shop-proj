<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { account, DB } from "~/lib/appwrite";
import { useAuthStore, useIsLoadingStore } from "~/store/auth.store";
import { useFavoritesStore } from "~/store/createDocument.store";
import {
  COLLECTION_MEALS,
  COLLECTION_FAVORITES,
  COLLECTION_CART,
  DB_ID,
} from "~/app.constants";
import type { IMeals } from "~/types/order.types";

// Stores
const store = useAuthStore();
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
const restartSession = async (email: string, password: string) => {
  try {
    // Delete the current session
    await account.deleteSession("current");
    console.log("Session deleted successfully.");

    // Log the user back in
    await account.createSession(email, password);
    console.log("New session created successfully.");
  } catch (error) {
    console.error("Failed to restart session:", error);
  }
};
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
});
</script>

<template>
  <!-- Loader -->
  <LayoutLoader v-if="isLoadingStore.isLoading" />

  <!-- Main Layout -->
  <section v-if="!isLoading" class="min-h-screen flex flex-col md:flex-row">
    <!-- Sidebar for authenticated users -->
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
    <div :class="[{ 'md:ml-[200px] ml-[70px]': store.isAuth }, 'flex-1']">
      <slot />
    </div>
  </section>
</template>

<style scoped>
/* Add custom styles if needed */
</style>
