import { DB } from "~/lib/appwrite"; // Make sure this is the correct import for your Appwrite SDK
import { useAuthStore } from "~/store/auth.store"; // Adjust if necessary
import { Query } from "appwrite";
import { DB_ID } from "~/app.constants";

// Fetch user data from the database
export async function fetchUserData() {
  const authStore = useAuthStore();
  if (!authStore.isAuth) {
    throw new Error("User is not authenticated.");
  }

  try {
    const userEmail = authStore.user.email;
    // Fetch the user from the database by email (adjust this according to your DB structure)
    const userResponse = await DB.listDocuments(DB_ID, "users", [
      Query.equal("email", userEmail),
    ]);

    if (userResponse.documents.length === 0) {
      throw new Error("User not found.");
    }

    // Return the user data
    return userResponse.documents[0]; // Assuming this is the user document you need
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}
