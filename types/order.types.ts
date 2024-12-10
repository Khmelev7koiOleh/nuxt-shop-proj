export interface IBaseField {
  $createdAt: string;
  $id: string;
}

export interface IOrder extends IBaseField {
  title: string;
  image: string;
}
