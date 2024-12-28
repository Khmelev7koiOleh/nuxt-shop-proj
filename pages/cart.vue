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
import { useSidebarStore } from "~/store/sidebarStore";
import { useGetFavorites } from "~/composables/useGetFavorites";

import { useAuthStore } from "~/store/auth.store";
import { fetchUserData } from "~/composables/fetchUserData"; // Import the function
import type { IAuthStore } from "~/store/auth.store";
import { get, set } from "@vueuse/core";

import { useMealMutations } from "@/composables/useFavoriteToggle";

// composables

const {
  data: cart,
  isLoading: isLoadingCart,
  isError: isErrorCart,
  totalItems,
} = useGetCarts();

const {
  mutate: deleteCartMeal,
  isPending: isPendingDelete,
  isError: isErrorDelete,
} = useDeleteCartMeal();

const { data, isLoading: isLoadingGet, isError: isErrorGet } = useGetMeals();
const { data: cartData } = useGetCarts();
const { data: favoritesData } = useGetFavorites();

const {
  toggleCartMutation,
  toggleFavoriteMutation,
  cartMap,
  favoriteMap,
  favorites,
} = useMealMutations();
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
const { onOrderSidebarOpen } = useSidebarStore();
// Input references and error handling
const nameRef = ref("");
const priceRef = ref(0);
const fileRef = ref<File | null>(null);
const errorMessage = ref<string | null>(null);
const isLoading = ref(false);
const meals = ref<IMeals[]>([]);

const carts = ref<IMeals[]>([]);

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

const removeFromCart = async (id: string) => {
  try {
    await DB.deleteDocument(DB_ID, COLLECTION_CART, id);
    carts.value = carts.value.filter((cart) => cart.$id !== id);
    delete cartMap.value[id];
    // total.value = carts.value.length;
  } catch (error) {
    console.error("Error deleting blog:", error);
  }
};
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
watch(
  () => carts,
  async () => {
    await setTimeout(() => {}, 1500);
    console.log(carts);
  }
);
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

    <div class="flex justify-end items-end">
      <div
        v-if="!openOrder"
        @click="openOrder = !openOrder"
        class="fixed top-[4%] right-[4%] z-50 py-5 px-10 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-4 cursor-pointer hover:bg-blue-600 transition-all duration-300"
      >
        <Icon :name="'fluent:receipt-28-regular'" class="w-5 h-5 text-bold" />
        <div>Make an order: {{ totalItems }}</div>
      </div>
      <div
        class="md:translate-x-[100px] w-1/4 h-full fixed top-0 right-0 z-50 overflow-auto bg-gray-900 text-white transition-all duration-700"
        :class="openOrder ? 'md:translate-x-[10px]' : 'md:translate-x-[400px]'"
      >
        <OrderMakeAnOrder />
      </div>
    </div>

    <div class="py-10"></div>
    <div v-if="data?.length === 0">Add something to your cart</div>
    <div v-else class="max-w-[95%] flex flex-wrap mx-auto">
      <div
        v-for="cart in cart"
        :key="cart.$id"
        class="basis-1/4"
        :wrap-around="true"
      >
        <NuxtLink
          :href="`/edit/${cart.mealId}`"
          v-if="cart.user === cDStore.user.email"
          class="max-w-[95%] h-full flex flex-col items-center justify-between bg-gray-900 text-gray-200 rounded-3xl py-4 border border-white relative"
        >
          <div class="w-full flex flex-col items-center">
            <p class="text-xl">{{ cart.name }}</p>
          </div>
          <img :src="cart.image" alt="Meal image" />
          <p class="text-xl">Price: {{ cart.price }}</p>
          <div class="flex gap-4 p-2 absolute top-2 left-2">
            <button @click.prevent="toggleCartMutation.mutate(cart)">
              <div
                class="flex items-center justify-center cursor-pointer border border-red-400 text-red-400 p-2 rounded-full"
              >
                <Icon
                  @click.prevent="deleteCartMeal(cart.$id)"
                  :name="'ion:cart'"
                  class="w-5 h-5 text-bold"
                />
              </div>
            </button>
          </div>
        </NuxtLink>
      </div>
    </div>
    <div class="py-20"></div>
  </section>
</template>

<style scoped>
/* Add your styles here */
</style>
