-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'seller' CHECK (role IN ('admin', 'seller')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  cover TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for books
CREATE POLICY "Books are viewable by everyone" ON public.books FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can modify books" ON public.books FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for sales
CREATE POLICY "Users can view all sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Users can create sales" ON public.sales FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@admin.com' THEN 'admin'
      ELSE 'seller'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial books
INSERT INTO public.books (title, author, price, cover, category, description, stock) VALUES
('Dom Casmurro', 'Machado de Assis', 25.00, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop', 'Clássicos', 'Romance clássico da literatura brasileira sobre ciúme e obsessão.', 15),
('O Cortiço', 'Aluísio Azevedo', 22.00, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop', 'Naturalismo', 'Retrato da sociedade brasileira do século XIX através de um cortiço.', 12),
('Iracema', 'José de Alencar', 20.00, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop', 'Romantismo', 'Lenda do Ceará sobre o amor entre a índia Iracema e o colonizador Martim.', 18),
('Memórias Póstumas de Brás Cubas', 'Machado de Assis', 28.00, 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop', 'Realismo', 'Romance narrado por um defunto autor sobre sua vida e sociedade.', 10),
('O Guarani', 'José de Alencar', 24.00, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop', 'Romantismo', 'História de amor entre Ceci e o índio Peri no Brasil colonial.', 14),
('Lucíola', 'José de Alencar', 21.00, 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=600&fit=crop', 'Romantismo', 'Romance urbano sobre redenção e amor no Rio de Janeiro imperial.', 16),
('Casa-Grande & Senzala', 'Gilberto Freyre', 35.00, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop', 'Sociologia', 'Ensaio sobre a formação da sociedade brasileira.', 8),
('Quincas Borba', 'Machado de Assis', 26.00, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop', 'Realismo', 'Continuação das reflexões machadianas sobre a natureza humana.', 11),
('A Moreninha', 'Joaquim Manuel de Macedo', 18.00, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop', 'Romantismo', 'Primeiro romance urbano brasileiro sobre jovens da alta sociedade.', 20),
('Senhora', 'José de Alencar', 23.00, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', 'Romantismo', 'Romance sobre casamento por interesse e redenção pelo amor.', 13);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();