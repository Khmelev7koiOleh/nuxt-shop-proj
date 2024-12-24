import { ref } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { account } from "@/lib/appwrite"; // Assuming this is your Appwrite account service
import { useAuthStore, useIsLoadingStore } from "~/store/auth.store"; // Assuming separate loading store
import { useRouter } from "vue-router";
import { v4 as uuid } from "uuid";

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
    },
    onError(error) {
      console.error("Login error:", error);
      errorMessage.value = "Login failed. Please check your credentials.";
      isLoadingStore.set(false);
    },
  });
}
