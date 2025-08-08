import { useState } from 'react';
import { CartItem } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';

interface CartDrawerProps {
  cartItems: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onConfirmReservation: () => void;
  total: number;
  itemCount: number;
}

export function CartDrawer({
  cartItems,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onConfirmReservation,
  total,
  itemCount
}: CartDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh] overflow-hidden flex flex-col">
        <DrawerHeader className="text-center flex-shrink-0">
          <div className="mx-auto w-12 h-12 mb-2 rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-primary" />
          </div>
          <DrawerTitle className="text-xl font-bold">
            Carrinho de Compras
          </DrawerTitle>
          <DrawerDescription>
            {itemCount} {itemCount === 1 ? 'item' : 'itens'} no carrinho
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Seu carrinho está vazio</p>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 py-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-muted/30 rounded-lg p-4">
                      <div className="flex gap-3">
                        <div className="w-16 h-20 rounded-md overflow-hidden flex-shrink-0">
                          <img 
                            src={item.book.cover} 
                            alt={item.book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm leading-tight line-clamp-2 mb-1">
                            {item.book.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {item.book.author}
                          </p>
                          <p className="text-sm font-bold text-primary">
                            {item.book.price.toFixed(2)} MZN
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          
                          <Badge variant="secondary" className="px-3 py-1">
                            {item.quantity}
                          </Badge>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.book.stock}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {(item.book.price * item.quantity).toFixed(2)} MZN
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => onRemoveItem(item.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex-shrink-0 bg-muted/20 p-4 space-y-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{total.toFixed(2)} MZN</span>
                </div>
              </div>
            </>
          )}
        </div>

        <DrawerFooter className="flex-shrink-0 pt-4">
          {cartItems.length > 0 ? (
            <Button 
              onClick={onConfirmReservation}
              size="lg"
              className="w-full h-14 text-lg font-semibold"
            >
              Confirmar Reserva
            </Button>
          ) : null}
          <DrawerClose asChild>
            <Button variant="outline" size="lg" className="w-full">
              Fechar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}