-- Adicionar coluna payment_method na tabela reservations
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Numerário';

-- Comentário da coluna
COMMENT ON COLUMN public.reservations.payment_method IS 'Método de pagamento: Numerário, M-Pesa, e-Mola, POS';

-- Permitir valores NULL em user_id para compradores não autenticados
ALTER TABLE public.reservations 
ALTER COLUMN user_id DROP NOT NULL;