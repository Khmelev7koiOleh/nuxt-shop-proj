import { defineStore } from "pinia";
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
