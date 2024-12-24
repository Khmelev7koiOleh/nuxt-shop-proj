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
      return meals;
    },
  });
}
