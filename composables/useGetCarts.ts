import { useQuery } from "@tanstack/vue-query";
import { DB_ID, COLLECTION_CART } from "@/app.constants";
import { DB } from "@/lib/appwrite";
import { useFavoritesStore } from "~/store/createDocument.store"; // Store with user data
import type { IMeals } from "~/types/order.types";

export function useGetCarts() {
  const cDStore = useFavoritesStore(); // Accessing the store with user email

  return useQuery({
    queryKey: ["cart"],
    queryFn: () => DB.listDocuments(DB_ID, COLLECTION_CART),
    select(data) {
      const carts = data.documents as unknown as IMeals[];

      // Filter carts based on the user's email
      const filteredCarts = carts.filter(
        (document) => document.user === cDStore.user.email
      );
      return filteredCarts;
    },
  });
}
