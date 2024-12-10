import { APP_WRITE_ID } from "@/app.constants";
import { Account, Client, Databases, Storage } from "appwrite";

// Initialize Appwrite client
const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1") // Appwrite cloud URL
  .setProject(APP_WRITE_ID); // Your Appwrite project ID

// Initialize Appwrite storage
export const storage = new Storage(client);
export { client };
export const account = new Account(client);

export { ID } from "appwrite";

export const DB = new Databases(client);
