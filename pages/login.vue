<script setup lang="ts">
import {
  useAuthStore,
  useIsLoadingStore,
  useIsSidebarOpenStore,
} from "~/store/auth.store";
import { v4 as uuid } from "uuid";
import { ref, watch, onMounted } from "vue"; // Ensure to import these as needed
import { useRouter } from "vue-router";
import { account } from "~/lib/appwrite";
import { errorMessages } from "vue/compiler-sfc";
import { useGetItems } from "@/composables/getIAlltems";

useSeoMeta({
  title: "Login",
});

const { getItems, getIsCart, getIsFavorite } = useGetItems();
const isSidebarOpen = useIsSidebarOpenStore();
const emailRef = ref("");
const passwordRef = ref("");
const nameRef = ref("");

const isLoadingStore = useIsLoadingStore();
const authStore = useAuthStore();
const router = useRouter();
const errorMessage = ref<string | null>(null);

// Function to handle login
const login = async () => {
  try {
    isLoadingStore.set(true);
    await account.createEmailPasswordSession(emailRef.value, passwordRef.value);

    const response = await account.get();
    if (response) {
      authStore.set({
        email: response.email,
        status: true,
        name: response.name,
      });
      isSidebarOpen.set(true);
      await router.push("/");
    }
  } catch (error) {
    console.error("Login error:", error); // Handle error appropriately
    errorMessage.value = "Login failed. Please check your credentials.";
  } finally {
    isLoadingStore.set(false);
    await getItems();
    await getIsFavorite();
    await getIsCart();
  }
  // getItems()
};

// Function to handle registration
const register = async () => {
  try {
    isLoadingStore.set(true);
    await account.create(
      uuid(), // Generate a unique ID for the user
      emailRef.value, // Ensure email is correctly assigned to the second argument
      passwordRef.value, // Password as the third argument
      nameRef.value // Name as the optional fourth argument
    );
    await login();
    isSidebarOpen.set(true); // Log in automatically after registration
  } catch (error) {
    console.error("Registration error:", error); // Handle error appropriately
    errorMessage.value = "Registration failed.  Please check your credentials.";
  } finally {
    isLoadingStore.set(false);
  }
};

onMounted(async () => {
  await setTimeout(() => {
    getIsCart();
    getIsFavorite();
    getItems();
  }, 1500);
});
// Watcher for debugging email input (optional)
watch(isSidebarOpen, async () => {
  console.log("isSidebarOpen:", isSidebarOpen);
  await setTimeout(() => {
    getIsCart();
    getIsFavorite();
    getItems();
  }, 1500);
});
</script>

<template>
  <div class="p-10 flex justify-center items-center min-h-screen w-full">
    <div class="rounded bg-gray-900 w-1/4 p-5">
      <h1 class="text-2xl font-bold text-center mb-5 text-gray-100">Login</h1>

      <div class="text-red-500 flex justify-center">
        {{ errorMessage }}
      </div>
      <form>
        <UiInput
          v-model="emailRef"
          placeholder="Email"
          type="email"
          class="mb-4 placeholder:text-gray-300 text-white"
        />
        <UiInput
          v-model="passwordRef"
          placeholder="Password"
          type="password"
          class="mb-4 placeholder:text-gray-300 text-white"
        />
        <UiInput
          v-model="nameRef"
          placeholder="Name"
          type="text "
          class="mb-4 placeholder:text-gray-300 text-white"
        />
        <div class="flex justify-center items-center gap-5">
          <UiButton
            type="button"
            class="bg-gray-800 text-white rounded hover:bg-gray-700"
            @click="login"
            >Login</UiButton
          >
          <UiButton
            type="button"
            class="bg-gray-800 text-white rounded hover:bg-gray-700"
            @click="register"
            >Register</UiButton
          >
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
