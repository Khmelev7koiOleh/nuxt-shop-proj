<script setup lang="ts">
import { ref, onMounted } from "vue";

import {
  DB_ID,
  COLLECTION_MEALS,
  COLLECTION_FAVORITES,
  STORAGE_ID,
  COLLECTION_CART,
} from "@/app.constants";
import { DB, storage } from "@/lib/appwrite";
import { useMutation } from "@tanstack/vue-query";
import { v4 as uuid } from "uuid";
import { useForm } from "vee-validate";
import type { IMeals } from "~/types/order.types";
import { useFavoritesStore } from "~/store/createDocument.store";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// store
const cDStore = useFavoritesStore();
// Input references and error handling

const errorMessage = ref<string | null>(null);

const meals = ref<IMeals[]>([]);
const favorites = ref<IMeals[]>([]);
const carts = ref<IMeals[]>([]);

const favoriteMap = ref<{ [mealId: string]: boolean }>({});
const cartMap = ref<{ [mealId: string]: boolean }>({});

// Loading and async state
const isProcessing = ref(false);

// Fetch meals
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
// Check if a meal is in favorites
const checkIsFavorite = (mealId: string) => {
  return favoriteMap.value[mealId] || false; // Return false if not found
};
// Toggle favorite status
const makeFavorite = async (meal: IMeals) => {
  if (isProcessing.value) return; // Prevent multiple clicks while processing
  isProcessing.value = true;
  console.log(meal);
  const IMealFavorite = checkIsFavorite(meal.$id);

  try {
    if (IMealFavorite) {
      await cDStore.removeFavorite(meal.$id); // Remove from favorites
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

const checkIsCart = (mealId: string) => {
  return cartMap.value[mealId] || false; // Return false if not found
};
// Toggle favorite status
const makeCart = async (meal: IMeals) => {
  if (isProcessing.value) return; // Prevent multiple clicks while processing
  isProcessing.value = true;
  console.log(meal);
  const IMealCart = checkIsCart(meal.$id);

  try {
    if (IMealCart) {
      await cDStore.removeFromCart(meal.$id); // Remove from favorites
    } else {
      await cDStore.addToCart(meal.$id); // Add to favorites
    }

    // Toggle the local state of the favorite map after operation
    cartMap.value[meal.$id] = !IMealCart;
  } catch (error) {
    console.error("Error toggling favorite:", error);
  } finally {
    isProcessing.value = false; // Reset loading state
  }
};

// Handle file change

// Initial loading of data
onMounted(() => {
  getItems();
  getIsFavorite();
  getIsCart();
});
</script>

<template>
  <div class="text-2xl test-light text-gray-800 p-10">Today's best</div>

  <div class="max-w-[95%] mx-auto relative">
    <Carousel class="w-full max-w-[80vw] mx-auto">
      <div class="absolute -top-5 right-20">
        <CarouselPrevious />
        <CarouselNext />
      </div>
      <CarouselContent>
        <CarouselItem
          v-for="meal in meals"
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
