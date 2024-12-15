import { ref } from "vue";
import { defineStore } from "pinia";
import {
  DB_ID,
  COLLECTION_FAVORITES,
  COLLECTION_MEALS,
  COLLECTION_CART,
  COLLECTION_ORDERS,
} from "@/app.constants";
import { DB } from "@/lib/appwrite";
import { v4 as uuid } from "uuid";
import type { IMeals } from "~/types/order.types";

export const openOrder = ref(false);

export const useMakeOrderStore = defineStore("makeOrder", () => {
  const orders = ref<IMeals[]>([]);
  const isLoading = ref(false);
  const errorMessage = ref<string | null>(null);
  const loading = ref(false);

  const handleError = (error: unknown, message: string) => {
    console.error(message, error);
    errorMessage.value = message;
  };

  // Utility: Map documents to IMeals
  const mapDocumentToMeal = (document: any): IMeals => ({
    name: document.name,
    price: document.price,
    image: document.image,
    $id: document.$id,
    mealId: document.mealId,
    $createdAt: document.$createdAt,
  });

  // Fetch all favorites
  const fetchOrders = async () => {
    loading.value = true;
    errorMessage.value = null;

    try {
      const response = await DB.listDocuments(DB_ID, COLLECTION_CART);
      orders.value = response.documents.map(mapDocumentToMeal);
    } catch (error) {
      handleError(error, "Failed to fetch favorites.");
    } finally {
      loading.value = false;
    }
  };

  //   const clearCart = async () => {
  //     try {
  //       await DB.deleteDocument(DB_ID, COLLECTION_CART, uuid());
  //       await fetchOrders();
  //     } catch (error) {
  //       console.error("Error clearing cart:", error);
  //     }
  //   };

  // Add meal to favorites
  const addToOrders = async (mealId: IMeals) => {
    isLoading.value = true;
    errorMessage.value = null; // Reset error message on add start

    try {
      // Fetch the meal to ensure it's valid
      const mealDoc = await DB.listDocuments(DB_ID, COLLECTION_CART);
      if (!mealDoc) throw new Error("Meal not found");
      console.log(mealDoc);
      const newOrders = {
        name: mealDoc.documents[0].name,
        price: mealDoc.documents[0].price,
        image: mealDoc.documents[0].image,
        $createdAt: new Date().toISOString(),
        $id: mealId,
      };
      console.log(newOrders);
      // Create a new favorite document
      await DB.createDocument(DB_ID, COLLECTION_ORDERS, mealId.$id, newOrders);

      // Refresh the favorites list

      await fetchOrders();
    } catch (error) {
      handleError("Failed to add to favorites.", error);
    } finally {
      isLoading.value = false;
    }
  };
  return {
    addToOrders,

    loading,
  };
});
