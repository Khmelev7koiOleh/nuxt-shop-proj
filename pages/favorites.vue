<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

import {
  DB_ID,
  COLLECTION_MEALS,
  COLLECTION_FAVORITES,
  COLLECTION_CART,
  STORAGE_ID,
} from "@/app.constants";
import { DB, storage } from "@/lib/appwrite";
import { useMutation } from "@tanstack/vue-query";
import { v4 as uuid } from "uuid";
import { useForm } from "vee-validate";
import type { IMeals } from "~/types/order.types";
import { useFavoritesStore } from "~/store/createDocument.store";
import { useRouter } from "vue-router";
import { openOrder } from "~/components/order/make-order.store";
import { useDeleteFavoriteMeal } from "#build/imports";
import { useCreateMeal } from "~/composables/useCreateMeal";
import { useGetMeals } from "~/composables/useGetMeals";
import { useGetFavorites } from "~/composables/useGetFavorites";
import { useMealMutations } from "@/composables/useFavoriteToggle";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { set } from "@vueuse/core";
import { useRemoveItem } from "~/composables/removeFrom";

const router = useRouter();

// composables
const { data, isLoading, isError } = useGetFavorites();
const {
  mutate: deleteFavorite,
  isPending: isPendingDelete,
  isError: isErrorDelete,
} = useDeleteFavoriteMeal();
const { toggleCartMutation, toggleFavoriteMutation } = useMealMutations();
// store
const cDStore = useFavoritesStore();
const removeStore = useRemoveItem();
// Input references and error handling
const nameRef = ref("");
const priceRef = ref(0);
const fileRef = ref<File | null>(null);
const errorMessage = ref<string | null>(null);

const meals = ref<IMeals[]>([]);
const favorites = ref<IMeals[]>([]);
const cartMap = ref<{ [mealId: string]: boolean }>({});
const carts = ref<IMeals[]>([]);
const total = ref(0);

const favoriteMap = ref<{ [mealId: string]: boolean }>({});

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
// const getIsFavorite = async () => {
//   try {
//     const response = await DB.listDocuments(DB_ID, COLLECTION_FAVORITES);
//     if (response.documents.length === 0) {
//       errorMessage.value = "No favorites available.";
//     } else {
//       favorites.value = response.documents.map((document) => ({
//         $id: document.$id,
//         name: document.name,
//         price: document.price,
//         $createdAt: document.$createdAt,
//         image: document.image,
//       })) as IMeals[];

//       // Populate the favoriteMap with the current favorite status
//       favorites.value.forEach((meal) => {
//         favoriteMap.value[meal.$id] = true;
//       });
//     }
//   } catch (error) {
//     console.error("Error fetching favorites:", error);
//     errorMessage.value = "An error occurred while fetching favorites.";
//   }
// };

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
        })) as IMeals[];

      carts.value.sort((a, b) => {
        const dateA = new Date(a.$createdAt);
        const dateB = new Date(b.$createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      total.value = carts.value.length;
      // Populate the favoriteMap with the current favorite status
      carts.value.forEach((cart) => {
        cartMap.value[cart.$id] = true;
      });
    }
  } catch (error) {
    console.error("Error fetching favorites:", error);
    errorMessage.value = "An error occurred while fetching favorites.";
  }
};

// Check if a meal is in favorites
const checkIsCart = (mealId: string) => {
  return cartMap.value[mealId] || false; // Return false if not found
};
// Toggle favorite status
const makeFavorite = async (meal: IMeals) => {
  if (isProcessing.value) return; // Prevent multiple clicks while processing
  isProcessing.value = true;
  console.log(meal);
  const IMealFavorite = checkIsCart(meal.$id);

  try {
    if (IMealFavorite) {
      await cDStore.removeFromCart(meal.$id); // Remove from favorites
    } else {
      await cDStore.addFavorite(meal.$id); // Add to favorites
    }

    // Toggle the local state of the favorite map after operation
    favoriteMap.value[meal.$id] = !IMealFavorite;
  } catch (error) {
    console.error("Error toggling favorite:", error);
  } finally {
    isProcessing.value = false; // Reset loading state
  }
};
const checkIsFavorite = (mealId: string) => {
  return favoriteMap.value[mealId] || false; // Return false if not found
};

// Initial loading of data
onMounted(() => {
  getItems();
  getIsCart();
  // getIsFavorite();
  console.log(carts);
  console.log(favorites);
});

// watch(
//   () => carts,
//   async () => {
//     await setTimeout(() => {
//       getIsCart();
//       getIsFavorite();
//     }, 1500);
//     console.log(carts);
//   }
// );
// const setTimeoutFunction = async () => {
//   await setTimeout(() => {
//     getIsCart();
//   }, 1500);
// };
</script>

<template>
  <!-- <div class="p-4 bg-slate-500 mb-20 flex flex-col gap-2 w-1/2">
    <input type="text" v-model="nameRef" placeholder="Title" />
    <input type="number" v-model="priceRef" placeholder="Price" />
    <input type="file" @change="handleFileChange" />
    <button @click="onSubmit" type="submit">Submit</button>
    <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
  </div> -->

  <div class="text-3xl test-light text-gray-800 p-10 text-center">
    Favorites
  </div>
  <div v-if="data?.length === 0">Add something to your favorites</div>
  <div v-else class="w-[95%] flex flex-wrap mx-auto">
    <div
      v-for="favorite in data"
      :key="favorite.$id"
      class="basis-1/4"
      :wrap-around="true"
    >
      <NuxtLink
        :href="`/edit/${favorite.mealId}`"
        v-if="favorite.user === cDStore.user.email"
        class="max-w-[95%] h-full flex flex-col items-center justify-between bg-gray-900 text-gray-100 rounded-3xl py-4 border border-white relative"
      >
        <div class="w-full flex flex-col items-center">
          <p class="text-xl">{{ favorite.name }}</p>
        </div>
        <img :src="favorite.image" alt="Meal image" />
        <p class="text-xl">Price:{{ favorite.price }}</p>
        <div class="flex gap-4 p-2 absolute top-2 left-2">
          <button @click.prevent="toggleFavoriteMutation.mutate(favorite)">
            <div
              class="flex items-center justify-center cursor-pointer border border-red-400 text-red-400 p-2 rounded-full"
            >
              <Icon
                @click.prevent="deleteFavorite(favorite.$id)"
                :name="'radix-icons:heart-filled'"
                class="w-5 h-5 text-bold"
              />
            </div>
          </button>
        </div>
      </NuxtLink>
    </div>
  </div>

  <div class="py-40"></div>
</template>

<style scoped>
/* Add your styles here */
</style>
