

import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useBooks } from "@/hooks/useBooks";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { ShoppingCart } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { books, loading } = useBooks();
  const cart = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="container mx-auto py-8 relative">
      <h1 className="text-3xl font-bold mb-6">Livros disponíveis</h1>
      {loading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {books.map((book) => (
            <Card
              key={book.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/livro/${book.id}`)}
            >
              <div className="aspect-[2/3] sm:aspect-[3/4] relative overflow-hidden">
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-bold">{book.title}</h2>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Botão flutuante para abrir o carrinho */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center"
        onClick={() => setIsCartOpen(true)}
        title="Abrir carrinho"
      >
        <ShoppingCart className="w-7 h-7" />
        {cart.getCartItemCount() > 0 && (
          <span className="absolute top-2 right-2 bg-accent text-xs rounded-full px-2 py-0.5 font-bold">
            {cart.getCartItemCount()}
          </span>
        )}
      </button>

      {/* Drawer do carrinho */}
      <CartDrawer
        cartItems={cart.cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeFromCart}
        onConfirmReservation={() => {}}
        total={cart.getCartTotal()}
        itemCount={cart.getCartItemCount()}
      />
    </div>
  );
}
