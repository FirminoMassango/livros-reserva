import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';
import { Book } from '@/hooks/useBooks';
import { ReservationForm } from '@/components/ReservationForm';

interface CartAdjustmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBook: Book | null;
  onAddToCart: (book: Book, quantity: number) => void;
  onReservationSubmit: (formData: any, book: Book, quantity: number) => void;
}

export function CartAdjustmentDrawer({
  isOpen,
  onClose,
  selectedBook,
  onAddToCart,
  onReservationSubmit
}: CartAdjustmentDrawerProps) {
  const [quantity, setQuantity] = useState(1);
  const [showReservationForm, setShowReservationForm] = useState(false);

  const handleQuantityChange = (increment: boolean) => {
    if (increment) {
      setQuantity(prev => prev + 1);
    } else {
      setQuantity(prev => Math.max(1, prev - 1));
    }
  };

  const handleAddToCart = () => {
    if (selectedBook) {
      onAddToCart(selectedBook, quantity);
      setQuantity(1);
      onClose();
    }
  };

  const handleReservationFormSubmit = (formData: any) => {
    if (selectedBook) {
      onReservationSubmit(formData, selectedBook, quantity);
    }
    setShowReservationForm(false);
    onClose();
  };

  if (!selectedBook) return null;

  if (showReservationForm) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fazer Reserva</DialogTitle>
          </DialogHeader>
          <ReservationForm
            cartItems={[{
              id: `temp-${selectedBook.id}`,
              book_id: selectedBook.id,
              user_id: '',
              created_at: '',
              updated_at: '',
              quantity: quantity,
              book: {
                id: selectedBook.id,
                title: selectedBook.title,
                author: selectedBook.author,
                price: selectedBook.price,
                cover: selectedBook.cover,
                category: selectedBook.category,
                description: selectedBook.description,
                stock: selectedBook.stock,
                created_at: '',
                updated_at: ''
              }
            }]}
            total={selectedBook.price * quantity}
            onSubmit={handleReservationFormSubmit}
            onBack={() => setShowReservationForm(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar Quantidade - Vendedor</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-16 h-20 rounded overflow-hidden flex-shrink-0">
              <img 
                src={selectedBook.cover} 
                alt={selectedBook.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{selectedBook.title}</h3>
              <p className="text-xs text-muted-foreground">{selectedBook.author}</p>
              <p className="text-sm font-bold text-primary mt-1">
                {selectedBook.price.toFixed(2)} MZN
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quantidade</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(false)}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-center w-20"
                min="1"
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total:</span>
              <span className="font-bold text-lg">
                {(selectedBook.price * quantity).toFixed(2)} MZN
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleAddToCart}>
              Adicionar ao Carrinho
            </Button>
            <Button onClick={() => setShowReservationForm(true)} variant="secondary">
              Fazer Reserva
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}