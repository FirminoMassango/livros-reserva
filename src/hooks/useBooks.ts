import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  cover: string;
  category: string;
  description: string;
  stock: number;
  created_at: string;
  updated_at: string;
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching books:', error);
      } else {
        setBooks(data || []);
      }
    } catch (error) {
      console.error('Error in fetchBooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookStock = async (bookId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('books')
        .update({ stock: newStock })
        .eq('id', bookId);

      if (error) {
        console.error('Error updating book stock:', error);
        return false;
      }

      // Update local state
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === bookId 
            ? { ...book, stock: newStock }
            : book
        )
      );

      return true;
    } catch (error) {
      console.error('Error in updateBookStock:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    books,
    loading,
    fetchBooks,
    updateBookStock
  };
}