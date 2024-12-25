import { ref, onMounted } from "vue";

import {
  DB_ID,
  COLLECTION_MEALS,
  COLLECTION_FAVORITES,
  STORAGE_ID,
  COLLECTION_CART,
} from "@/app.constants";
import { DB, storage } from "@/lib/appwrite";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { v4 as uuid } from "uuid";
import { useForm } from "vee-validate";
import type { IMeals } from "~/types/order.types";
import { useFavoritesStore } from "~/store/createDocument.store";

export function useDeleteCartMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-cart-meal"],
    mutationFn: async (mealId: string) => {
      return await DB.deleteDocument(DB_ID, COLLECTION_CART, mealId);
    },
    onSuccess() {
      //to refetch the very same collection
      queryClient.invalidateQueries(["cart"]);
    },
  });
}
