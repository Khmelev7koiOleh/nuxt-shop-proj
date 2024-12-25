<script setup lang="ts">
import { ref, onMounted } from "vue";

import { DB_ID, COLLECTION_ORDERS, STORAGE_ID } from "@/app.constants";
import { DB, storage, account } from "@/lib/appwrite";
import { useMutation } from "@tanstack/vue-query";
import { v4 as uuid } from "uuid";
import { useForm } from "vee-validate";
import type { IMeals } from "~/types/order.types";
import { useGetOrders } from "@/composables/useGetOrders";

const {
  data,
  isLoading: isLoadingOrders,
  isError: isErrorOrders,
} = useGetOrders();

const errorMessage = ref<string | null>(null);
const isLoading = ref(false);
const orders = ref<IMeals[]>([]);

const isAdmin = ref(false);
const onAllowed = ref(false);
const user = ref({ email: "" });

// const getItems = async () => {
//   try {
//     const response = await DB.listDocuments(DB_ID, COLLECTION_ORDERS);
//     if (response.documents.length === 0) {
//       errorMessage.value = "No blogs available.";
//     } else {
//       orders.value = response.documents
//         .filter((document) => document.user === user.value.email)
//         .map((document) => ({
//           $id: document.$id,
//           name: document.name,
//           price: document.price,
//           user: document.user,
//           $createdAt: document.$createdAt,
//           image: document.image,
//         })) as IMeals[];
//       if (orders.value.length > 0) {
//         onAllowed.value = true;
//       }
//       orders.value.sort((a, b) => {
//         const dateA = new Date(a.$createdAt);
//         const dateB = new Date(b.$createdAt);
//         return dateB.getTime() - dateA.getTime();
//       });
//     }
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     errorMessage.value = "An error occurred while fetching orders.";
//   } finally {
//     isLoading.value = false;
//   }
// };

// onMounted(() => {
//   getItems();
// });

onMounted(async () => {
  const userEmail = await account.get();
  user.value = userEmail;
});
</script>
<template>
  <div class="text-2xl test-light text-gray-800 p-10">My order's history</div>

  <div class="max-w-[90%] mx-auto flex flex-col gap-4">
    <div v-for="order in data" :key="order.$id" class="basis-1/4">
      <div
        class="w-full h-full min-h-[90px] flex flex-wrap items-center justify-around gap-8 border border-gray-300 rounded-3xl bg-black py-4 hover:bg-gray-900"
      >
        <img :src="order.image" width="50" alt="Meal image" />
        <div class="text-white">
          <p>Name: {{ order.name }}</p>
        </div>

        <p class="text-gray-100">Price: {{ order.price }}</p>
      </div>
    </div>

    <!-- make a card for every single element of  the collection -->
  </div>
</template>

<style scoped></style>
