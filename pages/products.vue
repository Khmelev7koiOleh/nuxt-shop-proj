<script setup lang="ts">
import { ref, onMounted } from "vue";

import { DB_ID, COLLECTION_ORDERS, STORAGE_ID } from "@/app.constants";
import { DB, storage } from "@/lib/appwrite";
import { useMutation } from "@tanstack/vue-query";
import { v4 as uuid } from "uuid";
import { useForm } from "vee-validate";
import type { IOrder } from "~/types/order.types";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const errorMessage = ref<string | null>(null);
const isLoading = ref(false);
const orders = ref<IOrder[]>([]);

const getItems = async () => {
  try {
    const response = await DB.listDocuments(DB_ID, COLLECTION_ORDERS);
    if (response.documents.length === 0) {
      errorMessage.value = "No blogs available.";
    } else {
      orders.value = response.documents.map((document) => ({
        $id: document.$id,
        title: document.title,
        $createdAt: document.$createdAt,
        image: document.image,
      })) as IOrder[];

      orders.value.sort((a, b) => {
        const dateA = new Date(a.$createdAt);
        const dateB = new Date(b.$createdAt);
        return dateB.getTime() - dateA.getTime();
      });
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
    errorMessage.value = "An error occurred while fetching blogs.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getItems();
});
</script>
<template>
  <div class="text-2xl test-light text-gray-800 p-10">Best</div>

  <div class="max-w-[95%] mx-auto relative">
    <Carousel>
      <div class="absolute top-0 right-20">
        <CarouselPrevious />
        <CarouselNext />
      </div>
      <CarouselContent>
        <CarouselItem
          v-for="order in orders"
          :key="order.$id"
          class="basis-1/3"
          :wrap-around="true"
        >
          <div>
            <img :src="order.image" alt="Order image" />
            <p>{{ order.title }}</p>
          </div>
        </CarouselItem>
      </CarouselContent>
    </Carousel>

    <!-- make a card for every single element of  the collection -->
  </div>
</template>

<style scoped></style>
