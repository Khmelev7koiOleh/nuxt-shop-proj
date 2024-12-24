import { ref } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { DB, storage } from "@/lib/appwrite";
import { STORAGE_ID, DB_ID, COLLECTION_MEALS } from "@/app.constants";
import { v4 as uuid } from "uuid";
import { useResetForm } from "./resetForm";
import type { IMeals } from "~/types/order.types";

const { resetForm, nameRef, priceRef, descriptionRef, selectedCategory } =
  useResetForm();
const { handleSubmit } = useForm<IMeals>();
export function useCreateMeal() {
  const errorMessage = ref("");
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-meal"],
    mutationFn: async ({
      name,
      price,
      description,
      category,
      image,
    }: {
      name: string;
      price: number;
      description: string;
      category: string;
      image: File;
    }) => {
      const file = await storage.createFile(STORAGE_ID, uuid(), image);
      const imageURL = storage.getFileView(STORAGE_ID, file.$id);

      return DB.createDocument(DB_ID, COLLECTION_MEALS, uuid(), {
        name,
        price,
        description,
        category,
        image: imageURL,
        $createdAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meals"]);
      console.log("Meal created successfully.");
      resetForm();
    },
    onError: (error) => {
      console.error("Error creating meal:", error);
      errorMessage.value = "Meal creation failed.";
    },
  });
}
