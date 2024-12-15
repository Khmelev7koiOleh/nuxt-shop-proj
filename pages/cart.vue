<script setup lang="ts">
import { ref, onMounted, watchEffect } from "vue";

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

const getIsCart = async () => {
  try {
    const response = await DB.listDocuments(DB_ID, COLLECTION_CART);
    if (response.documents.length === 0) {
      errorMessage.value = "No favorites available.";
    } else {
      carts.value = response.documents.map((document) => ({
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

// Fetch favorites and update favorite map
// const getIsFavorite = async () => {
//   try {
//     const response = await DB.listDocuments(DB_ID, COLLECTION_CART);
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

// Handle file change
// const handleFileChange = (event: Event) => {
//   const target = event.target as HTMLInputElement;
//   if (target.files && target.files.length > 0) {
//     fileRef.value = target.files[0];
//   } else {
//     fileRef.value = null;
//   }
// };

// Reset form
// const resetForm = () => {
//   nameRef.value = "";
//   fileRef.value = null;
//   isLoading.value = false;
//   errorMessage.value = null;
// };

// // Upload image
// const uploadImage = async () => {
//   if (!fileRef.value) {
//     errorMessage.value = "No file selected.";
//     return null;
//   }

//   try {
//     const file = await storage.createFile(STORAGE_ID, uuid(), fileRef.value);
//     return file;
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     errorMessage.value = "File upload failed.";
//     return null;
//   }
// };

// Use form with validation
// const { handleSubmit } = useForm<IMeals>();
// const mutation = useMutation({
//   mutationKey: ["meals", nameRef.value],
//   mutationFn: async () => {
//     const uploadedFile = await uploadImage();
//     if (!uploadedFile) throw new Error("File upload failed.");

//     const imageURL = storage.getFileView(STORAGE_ID, uploadedFile.$id);
//     return DB.createDocument(DB_ID, COLLECTION_MEALS, uuid(), {
//       name: nameRef.value,
//       price: priceRef.value,
//       image: imageURL,
//       $createdAt: new Date().toISOString(),
//     });
//   },
//   onSuccess: () => {
//     console.log("Meal created successfully.");
//     resetForm();
//     getIsCart(); // Refresh meals
//   },
//   onError: (error) => {
//     console.error("Error creating meal:", error);
//     errorMessage.value = "Meal creation failed.";
//   },
// });

// Form submission
// const onSubmit = handleSubmit(() => {
//   isLoading.value = true;
//   mutation.mutate();
// });

// Initial loading of data
onMounted(() => {
  getItems();
  getIsCart();
  getIsFavorite();
});

// watch(
//   () => carts.value,
//   async () => {
//     await setTimeout(() => {
//       getIsCart();
//       getIsFavorite();
//     }, 1500);
//   }
// );
const setTimeoutFunction = () => {
  setTimeout(() => {
    getIsCart();
  }, 1500);
};
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
        <div>Make an order: {{ total }}</div>
      </div>
      <div
        v-if="openOrder"
        class="w-[calc(100%-75%)] h-full fixed top-0 right-0 z-50 bg-gray-400 overflow-auto"
      >
        <OrderMakeAnOrder />
      </div>
    </div>

    <div class="py-10"></div>
    <div v-if="carts.length > 0" class="max-w-[95%] mx-auto relative">
      <Carousel>
        <div class="absolute -top-5 right-20">
          <CarouselPrevious />
          <CarouselNext />
        </div>
        <CarouselContent>
          <CarouselItem
            v-for="cart in carts"
            :key="cart.$id"
            class="basis-1/3"
            :wrap-around="true"
          >
            <div
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
                      @click="
                        async () => {
                          await cDStore.removeFromCart(cart.$id);
                          setTimeoutFunction();
                        }
                      "
                      :name="'ion:cart'"
                      class="w-5 h-5 text-bold"
                    />
                  </div>
                </button>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
    <div v-else>Add something to your cart</div>
    <div class="py-40"></div>
  </section>
</template>

<style scoped>
/* Add your styles here */
</style>
