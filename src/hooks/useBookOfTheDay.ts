import { useMemo } from 'react';
import { Book } from './useBooks';
import { APP_CONFIG } from '@/lib/config';

export function useBookOfTheDay(books: Book[]) {
  const bookOfTheDay = useMemo(() => {
    // Primeiro, tenta encontrar pelo ID configurado
    let foundBook = books.find(book => book.id === APP_CONFIG.bookOfTheDayId);
    
    // Se não encontrar pelo ID, busca pelo título
    if (!foundBook) {
      foundBook = books.find(book => 
        book.title.toLowerCase().includes("um pequeno homem de um grande deus")
      );
    }
    
    // Se ainda não encontrar, pega o primeiro livro disponível
    if (!foundBook && books.length > 0) {
      foundBook = books.find(book => book.stock > 0) || books[0];
    }
    
    return foundBook || null;
  }, [books]);

  return { bookOfTheDay };
}