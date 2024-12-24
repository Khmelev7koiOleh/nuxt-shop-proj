import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import { Query } from "appwrite";
import {
  DB_ID,
  COLLECTION_FAVORITES,
  COLLECTION_MEALS,
  COLLECTION_CART,
} from "@/app.constants";
import { DB, account } from "@/lib/appwrite";
import { v4 as uuid } from "uuid";
import type { IMeals } from "~/types/order.types";

export const useFavoritesStore = defineStore("favorites", () => {
  // State
  const favorites = ref<IMeals[]>([]);
  const isLoading = ref(false);
  const errorMessage = ref<string | null>(null);
  const loading = ref(false);
  0;
  const user = ref({ email: "" });

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

  const fetchCartItems = async () => {
    loading.value = true;
    errorMessage.value = null;

    try {
      const response = await DB.listDocuments(DB_ID, COLLECTION_CART);
      favorites.value = response.documents.map(mapDocumentToMeal);
    } catch (error) {
      handleError(error, "Failed to fetch favorites.");
    } finally {
      loading.value = false;
    }
  };

  const addFavorite = async (mealId: string) => {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      // Check if the meal is already favorited by the user
      const existingFavorites = await DB.listDocuments(
        DB_ID,
        COLLECTION_FAVORITES,
        [Query.equal("mealId", mealId), Query.equal("user", user.value.email)]
      );

      if (existingFavorites.documents.length > 0) {
        console.log("Meal already favorited by this user.");
        return; // Avoid duplicating the favorite
      }

      // Fetch the meal to ensure it's valid
      const mealDoc = await DB.getDocument(DB_ID, COLLECTION_MEALS, mealId);
      if (!mealDoc) throw new Error("Meal not found");

      const newFavorite = {
        name: mealDoc.name,
        price: mealDoc.price,
        image: mealDoc.image,
        user: user.value.email,
        $createdAt: new Date().toISOString(),
        mealId: mealId,
      };

      await DB.createDocument(DB_ID, COLLECTION_FAVORITES, uuid(), newFavorite);

      // Refresh the favorites list
      await fetchFavorites();
    } catch (error) {
      handleError("Failed to add to favorites.", error);
    } finally {
      isLoading.value = false;
    }
  };

  const removeFavorite = async (mealId: string) => {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      // Find the specific favorite for the current user
      const favoriteToRemove = await DB.listDocuments(
        DB_ID,
        COLLECTION_FAVORITES,
        [Query.equal("mealId", mealId), Query.equal("user", user.value.email)]
      );

      if (favoriteToRemove.documents.length === 0) {
        console.error("Favorite not found for deletion:", mealId);
        errorMessage.value = "Favorite not found.";
        return;
      }

      // Proceed with deleting the document
      const favoriteId = favoriteToRemove.documents[0].$id;
      await DB.deleteDocument(DB_ID, COLLECTION_FAVORITES, favoriteId);

      // Update local state
      favorites.value = favorites.value.filter(
        (favorite) => favorite.mealId !== mealId
      );

      console.log(`Successfully removed favorite with ID: ${favoriteId}`);
    } catch (error: any) {
      console.error(`Error removing favorite with ID: ${mealId}`, error);
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

  const addToCart = async (mealId: string) => {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      // Check if the meal is already in the cart for the user
      const existingCartItems = await DB.listDocuments(DB_ID, COLLECTION_CART, [
        Query.equal("mealId", mealId),
        Query.equal("user", user.value.email),
      ]);

      if (existingCartItems.documents.length > 0) {
        console.log("Meal already in cart for this user.");
        return; // Avoid duplicating the cart item
      }

      // Fetch the meal to ensure it's valid
      const mealDoc = await DB.getDocument(DB_ID, COLLECTION_MEALS, mealId);
      if (!mealDoc) throw new Error("Meal not found");

      const newCartItem = {
        name: mealDoc.name,
        price: mealDoc.price,
        image: mealDoc.image,
        user: user.value.email,
        $createdAt: new Date().toISOString(),
        mealId: mealId,
      };

      await DB.createDocument(DB_ID, COLLECTION_CART, uuid(), newCartItem);

      // Optionally refresh the cart list or update local state
      console.log("Meal added to cart:", newCartItem);
    } catch (error) {
      handleError("Failed to add meal to cart.", error);
    } finally {
      isLoading.value = false;
    }
  };

  const removeFromCart = async (mealId: string) => {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      // Find the specific favorite for the current user
      const favoriteToRemove = await DB.listDocuments(DB_ID, COLLECTION_CART, [
        Query.equal("mealId", mealId),
        Query.equal("user", user.value.email),
      ]);

      if (favoriteToRemove.documents.length === 0) {
        console.error("Favorite not found for deletion:", mealId);
        errorMessage.value = "Favorite not found.";
        return;
      }

      // Proceed with deleting the document
      const favoriteId = favoriteToRemove.documents[0].$id;
      await DB.deleteDocument(DB_ID, COLLECTION_CART, favoriteId);

      // Update local state
      favorites.value = favorites.value.filter(
        (favorite) => favorite.mealId !== mealId
      );

      console.log(`Successfully removed favorite with ID: ${favoriteId}`);
    } catch (error: any) {
      console.error(`Error removing favorite with ID: ${mealId}`, error);
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

  onMounted(async () => {
    const getUserEmail = await account.get();
    user.value = getUserEmail;
    console.log(user.value.email);
  });

  return {
    favorites,
    isLoading,
    errorMessage,
    addFavorite,
    addToCart,
    fetchFavorites,
    removeFavorite,
    removeFromCart,
    user,
    loading,
  };
});
