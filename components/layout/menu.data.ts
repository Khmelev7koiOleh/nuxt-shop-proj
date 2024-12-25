export interface IMenuItem {
  name: string;
  url: string;
  icon: string;
}

export const MENU_DATA: IMenuItem[] = [
  {
    icon: "radix-icons:dashboard",
    name: "Dashboard",
    url: "/",
  },
  {
    icon: "ep:goods",
    name: "Products",
    url: "/products",
  },
  {
    icon: "fluent:heart-28-regular",
    name: "Favorites",
    url: "/favorites",
  },
  {
    icon: "ion:cart-outline",
    name: "Cart",
    url: "/cart",
  },
  // {
  //   icon: "ph:contactless-payment",
  //   name: "Payments",
  //   url: "/payments",
  // },

  {
    icon: "fluent:receipt-28-regular",
    name: "Orders",
    url: "/orders",
  },
  {
    icon: "mingcute:group-line",
    name: "Customers",
    url: "/customers",
  },
  {
    icon: "fluent:person-feedback-48-regular",
    name: "Feedback",
    url: "/feedback",
  },
  {
    icon: "radix-icons:gear",
    name: "Settings",
    url: "/settings",
  },
  {
    icon: "radix-icons:question-mark",
    name: "Help",
    url: "/help",
  },
];
