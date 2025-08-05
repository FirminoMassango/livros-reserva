export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  cover: string;
  sold: boolean;
  category: string;
  description: string;
  stock: number;
}

export interface Sale {
  id: string;
  bookId: string;
  quantity: number;
  totalPrice: number;
  userId: string;
  timestamp: Date;
  book: Book;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'seller';
  createdAt: Date;
}

export interface SalesData {
  totalSold: number;
  totalRevenue: number;
  salesByCategory: Record<string, number>;
  salesByUser: Record<string, number>;
  recentSales: Sale[];
}