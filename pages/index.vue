<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import {
  DB_ID,
  COLLECTION_MEALS,
  COLLECTION_FAVORITES,
  COLLECTION_CART,
} from "@/app.constants";
import { DB } from "@/lib/appwrite";
import { useMutation } from "@tanstack/vue-query";
import { useFavoritesStore } from "~/store/createDocument.store";
import { useCreateMeal } from "~/composables/useCreateMeal";
import { useGetMeals } from "~/composables/useGetMeals";
import type { IMeals } from "~/types/order.types";
import { v4 as uuid } from "uuid";
import { Carousel } from "~/components/ui/carousel";
import { CarouselContent } from "~/components/ui/carousel";
import { CarouselItem } from "~/components/ui/carousel";
import { CarouselNext } from "~/components/ui/carousel";
import { CarouselPrevious } from "~/components/ui/carousel";
import { useGetFavorites } from "~/composables/useGetFavorites";
import { useGetCarts } from "~/composables/useGetCarts";
import { useAuthStore } from "~/store/auth.store";
import { fetchUserData } from "~/composables/fetchUserData"; // Import the function
import type { IAuthStore } from "~/store/auth.store";
import { set } from "@vueuse/core";
import { useRouter } from "vue-router";

// Composables
const { mutate, isPending, isError } = useCreateMeal();
const { data, isLoading, isError: isErrorGet } = useGetMeals();
const cDStore = useFavoritesStore();

// Input references and error handling
const errorMessage = ref<string | null>(null);
const meals = ref<IMeals[]>([]);
const favorites = ref<IMeals[]>([]);
const carts = ref<IMeals[]>([]);
const router = useRouter();
const favoriteMap = ref<{ [mealId: string]: boolean }>({});
const cartMap = ref<{ [mealId: string]: boolean }>({});

const isProcessing = ref(false);

// Fetch meals, favorites, and cart
const fetchMeals = async () => {
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
    }
  } catch (error) {
    console.error("Error fetching meals:", error);
    errorMessage.value = "An error occurred while fetching meals.";
  }
};

const fetchFavorites = async () => {
  try {
    const response = await DB.listDocuments(DB_ID, COLLECTION_FAVORITES);
    if (response.documents.length === 0) {
      errorMessage.value = "No favorites available.";
    } else {
      favorites.value = response.documents
        .filter((document) => document.user === cDStore.user.email)
        .map((document) => ({
          $id: document.$id,
          name: document.name,
          price: document.price,
          $createdAt: document.$createdAt,
          image: document.image,
          mealId: document.mealId,
        })) as IMeals[];

      favorites.value.forEach((meal) => {
        favoriteMap.value[meal.mealId] = true;
      });
    }
  } catch (error) {
    console.error("Error fetching favorites:", error);
    errorMessage.value = "An error occurred while fetching favorites.";
  }
};

const fetchCart = async () => {
  try {
    const response = await DB.listDocuments(DB_ID, COLLECTION_CART);
    if (response.documents.length === 0) {
      errorMessage.value = "No cart items available.";
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

      carts.value.forEach((cart) => {
        cartMap.value[cart.mealId] = true;
      });
    }
  } catch (error) {
    console.error("Error fetching cart items:", error);
    errorMessage.value = "An error occurred while fetching cart items.";
  }
};

// Meal mutation
const createMeal = () => {
  const mealU = {
    name: "New Meal",
    price: 0,
    image:
      "https://cloud.appwrite.io/v1/storage/buckets/shop-bucket/files/2bc08d06-aca5-4b11-a360-274b53d1f4a2/view?project=crm-nuxt-shop&project=crm-nuxt-shop&mode=admin",
  };

  mutate(mealU);
};

// Handle adding/removing favorites
const checkIsFavorite = (mealId: string) => {
  return favoriteMap.value[mealId] || false;
};

const makeFavorite = async (meal: IMeals) => {
  if (isProcessing.value) return;
  isProcessing.value = true;
  const IMealFavorite = checkIsFavorite(meal.$id);

  try {
    if (IMealFavorite) {
      await cDStore.removeFavorite(meal.$id);
      favorites.value = favorites.value.filter(
        (favorite) => favorite.mealId !== meal.$id
      );
    } else {
      await cDStore.addFavorite(meal.$id);
      favorites.value.push(meal);
    }

    favoriteMap.value[meal.$id] = !IMealFavorite;
  } catch (error) {
    console.error("Error toggling favorite:", error);
  } finally {
    isProcessing.value = false;
  }
};

// Handle adding/removing from cart
const checkIsCart = (mealId: string) => {
  return cartMap.value[mealId] || false;
};

const makeCart = async (meal: IMeals) => {
  if (isProcessing.value) return;
  isProcessing.value = true;
  const IMealCart = checkIsCart(meal.$id);

  try {
    if (IMealCart) {
      await cDStore.removeFromCart(meal.$id);
    } else {
      await cDStore.addToCart(meal.$id);
    }

    cartMap.value[meal.$id] = !IMealCart;
  } catch (error) {
    console.error("Error toggling cart:", error);
  } finally {
    isProcessing.value = false;
  }
};

// Reset state and refetch
const resetState = () => {
  meals.value = [];
  favorites.value = [];
  carts.value = [];
  favoriteMap.value = {};
  cartMap.value = {};
  errorMessage.value = null;
};

const refetch = () => {
  resetState();
  fetchMeals();
  fetchFavorites();
  fetchCart();
};

// Watch user change
watch(
  () => cDStore.user,
  (newUser, oldUser) => {
    if (newUser !== oldUser) {
      resetState();
      refetch();
    }
  }
);
const isDataLoaded = ref(false);

watch(
  () => useAuthStore().isAuth,
  async (isAuthenticated) => {
    if (isAuthenticated && !isDataLoaded.value) {
      try {
        // Fetch user data once the user is authenticated
        const userData = await fetchUserData();
        // Transform the Document object into an IAuthStore object
        const authData: IAuthStore = {
          email: userData.email,
          status: true, // Assuming the user is authenticated
          name: userData.name,
        };
        // Set the data in the store or state
        useAuthStore().setUserData(authData);
        isDataLoaded.value = true; // Mark the data as loaded
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  },
  { immediate: true } // Ensure the watcher runs immediately if the user is already logged in
);
// Initial loading of data
onMounted(() => {
  fetchMeals();
  fetchFavorites();
  fetchCart();

  setTimeout(() => {
    router.push("/products");
  }, 1000);
});
</script>

<template>
  <div class="text-2xl test-light text-gray-800 p-10">Today's best</div>

  <div v-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>

  <div class="max-w-[95%] mx-auto relative">
    <Carousel class="w-full max-w-[80vw] mx-auto">
      <div class="absolute -top-5 right-20">
        <CarouselPrevious />
        <CarouselNext />
      </div>
      <CarouselContent>
        <CarouselItem
          v-for="meal in data"
          :key="meal.$id"
          class="basis-1/3"
          :wrap-around="true"
        >
          <NuxtLink
            :to="`/edit/${meal.$id}`"
            class="w-full h-full flex flex-col items-center justify-between rounded-xl py-2"
          >
            <div class="w-full flex flex-col items-center">
              <p>{{ meal.name }}</p>
              <p>{{ meal.price }}</p>
            </div>
            <img :src="meal.image" alt="Meal image" />

            <div class="flex flex-wrap gap-4">
              <button
                @click.prevent="makeFavorite(meal)"
                class="flex items-center justify-center cursor-pointer border border-gray-400 p-2 rounded-full"
              >
                <Icon
                  :name="
                    checkIsFavorite(meal.$id)
                      ? 'radix-icons:heart-filled'
                      : 'radix-icons:heart'
                  "
                  class="w-5 h-5 text-bold"
                />
              </button>

              <button
                @click.prevent="makeCart(meal)"
                class="flex items-center justify-center cursor-pointer border border-gray-400 p-2 rounded-full"
              >
                <Icon
                  :name="
                    checkIsCart(meal.$id) ? 'ion:cart' : 'ion:cart-outline'
                  "
                  class="w-5 h-5 text-bold"
                />
              </button>
            </div>
          </NuxtLink>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  </div>

  <div class="py-40"></div>
</template>

<style scoped>
/* Add your styles here */
</style>
