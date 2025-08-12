import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReservationItem {
  id: string;
  reservation_id: string;
  book_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  book: {
    id: string;
    title: string;
    author: string;
    price: number;
    cover: string;
  };
}

export interface Reservation {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  pickup_location?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  reservation_items: ReservationItem[];
}

export interface CreateReservationData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  pickup_location?: string;
  notes?: string;
}

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReservations = async (isAdmin: boolean = false) => {
    if (loading) return; // Prevent multiple calls
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && !isAdmin) {
        setReservations([]);
        return;
      }

      let query = supabase
        .from('reservations')
        .select(`
          *,
          reservation_items(
            *,
            book:books(id, title, author, price, cover)
          )
        `);

      // Se não for admin, filtrar apenas reservas do usuário
      if (!isAdmin && user) {
        query = query.eq('user_id', user.id);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reservations:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar reservas",
          variant: "destructive",
        });
      } else {
        setReservations((data || []) as Reservation[]);
      }
    } catch (error) {
      console.error('Error in fetchReservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (
    reservationData: CreateReservationData & { payment_method?: string },
    cartItems: any[]
  ) => {

    console.warn("reservationData",reservationData)
    console.warn("cartItems",cartItems)
    
    try {
      // Para compradores, não precisamos de user autenticado
      const totalAmount = cartItems.reduce((total, item) => {
        return total + (item.book.price * item.quantity);
      }, 0);

      // Criar a reserva sem user_id (para compradores)
      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          user_id: null, // Comprador não tem user_id
          customer_name: reservationData.customer_name,
          customer_phone: reservationData.customer_phone,
          customer_email: reservationData.customer_email,
          pickup_location: reservationData.pickup_location,
          total_amount: totalAmount,
          notes: reservationData.notes,
          payment_method: reservationData.payment_method || 'Numerário'
        })
        .select()
        .single();

      if (reservationError) {
        console.error('Error creating reservation:', reservationError);
        toast({
          title: "Erro",
          description: "Erro ao criar reserva",
          variant: "destructive",
        });
        return false;
      }

      // Criar os itens da reserva
      const reservationItems = cartItems.map(item => ({
        reservation_id: reservation.id,
        book_id: item.book.id,
        quantity: item.quantity,
        unit_price: item.book.price,
        total_price: item.book.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('reservation_items')
        .insert(reservationItems);

      if (itemsError) {
        console.error('Error creating reservation items:', itemsError);
        await supabase.from('reservations').delete().eq('id', reservation.id);
        toast({
          title: "Erro",
          description: "Erro ao criar itens da reserva",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Reserva criada com sucesso",
      });
      return reservation.id;
    } catch (error) {
      console.error('Error in createReservation:', error);
      return false;
    }
  };

  const updateReservationStatus = async (
    reservationId: string,
    status: Reservation['status'],
    notes?: string
  ) => {
    try {
      const updateData: any = { status };
      if (notes) updateData.notes = notes;

      const { error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', reservationId);

      if (error) {
        console.error('Error updating reservation status:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar status da reserva",
          variant: "destructive",
        });
        return false;
      }

      await fetchReservations(true);
      toast({
        title: "Sucesso",
        description: "Status da reserva atualizado",
      });
      return true;
    } catch (error) {
      console.error('Error in updateReservationStatus:', error);
      return false;
    }
  };

  return {
    reservations,
    loading,
    fetchReservations,
    createReservation,
    updateReservationStatus
  };
}