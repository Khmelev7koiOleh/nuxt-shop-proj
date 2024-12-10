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

// Input references and error handling
const titleRef = ref("");
const fileRef = ref<File | null>(null);
const errorMessage = ref<string | null>(null);
const isLoading = ref(false);
const orders = ref<IOrder[]>([]);

// Handle file change
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    fileRef.value = target.files[0];
  } else {
    fileRef.value = null;
  }
};

// Reset form
const resetForm = () => {
  titleRef.value = "";
  fileRef.value = null;
  isLoading.value = false;
  errorMessage.value = null;
};

// Fetch orders
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

// Upload image
const uploadImage = async () => {
  if (!fileRef.value) {
    errorMessage.value = "No file selected.";
    return null;
  }

  try {
    const file = await storage.createFile(STORAGE_ID, uuid(), fileRef.value);
    return file;
  } catch (error) {
    console.error("Error uploading file:", error);
    errorMessage.value = "File upload failed.";
    return null;
  }
};

// Use form with validation
const { handleSubmit } = useForm<IOrder>();
const mutation = useMutation({
  mutationKey: ["orders", titleRef.value],
  mutationFn: async () => {
    const uploadedFile = await uploadImage();
    if (!uploadedFile) throw new Error("File upload failed.");

    const imageURL = storage.getFileView(STORAGE_ID, uploadedFile.$id);
    return DB.createDocument(DB_ID, COLLECTION_ORDERS, uuid(), {
      title: titleRef.value,
      image: imageURL,
      $createdAt: new Date().toISOString(),
    });
  },
  onSuccess: () => {
    console.log("Order created successfully.");
    resetForm();
    getItems(); // Refresh orders
  },
  onError: (error) => {
    console.error("Error creating order:", error);
    errorMessage.value = "Order creation failed.";
  },
});

// Form submission
const onSubmit = handleSubmit(() => {
  isLoading.value = true;
  mutation.mutate();
});

onMounted(() => {
  getItems();
});
</script>

<template>
  <div class="p-4 bg-slate-500 mb-20">
    <input type="text" v-model="titleRef" placeholder="Title" />
    <input type="file" @change="handleFileChange" />
    <button @click="onSubmit" type="submit">Submit</button>
    <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
  </div>

  <div class="text-2xl test-light text-gray-800 p-10">Today's best</div>

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
  </div>
</template>

<style scoped>
/* Add your styles here */
</style>
