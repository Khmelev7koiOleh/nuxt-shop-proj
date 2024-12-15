import { defineStore } from "pinia";
import { ref } from "vue";
import {
  DB_ID,
  COLLECTION_FAVORITES,
  COLLECTION_MEALS,
  COLLECTION_CART,
} from "@/app.constants";
import { DB } from "@/lib/appwrite";
import { v4 as uuid } from "uuid";
import type { IMeals } from "~/types/order.types";

export const useFavoritesStore = defineStore("favorites", () => {
  // State
  const favorites = ref<IMeals[]>([]);
  const isLoading = ref(false);
  const errorMessage = ref<string | null>(null);
  const loading = ref(false);

  // Utility: Log errors
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
  const fetchFavorites = async () => {
    loading.value = true;
    errorMessage.value = null;

    try {
      const response = await DB.listDocuments(DB_ID, COLLECTION_FAVORITES);
      favorites.value = response.documents.map(mapDocumentToMeal);
    } catch (error) {
      handleError(error, "Failed to fetch favorites.");
    } finally {
      loading.value = false;
    }
  };

  // Add meal to favorites
  const addToCart = async (mealId: string) => {
    isLoading.value = true;
    errorMessage.value = null; // Reset error message on add start

    try {
      // Fetch the meal to ensure it's valid
      const mealDoc = await DB.getDocument(DB_ID, COLLECTION_MEALS, mealId);
      if (!mealDoc) throw new Error("Meal not found");

      const newFavorite = {
        name: mealDoc.name,
        price: mealDoc.price,
        image: mealDoc.image,
        $createdAt: new Date().toISOString(),
        mealId: mealId,
      };
      console.log(newFavorite.mealId);
      // Create a new favorite document
      await DB.createDocument(DB_ID, COLLECTION_CART, mealId, newFavorite);

      // Refresh the favorites list
      await fetchFavorites();
    } catch (error) {
      handleError("Failed to add to favorites.", error);
    } finally {
      isLoading.value = false;
    }
  };
  const addFavorite = async (mealId: string) => {
    isLoading.value = true;
    errorMessage.value = null; // Reset error message on add start

    try {
      // Fetch the meal to ensure it's valid
      const mealDoc = await DB.getDocument(DB_ID, COLLECTION_MEALS, mealId);
      if (!mealDoc) throw new Error("Meal not found");

      const newFavorite = {
        name: mealDoc.name,
        price: mealDoc.price,
        image: mealDoc.image,
        $createdAt: new Date().toISOString(),
        mealId: mealId,
      };
      console.log(newFavorite.mealId);
      // Create a new favorite document
      await DB.createDocument(DB_ID, COLLECTION_FAVORITES, mealId, newFavorite);

      // Refresh the favorites list
      await fetchFavorites();
    } catch (error) {
      handleError("Failed to add to favorites.", error);
    } finally {
      isLoading.value = false;
    }
  };

  const removeFavorite = async (fav: string) => {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      //   const favoriteToRemove = favorites.value.find(
      //     (favorite) => favorite.$id === fav
      //   );

      //   console.log("Attempting to remove favorite with ID:", fav);
      //   if (!favoriteToRemove) {
      //     console.error("Favorite not found for deletion:", fav);
      //     errorMessage.value = "Favorite not found.";
      //     return;
      //   }
      console.log(`Attempting to remove favorite with ID: ${fav}`);

      // Proceed with deleting the document
      await DB.deleteDocument(DB_ID, COLLECTION_FAVORITES, fav);

      // Update local state
      favorites.value = favorites.value.filter(
        (favorite) => favorite.$id !== fav
      );

      console.log(`Successfully removed favorite with ID: ${fav}`);
    } catch (error: any) {
      console.error(`Error removing favorite with ID: ${fav}`, error);
      if (error?.message?.includes("Invalid `documentId` param")) {
        errorMessage.value = "Invalid favorite ID.";
      } else if (error?.message?.includes("Document not found")) {
        errorMessage.value = "Favorite not found.";
      } else {
        errorMessage.value = "Failed to remove meal from favorites.";
      }
      handleError(error, errorMessage.value);
    } finally {
      isLoading.value = false;
    }
  };

  const removeFromCart = async (cart: string) => {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      //   const favoriteToRemove = favorites.value.find(
      //     (favorite) => favorite.$id === fav
      //   );

      //   console.log("Attempting to remove favorite with ID:", fav);
      //   if (!favoriteToRemove) {
      //     console.error("Favorite not found for deletion:", fav);
      //     errorMessage.value = "Favorite not found.";
      //     return;
      //   }
      console.log(`Attempting to remove favorite with ID: ${cart}`);

      // Proceed with deleting the document
      await DB.deleteDocument(DB_ID, COLLECTION_CART, cart);

      // Update local state
      favorites.value = favorites.value.filter(
        (favorite) => favorite.$id !== cart
      );

      console.log(`Successfully removed favorite with ID: ${cart}`);
    } catch (error: any) {
      console.error(`Error removing favorite with ID: ${cart}`, error);
      if (error?.message?.includes("Invalid `documentId` param")) {
        errorMessage.value = "Invalid favorite ID.";
      } else if (error?.message?.includes("Document not found")) {
        errorMessage.value = "Favorite not found.";
      } else {
        errorMessage.value = "Failed to remove meal from favorites.";
      }
      handleError(error, errorMessage.value);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    favorites,
    isLoading,
    errorMessage,
    addFavorite,
    addToCart,
    fetchFavorites,
    removeFavorite,
    removeFromCart,

    loading,
  };
});
