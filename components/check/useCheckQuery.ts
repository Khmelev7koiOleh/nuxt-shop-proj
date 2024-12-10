// import type { ICard, IColumn } from "./kanban.types";
import { DB } from "@/lib/appwrite";
import { useQuery } from "@tanstack/vue-query";
// import { KANBAN_DATA } from "./kanban.data";
import { DB_ID, COLLECTION_ORDERS } from "@/app.constants";
import type { IOrder } from "@/types/order.types";

export function useKanbanQuery() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => DB.listDocuments(DB_ID, COLLECTION_ORDERS),
    select(data) {
      const orders = data.documents as unknown as IOrder[]; // orders
      console.log(orders);
      // const newBoard = [...KANBAN_DATA];
      // const newBoard: IColumn[] = JSON.parse(JSON.stringify(KANBAN_DATA));
      //   const newBoard: IColumn[] = KANBAN_DATA.map((column) => ({
      //     ...column,
      //     items: [],
      //   }));
      //   const deals = data.documents as unknown as IDeal[];
      //   for (const deal of deals) {
      //     const column = newBoard.find((col) => col.id === deal.status);
      //     if (column) {
      //       column.items.push({
      //         $createdAt: deal.$createdAt,
      //         id: deal.$id,
      //         name: deal.name,
      //         price: deal.price,
      //         companyName: deal.customer.name,
      //         status: deal.status,
      //       });
      //     }
      //   }
      return orders;
    },
  });
}
