import { ref } from "vue";

export const useDefineCard = () => {
  // Refs for form fields
  const name = ref("");
  const price = ref("");
  const mealId = ref("");
  const description = ref("");

  // Ref for file input
  const image = ref<File | null>(null);
  const user = ref("");

  // Reset function
  //   const resetForm = () => {
  //     nameRef.value = "";
  //     priceRef.value = "";
  //     descriptionRef.value = "";
  //     imageRef.value = null;
  //     user.value = "";
  //   };

  return { name, price, description, mealId, image, user };
};
