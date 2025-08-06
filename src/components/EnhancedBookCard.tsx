import { Book } from "@/hooks/useBooks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, DollarSign } from "lucide-react";

interface EnhancedBookCardProps {
  book: Book;
  onClick: () => void;
}

export function EnhancedBookCard({ book, onClick }: EnhancedBookCardProps) {
  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Book Cover */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
          <img 
            src={book.cover} 
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          
          {/* Stock badge */}
          <div className="absolute top-2 left-2">
            <Badge variant={book.stock > 10 ? "default" : book.stock > 0 ? "secondary" : "destructive"}>
              <Package className="w-3 h-3 mr-1" />
              {book.stock}
            </Badge>
          </div>

          {/* Category badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
              {book.category}
            </Badge>
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center gap-1 text-white">
              <DollarSign className="w-4 h-4" />
              <span className="text-lg font-bold">
                R$ {book.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Book Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {book.author}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {book.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}