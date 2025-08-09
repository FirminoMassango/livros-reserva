-- Criar admin fixo na base de dados
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role,
  aud
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@livraria.mz',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"name": "Administrador Geral"}',
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Criar perfil do admin
INSERT INTO public.profiles (
  id,
  user_id,
  name,
  email,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Administrador Geral',
  'admin@livraria.mz',
  'admin'
) ON CONFLICT (user_id) DO NOTHING;

-- Atualizar função handle_new_user para definir roles corretos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@livraria.mz' THEN 'admin'
      ELSE 'seller'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';