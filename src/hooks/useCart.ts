import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/hooks/useBooks';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  user_id: string;
  book_id: string;
  quantity: number;
  book: Book;
  created_at: string;
  updated_at: string;
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCartItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          book:books(*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart items:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar carrinho",
          variant: "destructive",
        });
      } else {
        setCartItems(data || []);
      }
    } catch (error) {
      console.error('Error in fetchCartItems:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (bookId: string, quantity: number = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "É necessário fazer login para adicionar ao carrinho",
          variant: "destructive",
        });
        return false;
      }

      // Verificar se já existe no carrinho
      const existingItem = cartItems.find(item => item.book_id === bookId);

      if (existingItem) {
        // Atualizar quantidade
        const newQuantity = existingItem.quantity + quantity;
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (error) {
          console.error('Error updating cart item:', error);
          return false;
        }
      } else {
        // Adicionar novo item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            book_id: bookId,
            quantity
          });

        if (error) {
          console.error('Error adding to cart:', error);
          return false;
        }
      }

      await fetchCartItems();
      toast({
        title: "Sucesso",
        description: "Livro adicionado ao carrinho",
      });
      return true;
    } catch (error) {
      console.error('Error in addToCart:', error);
      return false;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        return removeFromCart(itemId);
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) {
        console.error('Error updating quantity:', error);
        return false;
      }

      await fetchCartItems();
      return true;
    } catch (error) {
      console.error('Error in updateQuantity:', error);
      return false;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error removing from cart:', error);
        return false;
      }

      await fetchCartItems();
      toast({
        title: "Sucesso",
        description: "Item removido do carrinho",
      });
      return true;
    } catch (error) {
      console.error('Error in removeFromCart:', error);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing cart:', error);
        return false;
      }

      setCartItems([]);
      return true;
    } catch (error) {
      console.error('Error in clearCart:', error);
      return false;
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.book.price * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    fetchCartItems
  };
}