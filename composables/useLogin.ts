import { ref } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { account, DB } from "@/lib/appwrite"; // Assuming this is your Appwrite account and DB service
import { useAuthStore, useIsLoadingStore } from "~/store/auth.store"; // Assuming separate loading store
import { useRouter } from "vue-router";
import { v4 as uuid } from "uuid";
import {
  DB_ID,
  COLLECTION_MEALS,
  COLLECTION_FAVORITES,
  STORAGE_ID,
  COLLECTION_CART,
} from "@/app.constants";

import { Query } from "appwrite";

import { useForm } from "vee-validate";
import type { IMeals } from "~/types/order.types";

// Create a custom mutation for login
export function useLogin() {
  const router = useRouter();
  const isLoadingStore = useIsLoadingStore(); // Assuming this is your loading store
  const authStore = useAuthStore(); // Assuming this is your auth store
  const errorMessage = ref<string | null>(null);

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      await account.createEmailPasswordSession(email, password);

      const response = await account.get();
      if (response) {
        authStore.set({
          email: response.email,
          status: true,
          name: response.name,
        });
      }
    },
    onMutate() {
      isLoadingStore.set(true);
    },
    onSuccess() {
      isLoadingStore.set(false);

      router.push("/"); // Redirect to the home page after successful login
      window.location.reload();
    },
    onError(error) {
      console.error("Login error:", error);
      errorMessage.value = "Login failed. Please check your credentials.";
      isLoadingStore.set(false);
    },
  });
}

// Mutation for updating the card information for the logged-in user
export function useUpdateCard() {
  const router = useRouter();
  const isLoadingStore = useIsLoadingStore(); // Assuming this is your loading store
  const authStore = useAuthStore(); // Assuming this is your auth store
  const errorMessage = ref<string | null>(null);

  return useMutation({
    mutationKey: ["updateCard"],
    mutationFn: async ({ cardDetails }: { cardDetails: IMeals }) => {
      if (!authStore.isAuth) {
        throw new Error("User is not authenticated.");
      }

      const userEmail = authStore.user.email;

      // Find user in the database based on email (or user ID if you prefer)
      const userResponse = await DB.listDocuments(DB_ID, "users", [
        Query.equal("email", userEmail),
      ]);

      if (userResponse.documents.length === 0) {
        throw new Error("User not found.");
      }

      const userId = userResponse.documents[0].$id;

      // Update the card information in the user's record
      await DB.updateDocument(DB_ID, "users", userId, {
        cardDetails: cardDetails,
      });
    },
    onMutate() {
      isLoadingStore.set(true);
    },
    onSuccess() {
      isLoadingStore.set(false);
      router.push("/profile"); // Redirect to the profile page after successful card update
    },
    onError(error) {
      console.error("Card update error:", error);
      errorMessage.value =
        "Failed to update card information. Please try again.";
      isLoadingStore.set(false);
    },
  });
}
