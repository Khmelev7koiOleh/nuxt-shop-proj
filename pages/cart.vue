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
import { useRemoveItem } from "~/composables/removeFrom";
import { useRouter } from "vue-router";
import { openOrder } from "~/components/order/make-order.store";
import { useGetCarts } from "@/composables/useGetCarts";
import { useGetMeals } from "~/composables/useGetMeals";
import { useDeleteCartMeal } from "~/composables/useDeleteCartMeal";

// composables

const {
  data,
  isLoading: isLoadingCart,
  isError: isErrorCart,
  totalItems,
} = useGetCarts();

const {
  mutate: deleteCartMeal,
  isPending: isPendingDelete,
  isError: isErrorDelete,
} = useDeleteCartMeal();

const filteredCarts = ref<IMeals[]>([]);
// Watch for changes in data and update filteredCarts
watchEffect(() => {
  filteredCarts.value = data.value || [];
});
// const { totalItems } = useTotalItems(filteredCarts.value);
const router = useRouter();

// store
const cDStore = useFavoritesStore();
const removeStore = useRemoveItem();
// Input references and error handling
const nameRef = ref("");
const priceRef = ref(0);
const fileRef = ref<File | null>(null);
const errorMessage = ref<string | null>(null);
const isLoading = ref(false);
const meals = ref<IMeals[]>([]);
const favorites = ref<IMeals[]>([]);
const cartMap = ref<{ [mealId: string]: boolean }>({});
const carts = ref<IMeals[]>([]);

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

const removeFromCart = async (id: string) => {
  try {
    await DB.deleteDocument(DB_ID, COLLECTION_CART, id);
    carts.value = carts.value.filter((cart) => cart.$id !== id);
    delete cartMap.value[id];
    // total.value = carts.value.length;
    getIsFavorite();
  } catch (error) {
    console.error("Error deleting blog:", error);
  }
};
// Check if a meal is in favorites
const checkIsCart = (mealId: string) => {
  return cartMap.value[mealId] || false; // Return false if not found
};
// Toggle favorite status
const makeCart = async (meal: IMeals) => {
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
// Toggle favorite status
const makeFavorite = async (meal: IMeals) => {
  if (isProcessing.value) return; // Prevent multiple clicks while processing
  isProcessing.value = true;
  console.log(meal);
  const IMealFavorite = checkIsFavorite(meal.$id);

  try {
    if (IMealFavorite) {
      await removeStore.removeFromFavorite(meal.$id); // Remove from favorites
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

// Initial loading of data
onMounted(() => {
  getItems();

  getIsFavorite();
  console.log(carts);
});

watch(
  () => carts,
  async () => {
    await setTimeout(() => {
      getIsFavorite();
    }, 1500);
    console.log(carts);
  }
);
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
  <section class="w-full h-full">
    <div class="text-3xl test-light text-gray-800 p-10 text-center">Cart</div>

    <div class="flex justify-end items-end m-10">
      <div
        v-if="!openOrder"
        @click="openOrder = !openOrder"
        class="py-5 px-10 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-4"
      >
        <Icon :name="'fluent:receipt-28-regular'" class="w-5 h-5 text-bold" />
        <div>Make an order: {{ totalItems }}</div>
      </div>
      <div
        v-if="openOrder"
        class="w-[calc(100%-75%)] h-full fixed top-0 right-0 z-50 bg-gray-400 overflow-auto"
      >
        <OrderMakeAnOrder />
      </div>
    </div>

    <div class="py-10"></div>
    <div v-if="data?.length === 0">Add something to your cart</div>
    <div v-else class="flex flex-wrap">
      <div
        v-for="cart in data"
        :key="cart.$id"
        class="basis-1/3"
        :wrap-around="true"
      >
        <div
          v-if="cart.user === cDStore.user.email"
          class="w-full h-full flex flex-col items-center justify-between"
        >
          <div class="w-full flex flex-col items-center">
            <p>{{ cart.name }}</p>
            <p>{{ cart.price }}</p>
          </div>
          <img :src="cart.image" alt="Meal image" />

          <div class="flex gap-4 p-2">
            <button
              @click="makeFavorite(cart)"
              class="flex items-center justify-center cursor-pointer border border-gray-400 p-2 rounded-full"
            >
              <Icon
                :name="
                  checkIsFavorite(cart.$id)
                    ? 'radix-icons:heart-filled'
                    : 'radix-icons:heart'
                "
                class="w-5 h-5 text-bold"
              />
            </button>
            <button @click="makeCart(cart)">
              <div
                class="flex items-center justify-center cursor-pointer border border-gray-400 p-2 rounded-full"
              >
                <Icon
                  @click.prevent="deleteCartMeal(cart.$id)"
                  :name="'ion:cart'"
                  class="w-5 h-5 text-bold"
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="py-20"></div>
  </section>
</template>

<style scoped>
/* Add your styles here */
</style>
