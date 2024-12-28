import { useQuery } from "@tanstack/vue-query";
import { DB_ID, COLLECTION_CART } from "@/app.constants";
import { DB } from "@/lib/appwrite";
import { useFavoritesStore } from "~/store/createDocument.store"; // Store with user data
import type { IMeals } from "~/types/order.types";
import { computed } from "vue";

export function useGetCarts() {
  const cDStore = useFavoritesStore(); // Accessing the store with user email

  const { data, ...query } = useQuery({
    queryKey: ["cart"],
    queryFn: () => DB.listDocuments(DB_ID, COLLECTION_CART),
    select(data) {
      const carts = data.documents as unknown as IMeals[];
      // Filter carts based on the user's email
      const filteredCarts = carts.filter(
        (document) => document.user === cDStore.user.email
      );
      return filteredCarts as IMeals[];
    },
    refetchOnWindowFocus: true, // Refetch data when the window is focused
    refetchOnMount: true, // Refetch data when the component mounts
    retry: false, // Disable retries to prevent unnecessary refetches
  });

  const totalItems = computed(() => (data.value ? data.value.length : 0));
  const totalPrice = computed(() =>
    data.value ? data.value.reduce((total, cart) => total + cart.price, 0) : 0
  );

  return { data, totalPrice, totalItems, ...query };
}
