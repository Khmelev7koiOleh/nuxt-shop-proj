import { ref } from "vue";

export const useResetForm = () => {
  // Refs for form fields
  const nameRef = ref("");
  const priceRef = ref("");
  const descriptionRef = ref("");
  const selectedCategory = ref("");

  // Reset function
  const resetForm = () => {
    nameRef.value = "";
    priceRef.value = "";
    descriptionRef.value = "";
    selectedCategory.value = "";
  };

  return { nameRef, priceRef, descriptionRef, selectedCategory, resetForm };
};
