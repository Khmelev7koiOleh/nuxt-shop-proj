<script setup lang="ts">
import {
  useAuthStore,
  useIsLoadingStore,
  useIsSidebarOpenStore,
} from "~/store/auth.store";
import { v4 as uuid } from "uuid";
import { useSeoMeta, useRouter, ref, watch } from "#imports";
import { account } from "~/lib/appwrite";
import { useMutation } from "@tanstack/vue-query";
import { useLogin } from "~/composables/useLogin";
import { useRegister } from "~/composables/useRegister";

const { mutate: loginMutate } = useLogin();
const { mutate: registerMutate } = useRegister();

const backup = ref(false);
// Example usage:

useSeoMeta({
  title: "Login",
});
const login = () => {
  loginMutate({ email: emailRef.value, password: passwordRef.value });
};

const register = () => {
  registerMutate({
    email: emailRef.value,
    password: passwordRef.value,
    name: nameRef.value,
  });
};
const logAsAdmin = () => {
  loginMutate({ email: "admin@gmail.com", password: "11111111" });
};
const isSidebarOpen = useIsSidebarOpenStore();
const emailRef = ref("");
const passwordRef = ref("");
const nameRef = ref("");

const isLoadingStore = useIsLoadingStore();
const authStore = useAuthStore();
const router = useRouter();
const errorMessage = ref<string | null>(null);

onMounted(() => {
  if (performance.navigation.type === 1) {
    isSidebarOpen.set(true);
  }
});

// Watcher for debugging (optional)
watch(isSidebarOpen, () => {
  console.log("isSidebarOpen:", isSidebarOpen);
});
</script>

<template>
  <div class="p-10 flex justify-center items-center min-h-screen w-full">
    <div class="rounded bg-gray-900 w-full md:w-1/4 p-5">
      <h1 class="text-2xl font-bold text-center mb-5 text-gray-100">Login</h1>

      <!-- Error message display -->
      <div v-if="errorMessage" class="text-red-500 flex justify-center mb-4">
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
        <!-- Only show name input for registration -->
        <UiInput
          v-if="!authStore.isAuth"
          v-model="nameRef"
          placeholder="Name"
          type="text"
          class="mb-4 placeholder:text-gray-300 text-white"
        />
        <div class="flex justify-center items-center gap-5">
          <div
            @click="logAsAdmin"
            class="text-white flex bg-gray-800 t rounded hover:bg-gray-700 px-2 py-1"
          >
            <Icon name="ion:key" class="w-6 h-6" />
            <p>Admin</p>
          </div>
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
