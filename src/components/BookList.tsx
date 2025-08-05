import { Book } from "@/types/book";
import { BookCard } from "./BookCard";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface BookListProps {
  books: Book[];
  onSell: (bookId: string) => void;
  onReset: () => void;
}

export function BookList({ books, onSell, onReset }: BookListProps) {
  const availableBooks = books.filter(book => !book.sold);
  const soldBooks = books.filter(book => book.sold);

  return (
    <div className="space-y-6">
      {/* Reset Button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={onReset}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Resetar Vendas
        </Button>
      </div>

      {/* Available Books */}
      {availableBooks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Livros Disponíveis ({availableBooks.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableBooks.map((book) => (
              <BookCard 
                key={book.id} 
                book={book} 
                onSell={onSell}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sold Books */}
      {soldBooks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
            Livros Vendidos ({soldBooks.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {soldBooks.map((book) => (
              <BookCard 
                key={book.id} 
                book={book} 
                onSell={onSell}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {books.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Nenhum livro cadastrado
          </h3>
          <p className="text-muted-foreground">
            Adicione livros ao catálogo para começar as vendas.
          </p>
        </div>
      )}
    </div>
  );
}