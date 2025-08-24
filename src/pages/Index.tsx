import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Login } from '@/components/Login';
import { SimpleBuyerView } from '@/components/SimpleBuyerView';
import { SellerView } from '@/components/SellerView';
import { Button } from '@/components/ui/button';
import { UserCog } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function Index() {
  const { user, loading } = useSupabaseAuth();
  const [showSellerLogin, setShowSellerLogin] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se é vendedor/admin autenticado, mostrar painel de vendedor
  if (user) {
    return <SellerView />;
  }

  // Se mostrar login do vendedor
  if (showSellerLogin) {
    return (
      <div className="relative">
        <Login />
        <Button
          onClick={() => setShowSellerLogin(false)}
          variant="outline"
          className="absolute top-4 left-4"
        >
          ← Voltar para reservas
        </Button>
      </div>
    );
  }

  // Vista padrão para compradores (sem autenticação)
  return (
      <SimpleBuyerView />
  );
}