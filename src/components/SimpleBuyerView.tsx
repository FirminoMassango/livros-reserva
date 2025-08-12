import { useState } from 'react';
import { useBooks } from '@/hooks/useBooks';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useReservations } from '@/hooks/useReservations'; // Adicione esta importação
import { ShoppingCart, BookOpen, Sparkles, Plus, Minus, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ReservationForm } from '@/components/ReservationForm';
import { CartAdjustmentDrawer } from '@/components/CartAdjustmentDrawer';
import { Login } from '@/components/Login';
import { Book } from '@/hooks/useBooks';

interface SimpleCartItem {
  id: string;
  book: Book;
  quantity: number;
  totalPrice: number;
}

export function SimpleBuyerView() {
  const { books, loading } = useBooks();
  const { user } = useAuth();
  const { createReservation } = useReservations(); // Adicione esta linha
  const [cartItems, setCartItems] = useState<SimpleCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [showSellerLogin, setShowSellerLogin] = useState(false);
  const [showCartAdjustment, setShowCartAdjustment] = useState(false);
  const [selectedBookForAdjustment, setSelectedBookForAdjustment] = useState<Book | null>(null);
  const { toast } = useToast();

  const addToCart = (book: Book, quantity: number = 1) => {
    const existingItem = cartItems.find(item => item.book.id === book.id);
    
    if (existingItem) {
      setCartItems(items => 
        items.map(item => 
          item.book.id === book.id 
            ? { ...item, quantity: item.quantity + quantity, totalPrice: (item.quantity + quantity) * book.price }
            : item
        )
      );
    } else {
      const newItem: SimpleCartItem = {
        id: `cart-${Date.now()}`,
        book,
        quantity,
        totalPrice: book.price * quantity
      };
      setCartItems(items => [...items, newItem]);
    }

    toast({
      title: "Livro adicionado!",
      description: `${book.title} foi adicionado ao carrinho`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.book.price }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleReservationComplete = async (formData: any) => {
    // Chamar a função createReservation do hook useReservations
    const reservationId = await createReservation(
      formData,
      cartItems.map(item => ({
        book: item.book,
        quantity: item.quantity
      }))
    );

    console.log("reservationId:",reservationId)

    if (reservationId) {
      clearCart();
      setShowReservationForm(false);
      setIsCartOpen(false);
      toast({
        title: "Reserva realizada!",
        description: `Reserva criada com sucesso. ID: ${reservationId}`,
      });
    }
  };
  
  const handleSellerAdjustment = (book: Book) => {
    setSelectedBookForAdjustment(book);
    setShowCartAdjustment(true);
  };

  const handleSellerReservation = (book: Book, quantity: number) => {
    const cartItem = {
      id: `temp-${book.id}`,
      book_id: book.id,
      user_id: '',
      created_at: '',
      updated_at: '',
      quantity: quantity,
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        cover: book.cover,
        category: book.category,
        description: book.description,
        stock: book.stock,
        created_at: '',
        updated_at: ''
      }
    };

    // Simular reserva para vendedor
    toast({
      title: "Reserva criada!",
      description: `Reserva de ${quantity}x ${book.title} criada pelo vendedor`,
    });
  };

  if (showReservationForm) {
    return (
      <ReservationForm
        cartItems={cartItems.map(item => ({
          id: item.id,
          book_id: item.book.id,
          user_id: '',
          created_at: '',
          updated_at: '',
          quantity: item.quantity,
          book: {
            id: item.book.id,
            title: item.book.title,
            author: item.book.author,
            price: item.book.price,
            cover: item.book.cover,
            category: item.book.category,
            description: item.book.description,
            stock: item.book.stock,
            created_at: '',
            updated_at: ''
          }
        }))}
        total={totalPrice}
        onSubmit={handleReservationComplete}
        onBack={() => setShowReservationForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Livraria Digital</h1>
                <p className="text-sm text-muted-foreground">Moçambique</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Livros disponíveis</p>
                <p className="text-lg font-bold text-primary">{books.length}</p>
              </div>
              
              {totalItems > 0 && (
                <Button
                  onClick={() => setIsCartOpen(true)}
                  className="relative"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Carrinho
                  <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground">
                    {totalItems}
                  </Badge>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-accent" />
            <h2 className="text-3xl font-bold text-foreground">
              Reserve seus livros favoritos
            </h2>
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Encontre, reserve e retire seus livros na nossa livraria. 
            Processo simples e rápido, sem necessidade de cadastro!
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              Sem cadastro necessário
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Pagamento na retirada
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              Reserva garantida
            </div>
          </div>
        </div>
      </section>

      {/* Books List */}
      <main className="px-4 pb-8">
        <div className="container mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg aspect-[3/4] mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-2 w-2/3"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {books.map((book) => (
                <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                    {book.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive">Esgotado</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{book.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{book.author}</p>
                    <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{book.price.toFixed(2)} MZN</span>
                      <Button
                        onClick={() => handleSellerAdjustment(book)}
                        disabled={book.stock === 0}
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                  </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Cart Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex">
          <div className="ml-auto bg-white w-full max-w-md h-full overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Carrinho</h2>
                <Button
                  onClick={() => setIsCartOpen(false)}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Carrinho vazio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded">
                      <img
                        src={item.book.cover}
                        alt={item.book.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.book.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.book.author}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              size="sm"
                              variant="outline"
                              className="w-6 h-6 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <Button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              size="sm"
                              variant="outline"
                              className="w-6 h-6 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{item.totalPrice.toFixed(2)} MZN</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cartItems.length > 0 && (
              <div className="p-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="text-lg font-bold text-primary">{totalPrice.toFixed(2)} MZN</span>
                </div>
                <Button
                  onClick={() => setShowReservationForm(true)}
                  className="w-full"
                  size="lg"
                >
                  Fazer Reserva
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seller Cart Adjustment Drawer */}
      <CartAdjustmentDrawer
        isOpen={showCartAdjustment}
        onClose={() => setShowCartAdjustment(false)}
        selectedBook={selectedBookForAdjustment}
        onAddToCart={addToCart}
        onReservationSubmit={async (formData, book, quantity) => {
          // Chamar createReservation com os dados do formulário e do livro
          await createReservation(
            formData,
            [{ book, quantity }]
          );
          toast({
            title: "Reserva realizada!",
            description: `${quantity}x ${book.title} reservados com sucesso.`
          });
        }}
      />

      {/* Seller Login */}
      {showSellerLogin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <Login onClose={() => setShowSellerLogin(false)} />
          </div>
        </div>
      )}

      {/* Seller Login Button */}
      {!user && (
        <Button
          onClick={() => setShowSellerLogin(true)}
          className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg z-50"
          size="icon"
          title="Acesso Vendedor"
        >
          <UserCog className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}