import { ref, onMounted } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { DB, storage } from "@/lib/appwrite";
import {
  STORAGE_ID,
  DB_ID,
  COLLECTION_MEALS,
  COLLECTION_ORDERS,
  COLLECTION_CART,
} from "@/app.constants";
import { v4 as uuid, v4 } from "uuid";
import { useResetForm } from "./resetForm";
// import { useDefineCard } from "./defineCard";
import { useFavoritesStore } from "~/store/createDocument.store";
import type { IMeals } from "~/types/order.types";
import { useGetCarts } from "@/composables/useGetCarts";
import { useDeleteCartMeal } from "@/composables/useDeleteCartMeal";
import { useGetOrders } from "@/composables/useGetOrders"; // Update the path to the file where useGetOrders is defined

export function useTransferToOrder() {
  const queryClient = useQueryClient();
  const { mutate: deleteCartMeal } = useDeleteCartMeal();
  const cDStore = useFavoritesStore();
  const {
    data: useGetCartsData,
    isLoading: isLoadingOrders,
    isError: isErrorOrders,
  } = useGetCarts(); // Move this line to the top

  return useMutation({
    mutationKey: ["transfer-to-order"],
    mutationFn: async () => {
      if (!useGetCartsData.value) {
        throw new Error("No items in the cart to transfer.");
      }
      const cartItems = useGetCartsData.value;
      const orderPromises = cartItems
        .filter((cartItem) => cartItem.user === cDStore.user.email)
        .map((cartItem) => {
          return DB.createDocument(DB_ID, COLLECTION_ORDERS, uuid(), {
            name: cartItem.name,
            price: cartItem.price,
            image: cartItem.image,
            description: cartItem.description,
            user: cartItem.user,
            $createdAt: new Date().toISOString(),
          });
        });

      return Promise.all(orderPromises);
    },
    onSuccess: () => {
      //   resetForm();
      console.log(useGetCartsData);
      queryClient.invalidateQueries(["orders"]);
      console.log(
        "Items transferred to orders successfully." +
          JSON.stringify(useGetCartsData.value)
      );
      useGetCartsData.value?.forEach((item) => {
        deleteCartMeal(item.$id);
      });
    },
    onError: (error) => {
      console.log(useGetCartsData.value);
    },
  });
}
