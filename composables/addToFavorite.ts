// <script setup lang="ts">
// import { useMutation } from "@tanstack/vue-query";
// import { ref } from "vue";
// import { DB, DB_ID, COLLECTION_FAVORITES, COLLECTION_MEALS } from "~/lib/appwrite"; // Replace with your actual imports
// import { uuid } from "uuidv4";

// // State
// const errorMessage = ref<string | null>(null);
// const favorites = ref([]); // Replace with your existing state or reactive source

// // Mutation to add a favorite
// const mutation = useMutation({
//   mutationKey: ["favorites"],
//   mutationFn: async (mealId: string) => {
//     // Fetch the meal to ensure it's valid
//     const mealDoc = await DB.getDocument(DB_ID, COLLECTION_MEALS, mealId);
//     if (!mealDoc) throw new Error("Meal not found");

//     // Prepare favorite data
//     const newFavorite = {
//       name: mealDoc.name,
//       price: mealDoc.price,
//       image: mealDoc.image,
//       $createdAt: new Date().toISOString(),
//       mealId: mealId,
//     };

//     // Add the favorite
//     return DB.createDocument(DB_ID, COLLECTION_FAVORITES, uuid(), newFavorite);
//   },
//   onSuccess: (data) => {
//     console.log("Favorite added successfully:", data);
//     favorites.value.push(data); // Dynamically update the list
//   },
//   onError: (error) => {
//     console.error("Error adding favorite:", error);
//     errorMessage.value = "Failed to add favorite.";
//   },
// });
// </script>
