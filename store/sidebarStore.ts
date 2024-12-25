import { defineStore } from "pinia";

export const useSidebarStore = defineStore("sidebar", {
  state: () => ({
    onSidebarOpen: false, // Reactive state for sidebar visibility
  }),
  actions: {
    toggleSidebar() {
      this.onSidebarOpen = !this.onSidebarOpen; // Toggle the sidebar state
    },
  },
});
