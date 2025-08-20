import { useEffect, useState } from 'react';
import { ReservationsPanel } from '@/components/ReservationsPanel';
import { Dashboard } from '@/components/Dashboard';
import { useReservations } from '@/hooks/useReservations';
import { useSales } from '@/hooks/useSales';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  BarChart3, 
  LogOut, 
  User,
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingCart
} from 'lucide-react';
import { formatarValor } from '@/lib/utils';
import { Link } from 'react-router-dom';

export function SellerView() {
  const { profile, signOut, isAdmin } = useSupabaseAuth();
  const { reservations, loading: reservationsLoading, updateReservationStatus, fetchReservations } = useReservations();
  const { salesData, loading: salesLoading } = useSales(profile?.user_id, profile?.role === 'admin');

  // Buscar todas as reservas para todos os usuários
  useEffect(() => {
    fetchReservations(true);
  }, []);

  const isAdminProfile = profile?.role === 'admin';

  const filteredReservations = isAdminProfile
    ? reservations
    : reservations.filter(r => r.user_id === profile?.user_id);

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const completedReservations = filteredReservations.filter(r => r.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {profile?.role === 'admin' ? 'Painel Administrativo' : 'Painel do Vendedor'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Olá, {profile?.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span className="text-muted-foreground">
                    {new Date().toLocaleDateString('pt-MZ')}
                  </span>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3" />
                  {pendingReservations.length} pendentes
                </Badge>
              </div>
              
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-bold text-foreground">
                      {pendingReservations.length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Livros Vendidos</p>
                    <p className="text-2xl font-bold text-foreground">
                      {completedReservations.length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatarValor(filteredReservations.reduce((acc, r) => acc + r.total_amount, 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <ReservationsPanel
              reservations={reservations}
              onUpdateStatus={(reservationId, currentUser, status, notes) =>
                updateReservationStatus(reservationId, currentUser, status, notes)
              }
              loading={reservationsLoading}
            />
        <Link to={`/buy/${profile?.user_id}`}>
          <Button
            className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg z-50"
            size="icon"
            title="Acesso Vendedor"
          >
            <ShoppingCart className="w-6 h-6" />
          </Button>
        </Link>
      </main>
    </div>
  );
}