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
import { get, set } from "@vueuse/core";
import { useRouter } from "vue-router";
import { useMealMutations } from "@/composables/useFavoriteToggle";

// Composables
// const { mutate, isPending, isError } = useCreateMeal();
const { data, isLoading, isError: isErrorGet } = useGetMeals();
const { data: cartData } = useGetCarts();
const { data: favoritesData } = useGetFavorites();
const cDStore = useFavoritesStore();
const {
  toggleCartMutation,
  toggleFavoriteMutation,
  cartMap,
  favoriteMap,
  favorites,
} = useMealMutations();

// Input references and error handling
const errorMessage = ref<string | null>(null);
const meals = ref<IMeals[]>([]);
// const favorites = ref<IMeals[]>([]);
const carts = ref<IMeals[]>([]);
const router = useRouter();

const isProcessing = ref(false);

// // Handle adding/removing favorites

const checkIsFavorite = (mealId: string) => {
  return favoriteMap.value[mealId] || false;
};
const checkIsCart = (mealId: string) => {
  return cartMap.value[mealId] || false;
};
onMounted(async () => {
  const getCarts = await DB.listDocuments(DB_ID, COLLECTION_CART);
  const getFavorites = await DB.listDocuments(DB_ID, COLLECTION_FAVORITES);
  getCarts.documents
    .filter((cart) => cart.user === cDStore.user.email)
    .forEach((cart) => {
      cartMap.value[cart.mealId] = true;
    });

  getFavorites.documents
    .filter((favorite) => favorite.user === cDStore.user.email)
    .forEach((favorite) => {
      favoriteMap.value[favorite.mealId] = true;
    });
});

const randomDataImages = ref("");
// onMounted(async () => {
//   // const data = await DB.listDocuments();
//   // const randomIndex = Math.floor(Math.random() * data.documents.length);
//   // randomDataImages.value = data.documents[randomIndex].url;
// });

// const getIteq = await DB.listDocuments(DB_ID, COLLECTION_MEALS);

// const ids = getIteq.documents.map((doc: any) => doc.$id);
// console.log(ids);

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
</script>

<template>
  <section class="w-full">
    <div>
      <NuxtImg :src="randomDataImages" class="w-full" />
    </div>
  </section>

  <div v-if="!data" class="flex justify-center items-center">
    <div class="text-red-500">{{ errorMessage }}</div>
  </div>

  <div class="w-full mx-auto relative bg-black text-gray-200 py-4">
    <Carousel class="w-full max-w-[95vw] mx-auto text-gray-400">
      <div class="absolute bottom-[50%] left-20 z-50">
        <CarouselPrevious class="w-14 h-14" />
      </div>
      <div class="absolute bottom-[50%] right-20 z-50 text-gray-400">
        <CarouselNext class="w-14 h-14" />
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
                @click.prevent="toggleFavoriteMutation.mutate(meal)"
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
                @click.prevent="toggleCartMutation.mutate(meal)"
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
</template>

<style scoped>
/* Add your styles here */
</style>
