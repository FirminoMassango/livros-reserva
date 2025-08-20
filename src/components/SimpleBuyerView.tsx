import { useState, useEffect, useRef } from "react";
import { useBooks } from "@/hooks/useBooks";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useReservations } from "@/hooks/useReservations";
import {
  ShoppingCart,
  BookOpen,
  Sparkles,
  Plus,
  Minus,
  UserCog,
  CreditCard,
  CheckCircle,
  Trash2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReservationForm } from "@/components/ReservationForm";
import { CartAdjustmentDrawer } from "@/components/CartAdjustmentDrawer";
import { Login } from "@/components/Login";
import { Book } from "@/hooks/useBooks";
import { formatarValor } from "@/lib/utils";
import jsPDF from "jspdf";

interface SimpleCartItem {
  id: string;
  book: Book;
  quantity: number;
  totalPrice: number;
}

interface ReservationReference {
  reservation_number: number;
  date: string;
  items: { title: string; quantity: number; price: number }[];
  total: number;
}

export function SimpleBuyerView() {
  const { books, loading } = useBooks();
  const { user } = useAuth();
  const { createReservation } = useReservations();
  const [cartItems, setCartItems] = useState<SimpleCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [showSellerLogin, setShowSellerLogin] = useState(false);
  const [showCartAdjustment, setShowCartAdjustment] = useState(false);
  const [selectedBookForAdjustment, setSelectedBookForAdjustment] = useState<Book | null>(null);
  const { toast } = useToast();
  const [references, setReferences] = useState<ReservationReference[]>([]);
  const [showReferencesModal, setShowReferencesModal] = useState(false);
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);
  const [pendingReservation, setPendingReservation] = useState<ReservationReference | null>(null);
  const downloadButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("reservation_references");
    if (stored) {
      setReferences(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (showDownloadPrompt && downloadButtonRef.current) {
      downloadButtonRef.current.focus();
    }
  }, [showDownloadPrompt]);

  const saveReference = (ref: ReservationReference) => {
    const updated = [...references, ref];
    setReferences(updated);
    localStorage.setItem("reservation_references", JSON.stringify(updated));
  };

  const generatePDF = (ref: ReservationReference) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;

    const entityName = "Lorem Ipsum Livraria - Moçambique";

    // Header
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text("Comprovativo de Reserva", margin, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${entityName}`, pageWidth - margin - 60, 20);

    // Reservation Details
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, 35, pageWidth - margin, 35);
    doc.text(`Referência: #RES-${ref.reservation_number}`, margin, 45);
    doc.text(`Data: ${ref.date}`, margin, 55);
    doc.setFont("helvetica", "bold");
    doc.text("Itens Reservados:", margin, 65);
    doc.setFont("helvetica", "normal");
    let y = 75;
    ref.items.forEach((item) => {
      const itemText = `- ${item.title} x${item.quantity} (${formatarValor(item.price)} MT)`;
      doc.text(itemText, margin + 5, y, { maxWidth: maxWidth - 5 });
      y += doc.getTextDimensions(itemText, { maxWidth: maxWidth - 5 }).h + 3;
    });
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ${formatarValor(ref.total)} MT`, margin, y + 10);

    // Footer
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`${entityName} | Desenvolvido por CrossCode`, margin, pageHeight - 15);
    doc.text(`Página ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - margin - 20, pageHeight - 15);

    doc.save(`comprovativo_RES-${ref.reservation_number}.pdf`);
  };

  const addToCart = (book: Book, quantity: number = 1) => {
    const existingItem = cartItems.find((item) => item.book.id === book.id);

    if (existingItem) {
      setCartItems((items) =>
        items.map((item) =>
          item.book.id === book.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                totalPrice: (item.quantity + quantity) * book.price,
              }
            : item
        )
      );
    } else {
      const newItem: SimpleCartItem = {
        id: `cart-${Date.now()}`,
        book,
        quantity,
        totalPrice: book.price * quantity,
      };
      setCartItems((items) => [...items, newItem]);
    }

    toast({
      title: "Livro adicionado!",
      description: `${book.title} foi adicionado ao carrinho`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((items) => items.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((items) =>
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * item.book.price,
            }
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
    const reservation = await createReservation(
      formData,
      cartItems.map((item) => ({
        book: item.book,
        quantity: item.quantity,
      }))
    );

    if (reservation && reservation.reservation_number) {
      const ref: ReservationReference = {
        reservation_number: reservation.reservation_number,
        date: new Date().toLocaleString(),
        items: cartItems.map((item) => ({
          title: item.book.title,
          quantity: item.quantity,
          price: item.totalPrice,
        })),
        total: totalPrice,
      };
      setPendingReservation(ref);
      saveReference(ref);
      setShowDownloadPrompt(true); // Show popup immediately
      clearCart();
      setShowReservationForm(false);
      setIsCartOpen(false);
      toast({
        title: "Reserva realizada!",
        description: `Reserva criada com sucesso. Referência: #RES-${reservation.reservation_number}`,
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
      user_id: "",
      created_at: "",
      updated_at: "",
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
        created_at: "",
        updated_at: "",
      },
    };

    toast({
      title: "Reserva criada!",
      description: `Reserva de ${quantity}x ${book.title} criada pelo vendedor`,
    });
  };

  if (showReservationForm) {
    return (
      <>
        <ReservationForm
          cartItems={cartItems.map((item) => ({
            id: item.id,
            book_id: item.book.id,
            user_id: "",
            created_at: "",
            updated_at: "",
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
              created_at: "",
              updated_at: "",
            },
          }))}
          total={totalPrice}
          onSubmit={handleReservationComplete}
          onBack={() => setShowReservationForm(false)}
        />

        {showDownloadPrompt && pendingReservation && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full text-center">
              <h2 className="text-lg font-bold mb-2">Reserva realizada!</h2>
              <p className="mb-4">Deseja baixar o comprovativo da reserva?</p>
              <div className="flex gap-4 justify-center">
                <Button
                  ref={downloadButtonRef}
                  onClick={() => {
                    generatePDF(pendingReservation);
                    setShowDownloadPrompt(false);
                    setPendingReservation(null);
                  }}
                  size="lg"
                >
                  Baixar comprovativo
                </Button>
                <Button
                  onClick={() => {
                    setShowDownloadPrompt(false);
                    setPendingReservation(null);
                  }}
                  variant="outline"
                  size="lg"
                >
                  Não agora
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Lorem Ipsum
                </h1>
                <p className="text-sm text-muted-foreground">Moçambique</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
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
            </div>
          </div>
        </div>
      </header>

      <section
        className="py-12 px-4 animate-fadeIn"
        aria-labelledby="hero-title"
      >
        <div className="container text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles
              className="w-8 h-8 text-accent animate-pulse"
              aria-hidden="true"
            />
            <h2
              id="hero-title"
              className="text-3xl md:text-5xl font-bold text-foreground"
            >
              Reserve seus livros em minutos!
            </h2>
            <Sparkles
              className="w-8 h-8 text-accent animate-pulse"
              aria-hidden="true"
            />
          </div>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Encontre, reserve e levante. Simples e rápido!
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 hover:text-foreground transition-colors">
              <CreditCard className="w-5 h-5 text-primary" aria-hidden="true" />
              <span>Pagamento na retirada</span>
            </div>
            <div className="flex items-center gap-2 hover:text-foreground transition-colors">
              <CheckCircle
                className="w-5 h-5 text-green-600"
                aria-hidden="true"
              />
              <span>Reserva garantida</span>
            </div>
          </div>
        </div>
      </section>

      <main className="px-4 pb-8">
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {books.map((book) => (
                <Card
                  key={book.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[2/3] sm:aspect-[3/4] relative overflow-hidden">
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
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {book.author}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">
                        {formatarValor(book.price)} MT
                      </span>
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
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 bg-muted/30 rounded"
                    >
                      <img
                        src={item.book.cover}
                        alt={item.book.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {item.book.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {item.book.author}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              size="sm"
                              variant="outline"
                              className="w-6 h-6 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              size="sm"
                              variant="outline"
                              className="w-6 h-6 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">
                              {formatarValor(item.totalPrice)} MT
                            </p>
                            <Button
                              onClick={() => removeFromCart(item.id)}
                              size="sm"
                              variant="destructive"
                              className="w-6 h-6 p-0 ml-4"
                              aria-label={`Remover ${item.book.title} do carrinho`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
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
                  <span className="text-lg font-bold text-primary">
                    {formatarValor(totalPrice)} MT
                  </span>
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

      <CartAdjustmentDrawer
        isOpen={showCartAdjustment}
        onClose={() => setShowCartAdjustment(false)}
        selectedBook={selectedBookForAdjustment}
        onAddToCart={addToCart}
        onReservationSubmit={async (formData, book, quantity) => {
          await createReservation(formData, [{ book, quantity }]);
          toast({
            title: "Reserva realizada!",
            description: `${quantity}x ${book.title} reservados com sucesso.`,
          });
        }}
      />

      {showSellerLogin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <Login onClose={() => setShowSellerLogin(false)} />
          </div>
        </div>
      )}

      {references.length > 0 && (
        <Button
          onClick={() => setShowReferencesModal(true)}
          variant="outline"
          size="icon"
          title="Ver comprovativos"
          className="fixed bottom-20 right-4 rounded-full w-14 h-14 shadow-lg z-50"
        >
          <FileText className="w-5 h-5" />
        </Button>
      )}

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

      {showReferencesModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Comprovativos gerados</h2>
            {references.length === 0 ? (
              <p className="text-muted-foreground">Nenhum comprovativo gerado.</p>
            ) : (
              <ul className="mb-4">
                {references.map((ref, idx) => (
                  <li key={idx} className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-sm">#RES-{ref.reservation_number}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generatePDF(ref)}
                    >
                      Baixar PDF
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <Button onClick={() => setShowReferencesModal(false)} size="sm" className="w-full mt-2">Fechar</Button>
          </div>
        </div>
      )}
    </div>
  );
}