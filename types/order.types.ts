export interface IMeals {
  name: string;
  price: number;
  image: string;
  mealId: string;
  description?: string;
  user?: string;
  category?: string;
  $createdAt: string;
  $id: string;
}

// export interface IFavorites extends IBaseField {
//   name: string;
//   price: number;
//   image: string;
//    mealId: string;
// }
