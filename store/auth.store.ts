import { defineStore } from "pinia";
import { ref } from "vue";
interface IAuthStore {
  email: string;
  status: boolean;
  name: string;
}
const defaultValues: { user: IAuthStore } = {
  user: {
    email: "",
    status: false,
    name: "",
  },
};

export const useAuthStore = defineStore("auth", {
  state: () => defaultValues,

  getters: {
    isAuth: (state) => state.user.status,
  },
  actions: {
    clear() {
      this.$patch(defaultValues);
    },

    set(input: IAuthStore) {
      this.$patch({
        user: input,
      });
    },
  },
});

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

export const useIsSidebarOpenStore = defineStore("isSidebarOpen", {
  state: () => ({
    isSidebarOpen: false,
  }),
  actions: {
    // Set the sidebar open state (true or false)
    set(data: boolean) {
      this.$patch({ isSidebarOpen: data });
    },
    // Toggle the sidebar state
    toggle() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
  },
  getters: {
    // Getter to check if the sidebar is open
    isOpen: (state) => state.isSidebarOpen,
  },
});
