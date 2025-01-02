import { ref, onMounted } from "vue";

export function useFoodAds() {
  const foodAds = ref([]); // Create a reactive reference
  const loading = ref(true);
  const error = ref(null);

  const loadFoodAds = async () => {
    try {
      const response = await fetch(
        "https://unsplash.com/collections/36172330/fast-food"
      );
      const data = await response.json();
      foodAds.value = data.meals; // Assign data to the ref
    } catch (err) {
      error.value = "Failed to load food advertisements.";
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    loadFoodAds(); // Fetch data when the component mounts
  });

  return {
    foodAds,
    loading,
    error,
  };
}
