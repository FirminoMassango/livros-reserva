import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useBooks, Book } from "@/hooks/useBooks";
import { useSales } from "@/hooks/useSales";
import { useBookOfTheDay } from "@/hooks/useBookOfTheDay";
import { useCart } from "@/hooks/useCart";
import { useReservations } from "@/hooks/useReservations";
import { Login } from "@/components/Login";
import { EnhancedBookCard } from "@/components/EnhancedBookCard";
import { BookDrawer } from "@/components/BookDrawer";
import { CartDrawer } from "@/components/CartDrawer";
import { ReservationForm } from "@/components/ReservationForm";
import { ReservationsPanel } from "@/components/ReservationsPanel";
import { EnhancedDashboard } from "@/components/EnhancedDashboard";
import { ProfilePage } from "@/components/ProfilePage";
import { BottomNavigation } from "@/components/BottomNavigation";
import { InstallPrompt } from "@/components/InstallPrompt";
import { BookOfTheDay } from "@/components/BookOfTheDay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, ShoppingCart, LogOut } from "lucide-react";

const Index = () => {
  const { user, profile, loading: authLoading, isAdmin } = useSupabaseAuth();
  const { books, loading: booksLoading, updateBookStock } = useBooks();
  const { salesData, createSale } = useSales(profile?.user_id, isAdmin);
  const { bookOfTheDay } = useBookOfTheDay(books);
  const { 
    cartItems, 
    loading: cartLoading, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    getCartTotal,
    getCartItemCount 
  } = useCart();
  const { 
    reservations, 
    loading: reservationsLoading, 
    fetchReservations,
    createReservation,
    updateReservationStatus 
  } = useReservations();
  
  const [activeTab, setActiveTab] = useState("sales");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const { toast } = useToast();

  // Buscar reservas quando o usuário for admin
  useEffect(() => {
    if (user && isAdmin) {
      fetchReservations(true);
    }
  }, [user, isAdmin, fetchReservations]);

  const handleBookClick = (book: Book) => {
    if (book.stock === 0) {
      toast({
        title: "Livro fora de estoque",
        description: "Este livro não está disponível para venda.",
        variant: "destructive"
      });
      return;
    }
    setSelectedBook(book);
    setIsDrawerOpen(true);
  };

  const handleSellBook = async (bookId: string, quantity: number) => {
    const book = books.find(b => b.id === bookId);
    if (!book || !user || !profile) return;

    if (book.stock < quantity) {
      toast({
        title: "Estoque insuficiente",
        description: `Apenas ${book.stock} unidade(s) disponível(is).`,
        variant: "destructive"
      });
      return;
    }

    try {
      const sale = await createSale(bookId, quantity, book.price, profile.user_id);
      
      if (sale) {
        const newStock = Math.max(0, book.stock - quantity);
        await updateBookStock(bookId, newStock);

        toast({
          title: "Venda realizada!",
          description: `${quantity}x "${book.title}" vendido(s) por MT ${(book.price * quantity).toFixed(2)}.`,
        });

        setIsDrawerOpen(false);
      } else {
        toast({
          title: "Erro na venda",
          description: "Não foi possível processar a venda.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error selling book:', error);
      toast({
        title: "Erro na venda",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleAddToCart = async (bookId: string, quantity: number) => {
    const success = await addToCart(bookId, quantity);
    if (success) {
      setIsDrawerOpen(false);
      setSelectedBook(null);
    }
  };

  const handleConfirmReservation = () => {
    setIsCartDrawerOpen(false);
    setShowReservationForm(true);
  };

  const handleCreateReservation = async (reservationData: any) => {
    const reservationId = await createReservation(reservationData, cartItems);
    if (reservationId) {
      await clearCart();
      setShowReservationForm(false);
      toast({
        title: "Reserva criada!",
        description: "Sua reserva foi criada com sucesso. Você receberá confirmação em breve.",
      });
    }
  };

  const handleUpdateReservationStatus = async (reservationId: string, status: any, notes?: string) => {
    await updateReservationStatus(reservationId, status, notes);
  };

  const handleSignOut = async () => {
    // ... existing signout logic
  };

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Mostrar formulário de reserva se ativo
  if (showReservationForm) {
    return (
      <ReservationForm
        cartItems={cartItems}
        total={getCartTotal()}
        onSubmit={handleCreateReservation}
        onBack={() => setShowReservationForm(false)}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'sales':
        return (
          <>
            {/* Header com carrinho */}
            <div className="bg-background border-b border-border p-4 flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Vendas de Livros</h1>
              <div className="flex items-center gap-3">
                {/* Cart Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCartDrawerOpen(true)}
                  className="relative flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Carrinho
                  {getCartItemCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs min-w-[20px] h-5">
                      {getCartItemCount()}
                    </Badge>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </div>
            </div>

            {/* Livro do Dia */}
            {!booksLoading && bookOfTheDay && (
              <BookOfTheDay 
                book={bookOfTheDay} 
                onClick={() => handleBookClick(bookOfTheDay)} 
              />
            )}
            
            {booksLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg aspect-[3/4] mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-2 w-2/3"></div>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                {books.map((book) => (
                  <EnhancedBookCard
                    key={book.id}
                    book={book}
                    onClick={() => handleBookClick(book)}
                  />
                ))}
              </div>
            )}
          </>
        );
      case 'dashboard':
        return (
          <div className="pb-20">
            {isAdmin ? (
              <ReservationsPanel
                reservations={reservations}
                onUpdateStatus={handleUpdateReservationStatus}
                loading={reservationsLoading}
              />
            ) : (
              <EnhancedDashboard salesData={salesData} />
            )}
          </div>
        );
      case 'profile':
        return (
          <div className="pb-20">
            <ProfilePage />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">
                Livraria Digital
              </h1>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'sales' && 'Catálogo de livros'}
                {activeTab === 'dashboard' && (isAdmin ? 'Painel de Reservas' : 'Análise de vendas')}
                {activeTab === 'profile' && `Olá, ${profile?.name}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>

      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <BookDrawer
        book={selectedBook}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSell={handleSellBook}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        cartItems={cartItems}
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onConfirmReservation={handleConfirmReservation}
        total={getCartTotal()}
        itemCount={getCartItemCount()}
      />

      <InstallPrompt />
    </div>
  );
};

export default Index;
