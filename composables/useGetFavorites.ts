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

export function useGetFavorites() {
  const cDStore = useFavoritesStore();
  return useQuery({
    queryKey: ["favorites"],
    queryFn: () => DB.listDocuments(DB_ID, COLLECTION_FAVORITES),
    select(data) {
      const favorites = data.documents as unknown as IMeals[];
      const filteredFavorites = favorites.filter(
        (document) => document.user === cDStore.user.email
      );
      return filteredFavorites;
    },
  });
}
