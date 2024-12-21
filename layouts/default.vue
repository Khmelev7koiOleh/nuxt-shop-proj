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
    <div :class="[{ 'md:ml-[200px] ml-[40px]': store.isAuth }, 'flex-1 ']">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { account } from "~/lib/appwrite";
import { useAuthStore, useIsLoadingStore } from "~/store/auth.store";
import { watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { DB, storage } from "~/lib/appwrite";
import {
  COLLECTION_MEALS,
  COLLECTION_FAVORITES,
  COLLECTION_CART,
  DB_ID,
  STORAGE_ID,
} from "~/app.constants";
import type { IMeals } from "~/types/order.types";
import { useFavoritesStore } from "~/store/createDocument.store";

const cDStore = useFavoritesStore();

const isLoadingStore = useIsLoadingStore();
const store = useAuthStore();
const router = useRouter();
const errorMessage = ref<string | null>(null);

const meals = ref<IMeals[]>([]);
const favorites = ref<IMeals[]>([]);
const carts = ref<IMeals[]>([]);

const favoriteMap = ref<{ [mealId: string]: boolean }>({});
const cartMap = ref<{ [mealId: string]: boolean }>({});

// Loading and async state
const isProcessing = ref(false);

const getItems = async () => {
  try {
    const response = await DB.listDocuments(DB_ID, COLLECTION_MEALS);
    if (response.documents.length === 0) {
      errorMessage.value = "No meals available.";
    } else {
      meals.value = response.documents.map((document) => ({
        $id: document.$id,
        name: document.name,
        price: document.price,
        $createdAt: document.$createdAt,
        image: document.image,
      })) as IMeals[];

      meals.value.sort((a, b) => {
        const dateA = new Date(a.$createdAt);
        const dateB = new Date(b.$createdAt);
        return dateB.getTime() - dateA.getTime();
      });
    }
  } catch (error) {
    console.error("Error fetching meals:", error);
    errorMessage.value = "An error occurred while fetching meals.";
  }
};

// Fetch favorites and update favorite map
const getIsFavorite = async () => {
  try {
    const response = await DB.listDocuments(DB_ID, COLLECTION_FAVORITES);
    if (response.documents.length === 0) {
      errorMessage.value = "No favorites available.";
    } else {
      favorites.value = response.documents.map((document) => ({
        $id: document.$id,
        name: document.name,
        price: document.price,
        $createdAt: document.$createdAt,
        image: document.image,
      })) as IMeals[];

      // Populate the favoriteMap with the current favorite status
      favorites.value.forEach((meal) => {
        favoriteMap.value[meal.$id] = true;
      });
    }
  } catch (error) {
    console.error("Error fetching favorites:", error);
    errorMessage.value = "An error occurred while fetching favorites.";
  }
};

const getIsCart = async () => {
  try {
    const response = await DB.listDocuments(DB_ID, COLLECTION_CART);
    if (response.documents.length === 0) {
      errorMessage.value = "No favorites available.";
    } else {
      carts.value = response.documents
        .filter((document) => document.user === cDStore.user.email)
        .map((document) => ({
          $id: document.$id,
          name: document.name,
          price: document.price,
          user: document.user,
          $createdAt: document.$createdAt,
          image: document.image,
          mealId: document.mealId,
        })) as IMeals[];

      // Populate the favoriteMap with the current favorite status
      carts.value.forEach((cart) => {
        cartMap.value[cart.mealId] = true;
      });
    }
  } catch (error) {
    console.error("Error fetching favorites:", error);
    errorMessage.value = "An error occurred while fetching favorites.";
  }
};
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
await getItems();
await getIsFavorite();
await getIsCart();
</script>
