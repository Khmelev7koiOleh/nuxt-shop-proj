import { defineStore } from "pinia";
import { ref } from "vue";

// Interface for user data
interface IAuthStore {
  email: string;
  status: boolean;
  name: string;
}

// Function to return the default state
const getDefaultAuthState = (): { user: IAuthStore } => ({
  user: {
    email: "",
    status: false,
    name: "",
  },
});

// Auth Store
export const useAuthStore = defineStore("auth", {
  state: (): { user: IAuthStore } => getDefaultAuthState(),

  getters: {
    isAuth: (state) => state.user.status,
  },
  actions: {
    clear() {
      this.$patch(getDefaultAuthState());
    },

    set(input: Partial<IAuthStore>) {
      this.$patch({
        user: {
          ...this.user,
          ...input,
        },
      });
    },
  },
});

// Loading State Store
export const useIsLoadingStore = defineStore("isLoading", {
  state: () => ({
    isLoading: true,
  }),
  actions: {
    set(data: boolean) {
      this.$patch({ isLoading: data });
    },
  },
});

// Sidebar State Store
export const useIsSidebarOpenStore = defineStore("isSidebarOpen", {
  state: () => ({
    isSidebarOpen: false,
  }),
  actions: {
    // Set the sidebar open state
    set(data: boolean) {
      this.$patch({ isSidebarOpen: data });
    },
    // Toggle the sidebar state
    toggle() {
      this.$patch({ isSidebarOpen: !this.isSidebarOpen });
    },
  },
  getters: {
    isOpen: (state) => state.isSidebarOpen,
  },
});
