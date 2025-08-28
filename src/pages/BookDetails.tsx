import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Login } from "@/components/Login";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

export default function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Database["public"]["Tables"]["books"]["Row"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const [cart, setCart] = useState<{ id: string; quantity: number; title: string }[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingAdd, setPendingAdd] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchBook() {
      if (!id) {
        setError("ID do livro não fornecido.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("books")
          .select("*")
          .eq("id", id)
          .single();
        if (mounted) {
          if (fetchError) throw fetchError;
          setBook(data || null);
        }
      } catch (err) {
        if (mounted) setError("Erro ao carregar o livro. Tente novamente mais tarde.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchBook();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-5xl mx-auto animate-pulse space-y-6">
          <div className="h-80 bg-muted/30 rounded-lg" />
          <div className="space-y-4">
            <div className="h-10 bg-muted/30 rounded w-3/4" />
            <div className="h-4 bg-muted/30 rounded w-1/2" />
            <div className="h-20 bg-muted/30 rounded" />
            <div className="h-12 bg-muted/30 rounded w-1/3" />
            <div className="h-14 bg-muted/30 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div className="container mx-auto py-12 px-4 text-center text-red-500">{error}</div>;
  if (!book) return <div className="container mx-auto py-12 px-4 text-center">Livro não encontrado.</div>;

  const handleQuantityChange = (delta: number) => {
    setQuantity((q) => Math.min(Math.max(1, q + delta), book.stock));
  };

  const handleAddToCart = () => {
    if (!user) {
      setPendingAdd(true);
      setShowLogin(true);
      return;
    }
    const existingItem = cart.find((item) => item.id === book.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      );
    } else {
      setCart([...cart, { id: book.id, quantity, title: book.title }]);
    }
    setMessage("Adicionado ao carrinho com sucesso!");
    setTimeout(() => setMessage(null), 3000);
  };

  const handleWishlist = () => {
    setMessage("Adicionado à lista de desejos! (Funcionalidade placeholder)");
    setTimeout(() => setMessage(null), 3000);
  };

  const handleShare = () => {
    setMessage("Link copiado para compartilhar! (Funcionalidade placeholder)");
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6"
          aria-label="Voltar para a página anterior"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] gap-8">
          <div className="w-full h-80 rounded-md overflow-hidden bg-muted/30 flex items-center justify-center">
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-90"
            />
          </div>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold line-clamp-2">{book.title}</h1>
            <p className="text-lg text-muted-foreground">{book.author}</p>
            <p className="text-base line-clamp-4">{book.description}</p>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-lg">Categoria:</span>
              <span className="text-base">{book.category}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-lg">Estoque:</span>
              <span className="text-base">{book.stock}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-lg">Preço unitário:</span>
              <span className="text-primary font-bold text-xl">{book.price} MT</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="font-semibold text-lg">Quantidade:</span>
              <div className="flex items-center gap-3">
                <button
                  className="px-4 py-2 border rounded bg-muted/20 hover:bg-muted/40 disabled:opacity-50 transition-colors"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  aria-label="Diminuir quantidade"
                >
                  -
                </button>
                <span className="px-5 py-2 bg-muted/10 rounded font-bold text-lg">{quantity}</span>
                <button
                  className="px-4 py-2 border rounded bg-muted/20 hover:bg-muted/40 disabled:opacity-50 transition-colors"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= book.stock}
                  aria-label="Aumentar quantidade"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xl">Total:</span>
              <span className="text-2xl font-bold text-primary">{book.price * quantity} MT</span>
            </div>
            <div className="space-y-4">
              <Button
                disabled={book.stock === 0}
                onClick={() => navigate(`/checkout/${book.id}?qtd=${quantity}`)}
                className="w-full h-14 text-xl font-semibold hover:bg-primary/90 transition-colors"
                aria-label={book.stock === 0 ? "Livro indisponível" : `Comprar ${quantity} unidade(s)`}
              >
                {book.stock === 0 ? "Indisponível" : "Comprar"}
              </Button>
              <Button
                onClick={handleAddToCart}
                className="w-full h-14 text-xl font-semibold bg-secondary hover:bg-secondary/90 transition-colors"
                aria-label={`Adicionar ${quantity} unidade(s) ao carrinho`}
              >
                Adicionar ao Carrinho
              </Button>
      {/* Modal de login */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <Login
              onClose={() => {
                setShowLogin(false);
                setPendingAdd(false);
              }}
              onSuccess={() => {
                setShowLogin(false);
                if (pendingAdd) {
                  handleAddToCart();
                  setPendingAdd(false);
                }
              }}
            />
          </div>
        </div>
      )}
            </div>
            {message && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded text-center">{message}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}