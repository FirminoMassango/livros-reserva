export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  cover?: string;
  sold: boolean;
}

export interface SalesData {
  totalSold: number;
  totalRevenue: number;
}