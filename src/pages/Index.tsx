import { useState, useMemo } from "react";
import { Book, Sale, SalesData } from "@/types/book";
import { initialBooks } from "@/data/books";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/contexts/AuthContext";
import { Login } from "@/components/Login";
import { EnhancedBookCard } from "@/components/EnhancedBookCard";
import { BookDrawer } from "@/components/BookDrawer";
import { EnhancedDashboard } from "@/components/EnhancedDashboard";
import { ProfilePage } from "@/components/ProfilePage";
import { BottomNavigation } from "@/components/BottomNavigation";
import { InstallPrompt } from "@/components/InstallPrompt";
import { useToast } from "@/hooks/use-toast";
import { BookOpen } from "lucide-react";

const Index = () => {
  const { user, isAdmin } = useAuth();
  const [books, setBooks] = useLocalStorage<Book[]>("bookstore-books", initialBooks);
  const [sales, setSales] = useLocalStorage<Sale[]>("bookstore-sales", []);
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

  const handleSellBook = (bookId: string, quantity: number) => {
    const book = books.find(b => b.id === bookId);
    if (!book || !user) return;

    // Update book stock
    setBooks(prevBooks => 
      prevBooks.map(b => 
        b.id === bookId 
          ? { ...b, stock: Math.max(0, b.stock - quantity) }
          : b
      )
    );

    // Create sale record
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      bookId,
      quantity,
      totalPrice: book.price * quantity,
      userId: user.id,
      timestamp: new Date(),
      book
    };

    setSales(prevSales => [newSale, ...prevSales]);

    toast({
      title: "Venda realizada!",
      description: `${quantity}x "${book.title}" vendido(s) por R$ ${(book.price * quantity).toFixed(2)}.`,
    });
  };

  // Calculate sales data
  const salesData: SalesData = useMemo(() => {
    const userSales = isAdmin ? sales : sales.filter(sale => sale.userId === user?.id);
    
    const totalSold = userSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalRevenue = userSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    
    const salesByCategory = userSales.reduce((acc, sale) => {
      const category = sale.book.category;
      acc[category] = (acc[category] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);

    const salesByUser = sales.reduce((acc, sale) => {
      acc[sale.userId] = (acc[sale.userId] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSold,
      totalRevenue,
      salesByCategory,
      salesByUser: isAdmin ? salesByUser : { [user?.id || '']: totalSold },
      recentSales: userSales.slice(0, 10)
    };
  }, [sales, user, isAdmin]);

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'sales':
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
              {books.map((book) => (
                <EnhancedBookCard
                  key={book.id}
                  book={book}
                  onClick={() => handleBookClick(book)}
                />
              ))}
            </div>
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
      {/* Header */}
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
                {activeTab === 'profile' && `Olá, ${user.name}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
};

export default Index;
