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

export function useUploadImage() {
  const uploadImage = async (
    fileRef: any,
    errorMessage: any,
    selectedCategory: any
  ) => {
    if (!fileRef.value) {
      errorMessage.value = "No file selected.";
      return null;
    }

    try {
      const response = await storage.createFile(
        STORAGE_ID,
        uuid(),
        fileRef.value
      );
      return response;
    } catch (error) {
      console.error("Error uploading file:", error);
      errorMessage.value = "File upload failed.";
      return null;
    }
  };

  return {
    uploadImage,
  };
}
