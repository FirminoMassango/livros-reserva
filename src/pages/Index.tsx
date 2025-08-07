import { useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useBooks, Book } from "@/hooks/useBooks";
import { useSales } from "@/hooks/useSales";
import { Login } from "@/components/Login";
import { EnhancedBookCard } from "@/components/EnhancedBookCard";
import { BookDrawer } from "@/components/BookDrawer";
import { EnhancedDashboard } from "@/components/EnhancedDashboard";
import { ProfilePage } from "@/components/ProfilePage";
import { BottomNavigation } from "@/components/BottomNavigation";
import { InstallPrompt } from "@/components/InstallPrompt";
import { BookOfTheDay } from "@/components/BookOfTheDay";
import { APP_CONFIG } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";
import { BookOpen } from "lucide-react";

const Index = () => {
  const { user, profile, loading: authLoading, isAdmin } = useSupabaseAuth();
  const { books, loading: booksLoading, updateBookStock } = useBooks();
  const { salesData, createSale } = useSales(profile?.user_id, isAdmin);
  const [activeTab, setActiveTab] = useState("sales");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toast } = useToast();

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

  if (authLoading) {
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

  // Encontrar o livro do dia
  const bookOfTheDay = books.find(book => book.title.includes("Um pequeno homem de um grande Deus"));

  const renderContent = () => {
    switch (activeTab) {
      case 'sales':
        return (
          <>
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
            <BookDrawer
              book={selectedBook}
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              onSell={handleSellBook}
            />
          </>
        );
      case 'dashboard':
        return <EnhancedDashboard salesData={salesData} />;
      case 'profile':
        return <ProfilePage />;
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
                {activeTab === 'dashboard' && 'Análise de vendas'}
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

      <InstallPrompt />
    </div>
  );
};

export default Index;