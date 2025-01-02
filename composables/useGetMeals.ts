import { ref, onMounted } from "vue";

import {
  DB_ID,
  COLLECTION_MEALS,
  COLLECTION_FAVORITES,
  STORAGE_ID,
  COLLECTION_CART,
} from "@/app.constants";
import { DB, storage } from "@/lib/appwrite";
import { useQuery } from "@tanstack/vue-query";
import { v4 as uuid } from "uuid";
import { useForm } from "vee-validate";
import type { IMeals } from "~/types/order.types";
import { useFavoritesStore } from "~/store/createDocument.store";

export function useGetMeals() {
  return useQuery({
    queryKey: ["meals"],
    queryFn: () => DB.listDocuments(DB_ID, COLLECTION_MEALS),

    select(data) {
      const meals = data.documents as unknown as IMeals[];
      const shuffledMeals = [...meals]; // create a copy of the original array
      for (let i = shuffledMeals.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledMeals[i], shuffledMeals[j]] = [
          shuffledMeals[j],
          shuffledMeals[i],
        ];
      }
      return shuffledMeals;
    },
  });
}

export function useGetNewestMeals() {
  return useQuery({
    queryKey: ["meals"],
    queryFn: () => DB.listDocuments(DB_ID, COLLECTION_MEALS),
    select(data) {
      const meals = data.documents as unknown as IMeals[];
      const newest = meals.sort(
        (a, b) =>
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
      );
      return newest;
    },
  });
}
