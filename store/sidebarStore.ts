import { defineStore } from "pinia";

export const useSidebarStore = defineStore("sidebar", {
  state: () => ({
    onSidebarOpen: false, // Reactive state for sidebar visibility
    onOrderSidebarOpen: false,
  }),
  actions: {
    toggleSidebar() {
      this.onSidebarOpen = !this.onSidebarOpen; // Toggle the sidebar state
      this.onOrderSidebarOpen = !this.onOrderSidebarOpen; // Toggle the sidebar state
    },
  },
});
