-- Inserir o livro "Um pequeno homem de um grande Deus" caso não exista
INSERT INTO public.books (title, author, price, cover, category, description, stock)
SELECT 
  'Um pequeno homem de um grande Deus', 
  'Pastor Evangélico', 
  650.00, 
  'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop',
  'Religioso',
  'Uma obra inspiradora sobre a grandeza de Deus manifestada através de pessoas humildes. Este livro traz reflexões profundas sobre fé, humildade e o propósito divino em nossas vidas.',
  50
WHERE NOT EXISTS (
  SELECT 1 FROM public.books WHERE title = 'Um pequeno homem de um grande Deus'
);