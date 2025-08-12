import { Book } from "@/hooks/useBooks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock } from "lucide-react";
import { formatarValor } from "@/lib/utils";

interface BookOfTheDayProps {
  book: Book | null;
  onClick: () => void;
}

export function BookOfTheDay({ book, onClick }: BookOfTheDayProps) {
  if (!book) return null;

  return (
    <Card className="mb-6 overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <CardContent className="p-0">
        <div className="flex items-center gap-4 p-4">
          {/* Livro do Dia Badge */}
          <div className="absolute top-4 left-4 z-10">
            <Badge variant="default" className="bg-primary text-primary-foreground">
              <Star className="w-3 h-3 mr-1" />
              Livro do Dia
            </Badge>
          </div>

          {/* Book Cover */}
          <div 
            className="relative w-20 h-28 rounded-lg overflow-hidden shadow-lg cursor-pointer flex-shrink-0"
            onClick={onClick}
          >
            <img 
              src={book.cover} 
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Book Info */}
          <div className="flex-1 space-y-2 min-w-0">
            <h3 
              className="font-bold text-lg leading-tight line-clamp-2 cursor-pointer hover:text-primary transition-colors"
              onClick={onClick}
            >
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              por {book.author}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {book.category}
              </Badge>
              <span className="text-lg font-bold text-primary">
                {formatarValor(book.price)} MT
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {book.description}
            </p>
          </div>

          {/* Quick Action */}
          <div className="flex-shrink-0 text-center">
            <Clock className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Destaque</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}