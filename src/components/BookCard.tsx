import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, BookOpen } from "lucide-react";

interface BookCardProps {
  book: Book;
  onSell: (bookId: string) => void;
}

export function BookCard({ book, onSell }: BookCardProps) {
  const handleSell = () => {
    if (!book.sold) {
      onSell(book.id);
    }
  };

  return (
    <Card className={`relative transition-all duration-200 ${book.sold ? 'opacity-60 bg-muted' : 'hover:shadow-md'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-16 bg-muted rounded flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {book.author}
            </p>
            <p className="text-lg font-bold text-primary">
              R$ {book.price.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          {book.sold ? (
            <div className="flex items-center justify-center gap-2 p-3 bg-success/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="font-medium text-success">VENDIDO</span>
            </div>
          ) : (
            <Button 
              onClick={handleSell}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              Marcar como Vendido
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}