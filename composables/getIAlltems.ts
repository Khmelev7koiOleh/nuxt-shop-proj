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
import {
  openOrder,
  useMakeOrderStore,
} from "~/components/order/make-order.store";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { set } from "@vueuse/core";

const router = useRouter();

// store
const cDStore = useFavoritesStore();
const mDStore = useMakeOrderStore();
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
const total = ref(0);
const onOrderSuccess = ref(false);
const favoriteMap = ref<{ [mealId: string]: boolean }>({});
const orderIsCompleted = ref(false);
const user = ref("");
// Loading and async state
const isProcessing = ref(false);

export function useGetItems() {
  const getUser = async () => {
    try {
      user.value = (await account.get()).email;
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

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
            $createdAt: document.$createdAt,
            image: document.image,
          })) as IMeals[];

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
  return {
    nameRef,
    priceRef,
    fileRef,
    errorMessage,
    isLoading,
    meals,
    favorites,
    cartMap,
    carts,
    total,
    getItems,
    getIsFavorite,
    getIsCart,
  };
}
