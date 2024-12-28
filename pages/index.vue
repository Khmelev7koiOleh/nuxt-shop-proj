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
const {
  data: newest,
  isLoading: isLoadingGet,
  isError: isErrorNewestGet,
} = useGetNewestMeals();
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
const randomImage = ref("");
const randomImageTwo = ref("");
const randomImageThree = ref("");
const randomDataImages = ref({
  url: "./output (3).jpg",
  url2: "./output (4).jpg",
  url3: "./output (7).jpg",
  url4: "./output.jpg",
  url5: "./output (1).jpg",
  url6: "./5dollar_MealDeal_COM_1PUB_Meal_1-column-desktop.jpeg",
  url7: "./f39ef68a4f1d6417cf34072991c4306225f66e9a-2000x1000.webp",
  url8: "./DALL·E 2024-12-28 04.42.20 - A vibrant and visually appealing fast food menu layout displayed on a digital screen, featuring sections for burgers, fries, drinks, and desserts. Eac.webp",
});
const randomDataImagesTwo = ref({
  url: "./output (3).jpg",
  url2: "./output (4).jpg",
  url3: "./output (7).jpg",
  url4: "./output.jpg",
  url5: "./output (1).jpg",
  url6: "./5dollar_MealDeal_COM_1PUB_Meal_1-column-desktop.jpeg",
  url7: "./f39ef68a4f1d6417cf34072991c4306225f66e9a-2000x1000.webp",
  url8: "./DALL·E 2024-12-28 04.42.20 - A vibrant and visually appealing fast food menu layout displayed on a digital screen, featuring sections for burgers, fries, drinks, and desserts. Eac.webp",
});
const randomDataImagesThree = ref({
  url: "./output (3).jpg",
  url2: "./output (4).jpg",
  url3: "./output (7).jpg",
  url4: "./output.jpg",
  url5: "./output (1).jpg",
  url6: "./5dollar_MealDeal_COM_1PUB_Meal_1-column-desktop.jpeg",
  url7: "./f39ef68a4f1d6417cf34072991c4306225f66e9a-2000x1000.webp",
  url8: "./DALL·E 2024-12-28 04.42.20 - A vibrant and visually appealing fast food menu layout displayed on a digital screen, featuring sections for burgers, fries, drinks, and desserts. Eac.webp",
});
const isProcessing = ref(false);

// // Handle adding/removing favorites

const checkIsFavorite = (mealId: string) => {
  return favoriteMap.value[mealId] || false;
};
const checkIsCart = (mealId: string) => {
  return cartMap.value[mealId] || false;
};

const swipeToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
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

  randomImage.value = Object.values(randomDataImages.value)[
    Math.floor(Math.random() * Object.keys(randomDataImages.value).length)
  ];

  randomImageTwo.value = Object.values(randomDataImagesTwo.value)[
    Math.floor(Math.random() * Object.keys(randomDataImagesTwo.value).length)
  ];
});

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
const randomImageInterval = setInterval(() => {
  randomImageTwo.value = Object.values(randomDataImagesTwo.value)[
    Math.floor(Math.random() * Object.keys(randomDataImagesTwo.value).length)
  ];
  randomImage.value = Object.values(randomDataImages.value)[
    Math.floor(Math.random() * Object.keys(randomDataImages.value).length)
  ];
  randomImageThree.value = Object.values(randomDataImagesThree.value)[
    Math.floor(Math.random() * Object.keys(randomDataImagesThree.value).length)
  ];
}, 5000);
</script>

<template>
  <div class="text-3xl test-light text-gray-900 p-10 text-center">
    Dashboard
  </div>

  <div class="text-2xl test-light text-red-500 p-10">Newest</div>

  <div v-if="!data" class="w-[95vw] flex justify-center items-center">
    <div class="text-red-500">{{ errorMessage }}</div>
  </div>

  <div class="relative max-w-[95%] mx-auto">
    <Carousel>
      <div class="absolute -top-10 right-20 text-black">
        <CarouselPrevious class="bg-black text-gray-100" />
        <CarouselNext class="bg-black text-gray-100" />
      </div>
      <CarouselContent class="max-w-[95vw]">
        <CarouselItem
          v-for="meal in newest"
          :key="meal.$id"
          class="basis-1/5"
          :wrap-around="true"
        >
          <NuxtLink
            :to="`/edit/${meal.$id}`"
            class="w-full h-full flex flex-col border items-center justify-between rounded-3xl py-2 bg-gray-900 text-gray-100"
          >
            <div
              class="w-[95%] h-full flex flex-col items-center justify-between"
            >
              <p class="text-2xl font-mono">{{ meal.name }}</p>

              <img :src="meal.image" alt="Meal image" />
              <p class="py-2 text-xl">Price:{{ meal.price }}</p>
            </div>
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

  <div class="py-20">
    <div class="text-2xl test-light text-gray-800 p-10">What is new?</div>
    <NuxtLink to="/products" class="w-full">
      <div class="basis-8 flex flex-wrap justify-around">
        <img
          class="w-full object-cover max-w-[30vw] max-h-[50vh] mx-auto"
          :src="randomImage"
        />

        <img
          class="w-full object-cover max-w-[30vw] max-h-[50vh] mx-auto"
          :src="randomImageTwo"
        />

        <img
          class="w-full object-cover max-w-[30vw] max-h-[50vh] mx-auto"
          :src="randomImageThree"
        />
      </div>
    </NuxtLink>
  </div>
  <div class="text-2xl test-light text-gray-800 p-10">Best for you</div>
  <div class="relative max-w-[95%] mx-auto">
    <Carousel>
      <div class="absolute -top-10 right-20 text-black">
        <CarouselPrevious class="bg-black text-gray-100" />
        <CarouselNext class="bg-black text-gray-100" />
      </div>
      <CarouselContent class="max-w-[95vw]">
        <CarouselItem
          v-for="meal in data"
          :key="meal.$id"
          class="basis-1/5"
          :wrap-around="true"
        >
          <NuxtLink
            :to="`/edit/${meal.$id}`"
            class="w-full h-full flex flex-col border items-center justify-between rounded-3xl py-2 bg-gray-900 text-gray-100"
          >
            <div
              class="w-[95%] h-full flex flex-col items-center justify-between"
            >
              <p class="text-2xl font-mono">{{ meal.name }}</p>

              <img :src="meal.image" alt="Meal image" />
              <p class="py-2 text-xl">Price:{{ meal.price }}</p>
            </div>
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
  <div class="p-20"></div>
  <NuxtLink to="/products" class="w-[90%] flex justify-between gap-4 mx-auto">
    <div class="flex flex-col gap-4">
      <img src="../public/allFrom4.99.jpg" alt="" />
      <h2 class="text-2xl font-bold">All this from €4.99!</h2>
      <div class="text-md">
        Discover our new McSmart menus now! For example, with a double
        cheeseburger, medium fries and a drink for just €4.99*.
      </div>
      <div>
        <button
          class="text-bold bg-green-800 px-2 py-1 rounded-md text-white hover:bg-green-700"
        >
          Go to menu
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <img src="../public/plantBurger.jpg" alt="" />
      <h2 class="text-2xl font-bold">Plantastischer Geschmack</h2>
      <div class="text-md">
        Try our McPlant® with plant-based Beyond Meat Patty and the McPlant®
        Nuggets now. For a limited time only: the fruity and exotic McPlant®
        Mango Chili and the smoky and spicy McPlant® Tomato Chargrill!
      </div>
      <div>
        <button
          class="text-bold bg-green-800 px-2 py-1 rounded-md text-white hover:bg-green-700"
        >
          Go to menu
        </button>
      </div>
    </div>
  </NuxtLink>
  <div class="p-20"></div>
  <div
    @click="swipeToTop"
    class="py-10 bg-black w-full flex flex-col justify-center items-center"
  >
    <Icon
      :name="'radix-icons:arrow-up'"
      class="w-10 h-10 text-bold text-white"
    />
  </div>
</template>

<style scoped>
/* Add your styles here */
</style>
