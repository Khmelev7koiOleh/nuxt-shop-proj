<script setup lang="ts">
// Do not click cmd Z
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router"; // To get the route parameters
import { DB, storage, account } from "~/lib/appwrite"; // Assuming DB is set up correctly
import { COLLECTION_MEALS, DB_ID, STORAGE_ID } from "@/app.constants";
import type { IMeals } from "~/types/order.types";
import { useRouter } from "vue-router";

const onDelete = ref(false);
const router = useRouter();

import dayjs from "dayjs";

const user = ref({});

// Define refs for blog data and loading/error states
const meal = ref<IMeals | null>(null); // Single blog data instead of an array

const isLoading = ref(true);
const errorMessage = ref<string | null>(null);

// Get the route parameters to fetch the specific blog
const route = useRoute();
const mealId = route.params.id as string;

// Function to fetch the blog by ID from the DB
const getBlogById = async () => {
  try {
    const response = await DB.getDocument(DB_ID, COLLECTION_MEALS, mealId);
    if (response) {
      meal.value = {
        $id: response.$id,
        name: response.name,
        price: response.price,
        // description: response.description,
        image: response.image,
        $createdAt: response.$createdAt,
        // status: response.status,
        // documentId: response.$id,
      };
    } else {
      errorMessage.value = "Blog not found.";
    }
  } catch (error) {
    console.error("Error fetching blog:", error);
    errorMessage.value = "An error occurred while fetching the blog.";
  } finally {
    isLoading.value = false;
  }
};

const deleteCard = async () => {
  try {
    onDelete.value = true;

    await DB.deleteDocument(DB_ID, COLLECTION_MEALS, mealId);
    // await DB.deleteDocument(DB_ID, COLLECTION_COMMENTS, blogId);
    console.log("Blog deleted successfully.");
  } catch (error) {
    console.error("Error deleting blog:", error);
  }
  onDelete.value = false;
};

watch(meal && onDelete, async () => {
  await getBlogById(); // Ruf die Blogs erneut ab, wenn sie sich ändern
  router.push("/blog");
});
onMounted(async () => {
  getBlogById();
  const userData = await account.get();
  user.value = userData;
});
</script>

<template>
  <div class="px-4 py-2 overflow-x-hidden">
    <div v-if="isLoading" class="text-center py-4">Loading blog...</div>

    <div v-else-if="errorMessage" class="text-center py-4 text-red-500">
      {{ errorMessage }}
    </div>

    <div v-else class="gap-4 p-4 rounded-lg max-w-full box-border">
      <div class="flex justify-between gap-4 mx-auto mt-6 max-w-full">
        <NuxtLink to="/products">
          <Icon name="line-md:arrow-left" size="30" />
        </NuxtLink>

        <div class="flex justify-end mx-0 ml-0 gap-3">
          <div
            v-if="meal"
            class="rounded-md px-2 py-1 border-b border-gray-900 text-black inline-block"
          >
            {{ dayjs(meal.$createdAt).format("DD-MM-YYYY") }}
          </div>
          <!-- <button
            v-if="user.email === meal.user"
            class="flex rounded-md px-3 py-1 bg-red-600 text-white gap-2 items-center hover:bg-red-500 transition-all"
            @click="deleteCard"
          >
            <div>Delete</div>

            <Icon name="radix-icons:trash" size="20" />
          </button> -->
        </div>
      </div>

      <!-- Blog content -->
      <div v-if="meal" class="w-full flex gap-8 justify-around items-center">
        <div class="min-w-[45%]">
          <img :src="meal.image" alt="Blog Image" class="w-full" />
        </div>

        <div
          class="flex flex-col gap-8 text-base font-bold text-center break-words w-full text-black"
        >
          <h2 class="text-2xl font-bold text-center break-words w-full">
            {{ meal.name }}
          </h2>

          Price: {{ meal.price }}
        </div>
      </div>
    </div>
  </div>

  <!-- Comments -->
  <!-- <CommentsIComment /> -->
</template>

<style scoped>
html,
body {
  overflow-x: hidden; /* Prevents scrolling on the body */
}
</style>
