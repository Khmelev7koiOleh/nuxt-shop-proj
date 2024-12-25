import { ref, onMounted } from "vue";

import {
  DB_ID,
  COLLECTION_MEALS,
  COLLECTION_FAVORITES,
  STORAGE_ID,
  COLLECTION_CART,
  COLLECTION_ORDERS,
} from "@/app.constants";
import { DB, storage } from "@/lib/appwrite";
import { useQuery } from "@tanstack/vue-query";
import { v4 as uuid } from "uuid";
import { useForm } from "vee-validate";
import type { IMeals } from "~/types/order.types";
import { useFavoritesStore } from "~/store/createDocument.store";

export function useGetOrders() {
  const cDStore = useFavoritesStore();
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => DB.listDocuments(DB_ID, COLLECTION_ORDERS),
    select(data) {
      const orders = data.documents as unknown as IMeals[];
      const filteredOrders = orders.filter(
        (document) => document.user === cDStore.user.email
      );
      return filteredOrders;
    },
  });
}
