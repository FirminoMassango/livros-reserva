import { useState, useEffect } from "react";
import { Book } from "@/types/book";
import { initialBooks } from "@/data/books";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Dashboard } from "@/components/Dashboard";
import { BookList } from "@/components/BookList";
import { useToast } from "@/hooks/use-toast";
import { BookOpen } from "lucide-react";

const Index = () => {
  const [books, setBooks] = useLocalStorage<Book[]>("bookstore-books", initialBooks);
  const { toast } = useToast();

  const handleSellBook = (bookId: string) => {
    setBooks(prevBooks => 
      prevBooks.map(book => 
        book.id === bookId 
          ? { ...book, sold: true }
          : book
      )
    );

    const soldBook = books.find(book => book.id === bookId);
    if (soldBook) {
      toast({
        title: "Livro vendido!",
        description: `"${soldBook.title}" foi marcado como vendido por R$ ${soldBook.price.toFixed(2)}.`,
      });
    }
  };

  const handleReset = () => {
    setBooks(initialBooks);
    toast({
      title: "Vendas resetadas",
      description: "Todos os livros foram marcados como disponíveis novamente.",
    });
  };

  const totalSold = books.filter(book => book.sold).length;
  const totalRevenue = books
    .filter(book => book.sold)
    .reduce((sum, book) => sum + book.price, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Livraria Digital
              </h1>
              <p className="text-sm text-muted-foreground">
                Sistema de vendas presenciais
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Dashboard 
          totalSold={totalSold}
          totalRevenue={totalRevenue}
          totalBooks={books.length}
        />
        
        <BookList 
          books={books}
          onSell={handleSellBook}
          onReset={handleReset}
        />
      </main>
    </div>
  );
};

export default Index;
