import { ref } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useFavoritesStore } from "~/store/createDocument.store";
import type { IMeals } from "~/types/order.types";

export function useMealMutations() {
  const queryClient = useQueryClient();
  const cDStore = useFavoritesStore();

  // Reactive state
  const favoriteMap = ref<Record<string, boolean>>({});
  const cartMap = ref<Record<string, boolean>>({});
  const favorites = ref<IMeals[]>([]);

  // Helper functions
  const manageFavorite = async (mealId: string, isFavorite: boolean) => {
    try {
      return isFavorite
        ? await cDStore.addFavorite(mealId)
        : await cDStore.removeFavorite(mealId);
    } catch (error) {
      console.error("Error managing favorite:", error);
      throw error;
    }
  };

  const manageCart = async (mealId: string, isInCart: boolean) => {
    try {
      return isInCart
        ? await cDStore.addToCart(mealId)
        : await cDStore.removeFromCart(mealId);
    } catch (error) {
      console.error("Error managing cart:", error);
      throw error;
    }
  };

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (meal: IMeals) => {
      const isFavorite = favoriteMap.value[meal.$id];
      await manageFavorite(meal.$id, isFavorite);
      return !isFavorite;
    },
    onMutate: async (meal: IMeals) => {
      const currentFavoriteState = favoriteMap.value[meal.$id];
      favoriteMap.value[meal.$id] = !currentFavoriteState;

      if (!currentFavoriteState) {
        favorites.value = [...favorites.value, meal];
      } else {
        favorites.value = favorites.value.filter((fav) => fav.$id !== meal.$id);
      }

      console.log("Optimistic update for favorite:", meal.$id);
    },
    onError: (error, meal) => {
      console.error("Error toggling favorite:", error);
      favoriteMap.value[meal.$id] = !favoriteMap.value[meal.$id];
    },
    onSettled: () => {
      queryClient.invalidateQueries(["favorites"]);
    },
  });

  // Toggle cart mutation
  const toggleCartMutation = useMutation({
    mutationFn: async (meal: IMeals) => {
      const isInCart = cartMap.value[meal.$id];
      await manageCart(meal.$id, isInCart);
      return !isInCart;
    },
    onMutate: async (meal: IMeals) => {
      cartMap.value[meal.$id] = !cartMap.value[meal.$id];
    },
    onError: (error, meal) => {
      console.error("Error toggling cart:", error);
      cartMap.value[meal.$id] = !cartMap.value[meal.$id];
    },
    onSettled: () => {
      queryClient.invalidateQueries(["cart"]);
    },
  });

  return {
    toggleFavoriteMutation,
    toggleCartMutation,
    favoriteMap,
    cartMap,
    favorites,
  };
}
