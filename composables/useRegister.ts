import { ref } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { account } from "@/lib/appwrite"; // Assuming this is your Appwrite account service
import { useAuthStore, useIsLoadingStore } from "~/store/auth.store"; // Assuming separate loading store
import { useRouter } from "vue-router";
import { v4 as uuid } from "uuid";

// Create a custom mutation for registration
export function useRegister() {
  const router = useRouter();
  const isLoadingStore = useIsLoadingStore(); // Assuming this is your loading store
  const authStore = useAuthStore(); // Assuming this is your auth store
  const errorMessage = ref<string | null>(null);
  const loginMutation = useLogin(); // Use the login mutation here

  return useMutation({
    mutationKey: ["register"],
    mutationFn: async ({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name: string;
    }) => {
      // Register the user
      await account.create(uuid(), email, password, name);
      // Automatically log in after successful registration
      await loginMutation.mutateAsync({ email, password });
    },
    onMutate() {
      isLoadingStore.set(true);
    },
    onSuccess() {
      isLoadingStore.set(false);

      router.push("/"); // Redirect to the home page after successful registration
    },
    onError(error) {
      console.error("Registration error:", error);
      errorMessage.value =
        "Registration failed. Please check your credentials.";
      isLoadingStore.set(false);
    },
  });
}
