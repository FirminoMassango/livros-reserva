
import { useParams, useLocation } from "react-router-dom";
import { CheckoutForm } from "@/components/CheckoutForm";
import { useBooks } from "@/hooks/useBooks";

export default function Checkout() {
  const { id } = useParams();
  const location = useLocation();
  const { books, loading } = useBooks();
  const searchParams = new URLSearchParams(location.search);
  const qtd = Number(searchParams.get("qtd")) || 1;
  const book = books.find((b) => b.id === id);
  if (loading) return <div className="container mx-auto py-8">Carregando...</div>;
  if (!book) return <div>Livro não encontrado.</div>;
  return <CheckoutForm cartItems={[{ id: book.id, book, quantity: qtd }]} total={book.price * qtd} onSubmit={() => {}} onBack={() => window.history.back()} loading={false} confirmButtonText="Finalizar" />;
}
