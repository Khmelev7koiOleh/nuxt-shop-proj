<script setup lang="ts">
import { ref, onMounted, watchEffect } from "vue";

import {
  DB_ID,
  COLLECTION_MEALS,
  COLLECTION_FAVORITES,
  COLLECTION_CART,
  COLLECTION_ORDERS,
  STORAGE_ID,
} from "@/app.constants";
import { account, DB, storage } from "@/lib/appwrite";
import { useMutation } from "@tanstack/vue-query";
import { v4 as uuid } from "uuid";
import { useForm } from "vee-validate";
import type { IMeals } from "~/types/order.types";
import { useFavoritesStore } from "~/store/createDocument.store";
import { useRouter } from "vue-router";
import { openOrder, useMakeOrderStore } from "./make-order.store";
import { useDefineCard } from "@/composables/defineCard";
import { useGetCarts } from "@/composables/useGetCarts";
import { useTransferToOrder } from "@/composables/transferToOrder";
import { useDeleteCartMeal } from "@/composables/useDeleteCartMeal";

const { name, price, description, image, user } = useDefineCard();

const {
  data,
  isLoading: isLoadingCarts,
  isError: isErrorCarts,
  totalItems,
  totalPrice,
} = useGetCarts();

const {
  mutate: transferCartToOrders,
  isPending: isPendingTransfer,
  isError: isErrorTransfer,
} = useTransferToOrder();
const router = useRouter();

const {
  mutate: deleteCartMeal,
  isPending: isPendingDelete,
  isError: isErrorDelete,
} = useDeleteCartMeal();

// store
const cDStore = useFavoritesStore();
const mDStore = useMakeOrderStore();
// Input references and error handling

const cartMap = ref<{ [mealId: string]: boolean }>({});

const favoriteMap = ref<{ [mealId: string]: boolean }>({});

// const user = ref("");
// Loading and async state
const isProcessing = ref(false);

const getUser = async () => {
  try {
    user.value = (await account.get()).email;
  } catch (error) {
    console.error("Error fetching user:", error);
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

// Initial loading of data
onMounted(() => {
  getUser();
});
</script>

<template>
  <div class="flex flex-col md:flex-row justify-end items-center relative">
    <div @click="openOrder = !openOrder" class="absolute top-4 left-4">
      <Icon :name="'ion:close'" class="w-8 h-8 text-bold text-white" />
    </div>

    <div class="w-full flex justify-end items-center p-6">
      <Icon
        :name="'fluent:receipt-28-regular'"
        class="w-5 h-5 text-bold text-white"
      />
      <div class="text-white text-lg md:text-lg">Total: {{ totalPrice }}</div>
    </div>
  </div>
  <section class="w-full h-full">
    <div class="py-10"></div>
    <div class="border-t"></div>
    <div class="max-w-[95%] mx-auto relative">
      <div v-for="cart in data" :key="cart.$id" :wrap-around="true">
        <div
          class="w-[95%] h-full flex flex-col items-center justify-center bg-transparent py-4 mx-auto m-4 border-b"
        >
          <div
            class="w-full flex flex-col items-center text-xl md:text-2xl wrap-text"
          >
            <p>{{ cart.name }}</p>
          </div>
          <img :src="cart.image" class="max-w-[100%]" alt="Meal image" />
          <p class="text-md md:text-xl wrap-text">Price: {{ cart.price }}</p>
          <div class="flex gap-4 p-2">
            <button @click="makeCart(cart)">
              <div
                class="flex items-center justify-center cursor-pointer border border-red-400 text-red-400 p-2 rounded-full"
              >
                <Icon
                  @click="deleteCartMeal(cart.$id)"
                  :name="'ion:cart'"
                  class="w-5 h-5 text-bold"
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    <NuxtLink
      to="/"
      v-if="data?.length === 0"
      class="text-white text-xl w-full h-full flex flex-col items-center justify-center my-10 gap-8"
    >
      <p class="text-black">Cart is empty</p>
      <div
        class="flex flex-col items-center justify-center py-4 px-8 bg-gray-900 rounded-lg"
      >
        <div class="text-2xl flex items-center justify-center">
          Add to cart
          <Icon :name="'ion:cart'" :size="30" />
        </div>
      </div>
    </NuxtLink>

    <div
      v-if="data?.length"
      class="w-full flex items-center justify-center py-10"
    >
      <button
        @click="transferCartToOrders()"
        class="w-[80%] flex items-center justify-center cursor-pointer text-sm md:text-lg bg-white text-gray-900 border border-blue-900 p-2 rounded-md md:rounded-lg"
      >
        Make an order
      </button>
    </div>
  </section>
</template>

<style scoped>
.wrap-text {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-all;
  width: 100%;
  text-align: center;
}
</style>
