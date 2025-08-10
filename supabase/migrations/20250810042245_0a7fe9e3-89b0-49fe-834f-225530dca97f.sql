-- Remover o usuário admin problemático se existir
DELETE FROM auth.users WHERE email = 'admin@livraria.mz';
DELETE FROM public.profiles WHERE email = 'admin@livraria.mz';

-- Criar um usuário admin existente como admin (usando usuário já no sistema)
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'elsairisr@gmail.com';

-- Se não existir, vamos usar o sistema normal do Supabase
-- O usuário admin será criado manualmente através da interface