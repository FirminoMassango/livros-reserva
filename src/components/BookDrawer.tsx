import { useState } from 'react';
import { Book } from '@/hooks/useBooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Minus, Plus, Package, User, DollarSign, ShoppingCart } from 'lucide-react';
import { formatarValor } from '@/lib/utils';

interface BookDrawerProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onSell: (bookId: string, quantity: number) => void;
  onAddToCart?: (bookId: string, quantity: number) => void;
}

export function BookDrawer({ book, isOpen, onClose, onSell, onAddToCart }: BookDrawerProps) {
  const [quantity, setQuantity] = useState(1);

  if (!book) return null;

  const totalPrice = book.price * quantity;

  const handleSell = () => {
    onSell(book.id, quantity);
    setQuantity(1);
    onClose();
  };

  const incrementQuantity = () => {
    if (quantity < book.stock) {
      setQuantity(q => q + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[80vh] overflow-hidden flex flex-col">
        <DrawerHeader className="text-center flex-shrink-0">
          <div className="mx-auto w-24 h-32 mb-4 rounded-lg overflow-hidden shadow-lg">
            <img 
              src={book.cover} 
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>
          <DrawerTitle className="text-xl font-bold line-clamp-2">
            {book.title}
          </DrawerTitle>
          <DrawerDescription className="text-base text-muted-foreground">
            por {book.author}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-6">
          {/* Price and Category */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-success" />
               <span className="text-2xl font-bold text-success">
                {formatarValor(book.price)} MT
               </span>
            </div>
            <Badge variant="secondary" className="text-sm">
              {book.category}
            </Badge>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Descrição</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {book.description}
            </p>
          </div>

          {/* Stock Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="w-4 h-4" />
            <span>{book.stock} unidades em estoque</span>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-3">
            <Label htmlFor="quantity" className="text-sm font-semibold">
              Quantidade
            </Label>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-3">
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={book.stock}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.min(Math.max(val, 1), book.stock));
                  }}
                  className="w-20 text-center"
                />
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={quantity >= book.stock}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Total Price */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatarValor(totalPrice)} MT</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-success">{formatarValor(totalPrice)} MT</span>
            </div>
          </div>
        </div>

        <DrawerFooter className="flex-shrink-0 pt-4 space-y-2">
          {onAddToCart && (
            <Button 
              onClick={() => onAddToCart(book.id, quantity)}
              size="lg"
              variant="outline"
              className="w-full h-12 text-base font-semibold"
              disabled={book.stock === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {book.stock === 0 ? 'Fora de Estoque' : 'Adicionar ao Carrinho'}
            </Button>
          )}
          <Button 
            onClick={handleSell}
            size="lg"
            className="w-full h-14 text-lg font-semibold"
            disabled={book.stock === 0}
          >
            {book.stock === 0 ? 'Fora de Estoque' : 'Finalizar Venda'}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" size="lg" className="w-full">
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}