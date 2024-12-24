<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { DB_ID, COLLECTION_MEALS } from "@/app.constants";
import { DB } from "@/lib/appwrite";
import type { IMeals } from "~/types/order.types";

const emit = defineEmits(["updateOrders"]);
const errorMessage = ref<string | null>(null);

// Define refs for meal data and loading/error states
const meal = ref<IMeals[]>([]);
const isLoading = ref(true);

// State to control the filter visibility
const onOpen = ref(false);
const searchQuery = ref("");

// Props
const props = defineProps<{
  data: IMeals[];
}>();

// Watch for changes in orders prop
watch(
  () => props.data,
  (newOrders, oldOrders) => {
    console.log("Orders updated:", newOrders); // Logs the updated orders whenever it changes
    console.log("Previous orders:", oldOrders); // Logs the previous orders
  },
  { immediate: true } // Runs immediately on mount
);

// Filter functions
const onCheapFilter = () => {
  const sortedOrders = [...props.data].sort((a, b) => a.price - b.price);
  console.log("Cheap filter applied:", sortedOrders); // Log filtered orders
  emit("updateOrders", sortedOrders);
  onOpen.value = false;
};

const onExpensiveFilter = () => {
  const sortedOrders = [...props.data].sort((a, b) => b.price - a.price);
  console.log("Expensive filter applied:", sortedOrders); // Log filtered orders
  emit("updateOrders", sortedOrders);
  onOpen.value = false;
};

const onNewestFilter = () => {
  const sortedOrders = [...props.data].sort((a, b) => {
    const dateA = new Date(a.$createdAt);
    const dateB = new Date(b.$createdAt);
    return dateB.getTime() - dateA.getTime();
  });
  console.log("Newest filter applied:", sortedOrders); // Log filtered orders
  emit("updateOrders", sortedOrders);
  onOpen.value = false;
};

const onOldestFilter = () => {
  const sortedOrders = [...props.data].sort((a, b) => {
    const dateA = new Date(a.$createdAt);
    const dateB = new Date(b.$createdAt);
    return dateA.getTime() - dateB.getTime();
  });
  console.log("Oldest filter applied:", sortedOrders); // Log filtered orders
  emit("updateOrders", sortedOrders);
  onOpen.value = false;
};

const onBurgerFilter = () => {
  const filteredOrders = props.data.filter(
    (data) => data.category === "burger"
  );
  console.log("Burger filter applied:", filteredOrders); // Log filtered orders
  emit("updateOrders", filteredOrders);
  onOpen.value = false;
};

const onSetFilter = () => {
  const filteredOrders = props.data.filter((data) => data.category === "set");
  console.log("Set filter applied:", filteredOrders); // Log filtered orders
  emit("updateOrders", filteredOrders);
  onOpen.value = false;
};

const onVeganFilter = () => {
  const filteredOrders = props.data.filter((data) => data.category === "vegan");
  console.log("Vegan filter applied:", filteredOrders); // Log filtered orders
  emit("updateOrders", filteredOrders);
  onOpen.value = false;
};

const onDietFilter = () => {
  const filteredOrders = props.data.filter((data) => data.category === "diet");
  console.log("Diet filter applied:", filteredOrders); // Log filtered orders
  emit("updateOrders", filteredOrders);
  onOpen.value = false;
};

// SearchQuery function
const onSearchQuery = () => {
  const filteredOrders = props.data.filter((data) =>
    data.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
  console.log("Search query applied:", filteredOrders); // Log filtered orders
  emit("updateOrders", filteredOrders);
};

const resetFilter = () => {
  const sortedOrders = [...props.data].sort((a, b) => {
    const dateA = new Date(a.$createdAt);
    const dateB = new Date(b.$createdAt);
    return dateB.getTime() - dateA.getTime();
  });
  console.log("Reset filter applied:", sortedOrders); // Log filtered orders
  emit("updateOrders", sortedOrders);
  onOpen.value = false;
};

// Check if the orders are received correctly
onMounted(() => {
  console.log("Mounted orders:", props.data); // Check if orders are passed from the parent
});
</script>

<template>
  <section class="w-[90%] flex flex-col justify-end items-end gap-8">
    <!-- Toggle Button -->
    <div class="relative">
      <Icon
        name="ion:filter"
        @click="onOpen = !onOpen"
        class="w-8 h-8 cursor-pointer text-bold absolute top-0 right-0 transform hover:scale-110 transition duration-200"
        :class="onOpen ? 'rotate-180' : 'rotate-0'"
      />
    </div>

    <!-- Filter Panel -->
    <div
      class="fixed top-[100%] right-0 transform translate-y-[-100%] transition-all duration-500 ease-in-out z-50"
      :class="
        onOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      "
    >
      <div
        class="w-[300px] h-[70vh] border p-8 rounded-xl bg-black text-white shadow-lg"
      >
        <div class="flex flex-col gap-5">
          <div class="flex gap-6 border-b">
            <div class="font-light text-xl text-center">
              <Icon name="ion:search" class="w-6 h-6" />
            </div>
            <input
              @input="onSearchQuery"
              v-model="searchQuery"
              class="bg-transparent outline-none"
              type="text"
              placeholder="Search..."
            />
          </div>
          <div class="flex flex-col items-center justify-center gap-6">
            <button @click="onCheapFilter">Cheap</button>
            <button @click="onExpensiveFilter">Expensive</button>
          </div>
          <div class="border-b"></div>
          <button @click="onNewestFilter">Newest</button>
          <button @click="onOldestFilter">Oldest</button>
          <div class="border-b"></div>
          <button @click="onVeganFilter">Vegan meat</button>
          <button @click="onBurgerFilter">Burger</button>
          <button @click="onSetFilter">Set</button>
          <button @click="onDietFilter">Diet</button>
          <button class="bg-red-500 rounded-lg" @click="resetFilter">
            Reset Filter
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Add your custom styles here */
</style>
