import { ref } from "vue";
import { DB_ID, COLLECTION_FAVORITES, COLLECTION_CART } from "@/app.constants";
import { DB } from "@/lib/appwrite";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import type { IMeals } from "~/types/order.types";

export function useRemoveItem() {
  const queryClient = useQueryClient();
  const errorMessage = ref<string | null>(null);
  const favorites = ref<IMeals[]>([]);
  const carts = ref<IMeals[]>([]);
  const favoriteMap = ref<{ [mealId: string]: boolean }>({});
  const cartMap = ref<{ [mealId: string]: boolean }>({});
  const total = ref(0);

  const removeItemMutation = useMutation({
    mutationKey: ["remove-item"],
    mutationFn: async ({
      collection,
      id,
    }: {
      collection: string;
      id: string;
    }) => {
      await DB.deleteDocument(DB_ID, collection, id);
    },
    onSuccess(_, { collection }) {
      // Refetch the collections
      if (collection === COLLECTION_FAVORITES) {
        queryClient.invalidateQueries(["favorites"]);
      } else if (collection === COLLECTION_CART) {
        queryClient.invalidateQueries(["carts"]);
      }
    },
    onError(error) {
      console.error("Error removing item:", error);
      errorMessage.value = "Failed to remove item.";
    },
  });

  const removeFromFavorite = async (id: string) => {
    try {
      await removeItemMutation.mutateAsync({
        collection: COLLECTION_FAVORITES,
        id,
      });
      favorites.value = favorites.value.filter((item) => item.$id !== id);
      delete favoriteMap.value[id];
      total.value = favorites.value.length;
    } catch (error) {
      console.error(`Error removing from favorites:`, error);
      errorMessage.value = "Failed to remove item from favorites.";
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      await removeItemMutation.mutateAsync({ collection: COLLECTION_CART, id });
      carts.value = carts.value.filter((item) => item.$id !== id);
      delete cartMap.value[id];
      total.value = carts.value.length;
    } catch (error) {
      console.error(`Error removing from cart:`, error);
      errorMessage.value = "Failed to remove item from cart.";
    }
  };

  return {
    removeFromFavorite,
    removeFromCart,
    errorMessage,
    total,
  };
}
