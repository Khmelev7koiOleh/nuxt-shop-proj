<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  DB_ID,
  COLLECTION_ORDERS,
  STORAGE_ID,
  COLLECTION_MEALS,
  COLLECTION_FAVORITES,
  COLLECTION_CART,
} from "@/app.constants";
import { account, DB, storage } from "@/lib/appwrite";
import { useMutation } from "@tanstack/vue-query";
import { v4 as uuid } from "uuid";
import { useForm } from "vee-validate";
import type { IMeals } from "~/types/order.types";

// Refs for form and state management
const nameRef = ref("");
const priceRef = ref(0);
const fileRef = ref<File | null>(null);
const descriptionRef = ref("");
const selectedCategory = ref("");
const errorMessage = ref<string | null>(null);
const isLoading = ref(false);
const orders = ref<IMeals[]>([]);
const filteredOrders = ref<IMeals[]>([]); // For filtered orders
const onOpen = ref(false);
const isAdmin = ref(false);

// Admin check
const ifAdmin = async () => {
  const user = await account.get();
  if (user && user.email === "admin@gmail.com") {
    isAdmin.value = true;
  } else {
    isAdmin.value = false;
  }
};

// Fetch items from DB
const getItems = async () => {
  try {
    const response = await DB.listDocuments(DB_ID, COLLECTION_MEALS);
    if (response.documents.length === 0) {
      errorMessage.value = "No products available.";
    } else {
      orders.value = response.documents.map((document) => ({
        $id: document.$id,
        name: document.name,
        price: document.price,
        $createdAt: document.$createdAt,
        image: document.image,
        category: document.category,
      })) as IMeals[];

      orders.value.sort((a, b) => {
        const dateA = new Date(a.$createdAt);
        const dateB = new Date(b.$createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      // Initialize filteredOrders with all items
      filteredOrders.value = [...orders.value];
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    errorMessage.value = "An error occurred while fetching products.";
  } finally {
    isLoading.value = false;
  }
};

// Handle filtering of orders
const handleUpdateOrders = (updatedOrders: IMeals[]) => {
  console.log("Updated orders in parent:", updatedOrders);
  filteredOrders.value = updatedOrders; // Update the filtered orders
};

// File handling
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    fileRef.value = target.files[0];
  } else {
    fileRef.value = null;
  }
};

// Form reset
const resetForm = () => {
  nameRef.value = "";
  fileRef.value = null;
  priceRef.value = 0;
  descriptionRef.value = "";
  selectedCategory.value = "";
  isLoading.value = false;
  errorMessage.value = null;
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
const { handleSubmit } = useForm<IMeals>();
const mutation = useMutation({
  mutationKey: ["meals", nameRef.value],
  mutationFn: async () => {
    const uploadedFile = await uploadImage();
    if (!uploadedFile) throw new Error("File upload failed.");

    const imageURL = storage.getFileView(STORAGE_ID, uploadedFile.$id);
    return DB.createDocument(DB_ID, COLLECTION_MEALS, uuid(), {
      name: nameRef.value,
      price: priceRef.value,
      image: imageURL,
      description: descriptionRef.value,
      category: selectedCategory.value,
      $createdAt: new Date().toISOString(),
    });
  },
  onSuccess: () => {
    console.log("Meal created successfully.");
    resetForm();
    getItems(); // Refresh meals
  },
  onError: (error) => {
    console.error("Error creating meal:", error);
    errorMessage.value = "Meal creation failed.";
  },
});

// Form submission
const onSubmit = handleSubmit(() => {
  isLoading.value = true;
  mutation.mutate();
});

// Delete order
const deleteOrder = async (id: string) => {
  try {
    await DB.deleteDocument(DB_ID, COLLECTION_MEALS, id);
    await DB.deleteDocument(DB_ID, COLLECTION_FAVORITES, id);
    await DB.deleteDocument(DB_ID, COLLECTION_CART, id);

    getItems(); // Refresh items after deletion
  } catch (error) {
    console.error("Error deleting order:", error);
  }
};

// Initialize onMounted lifecycle
onMounted(async () => {
  await getItems();
  ifAdmin();
});
</script>

<template>
  <div class="text-2xl test-light text-gray-800 p-10">All products</div>
  <div v-if="isAdmin" class="flex flex-col justify-center items-center gap-8">
    <div @click="onOpen = !onOpen" class="cursor-pointer">
      <Icon :name="onOpen ? 'uiw:close' : 'uiw:plus'" class="w-8 h-8" />
    </div>

    <div
      v-if="onOpen"
      class="p-4 bg-black mb-20 flex flex-col justify-center gap-6 w-1/3 rounded-2xl placeholder:text-white"
    >
      <input
        class="bg-transparent border-b border-b-white text-white outline-none"
        type="text"
        v-model="nameRef"
        placeholder="Title"
      />
      <input
        class="bg-transparent border-b border-b-white text-white outline-none"
        type="number"
        v-model="priceRef"
        placeholder="Price"
      />
      <select
        class="bg-transparent border-b border-b-white text-white placeholder:text-white"
        name="Category"
        v-model="selectedCategory"
      >
        <option value="burger">Burgers</option>
        <option value="set">Sets</option>
        <option value="vegan">For Vegans</option>
        <option value="diet">For Diet</option>
      </select>
      <input
        class="bg-transparent border-b border-b-white cursor-pointer"
        type="file"
        placeholder="File"
        @change="handleFileChange"
      />
      <textarea
        class="bg-transparent border-b border-b-white cursor-pointer text-white text-format outline-none"
        placeholder="Description"
        v-model="descriptionRef"
      ></textarea>
      <button
        @click="onSubmit"
        type="submit"
        class="w-full cursor-pointer border text-white my-2 rounded-sm p-1 hover:bg-gray-900"
      >
        Create
      </button>
      <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
    </div>
  </div>

  <!-- Filter Component to handle category-based filtering -->
  <Filter :orders="orders" @updateOrders="handleUpdateOrders" />

  <div class="max-w-[95%] mx-auto flex flex-wrap my-10">
    <UiCard
      v-for="order in filteredOrders"
      :key="order.$id"
      class="basis-1/4"
      :wrap-around="true"
    >
      <NuxtLink
        :href="`/edit/${order.$id}`"
        class="w-full h-full flex flex-col justify-between items-center border border-gray-300 rounded-3xl bg-black py-4 relative"
      >
        <div v-if="isAdmin" class="absolute top-4 left-4">
          <button
            @click.prevent="deleteOrder(order.$id)"
            class="bg-red-500 text-white p-1 flex items-center justify-center rounded-full"
          >
            <Icon :name="'ph:trash'" class="w-5 h-5 text-bold" />
          </button>
        </div>
        <div class="w-full h-full flex flex-col justify-between items-center">
          <p class="text-gray-100">{{ order.name }}</p>
          <img :src="order.image" alt="Order image" />
          <p class="text-gray-100">Price:{{ order.price }}</p>
        </div>
        <div class="py-4"></div>
        <div
          class="w-2/3 flex items-center justify-center bg-green-900 text-gray-100 rounded-lg py-1 px-2"
        >
          View
        </div>
      </NuxtLink>
    </UiCard>
  </div>
</template>
