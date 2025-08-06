import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Book } from './useBooks';

export interface Sale {
  id: string;
  book_id: string;
  user_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  books?: Book;
}

export interface SalesData {
  totalSold: number;
  totalRevenue: number;
  salesByCategory: Record<string, number>;
  salesByUser: Record<string, number>;
  recentSales: Sale[];
}

export function useSales(userId?: string, isAdmin: boolean = false) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          books (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sales:', error);
      } else {
        setSales(data || []);
      }
    } catch (error) {
      console.error('Error in fetchSales:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (bookId: string, quantity: number, unitPrice: number, userId: string) => {
    try {
      const totalPrice = quantity * unitPrice;
      
      const { data, error } = await supabase
        .from('sales')
        .insert({
          book_id: bookId,
          user_id: userId,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice
        })
        .select(`
          *,
          books (*)
        `)
        .single();

      if (error) {
        console.error('Error creating sale:', error);
        return null;
      }

      // Update local state
      setSales(prevSales => [data, ...prevSales]);
      return data;
    } catch (error) {
      console.error('Error in createSale:', error);
      return null;
    }
  };

  const salesData: SalesData = (() => {
    const userSales = isAdmin ? sales : sales.filter(sale => sale.user_id === userId);
    
    const totalSold = userSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalRevenue = userSales.reduce((sum, sale) => sum + sale.total_price, 0);
    
    const salesByCategory = userSales.reduce((acc, sale) => {
      const category = sale.books?.category || 'Unknown';
      acc[category] = (acc[category] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);

    const salesByUser = sales.reduce((acc, sale) => {
      acc[sale.user_id] = (acc[sale.user_id] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSold,
      totalRevenue,
      salesByCategory,
      salesByUser: isAdmin ? salesByUser : { [userId || '']: totalSold },
      recentSales: userSales.slice(0, 10)
    };
  })();

  useEffect(() => {
    fetchSales();
  }, []);

  return {
    sales,
    loading,
    salesData,
    fetchSales,
    createSale
  };
}