import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Shield, Calendar, Mail, BarChart3 } from 'lucide-react';

export function ProfilePage() {
  const { user, logout, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Perfil</h2>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {user.name}
                {isAdmin && (
                  <Badge variant="default" className="gap-1">
                    <Shield className="w-3 h-3" />
                    Admin
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalhes da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Tipo de Conta</span>
            </div>
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {isAdmin ? "Administrador" : "Vendedor"}
            </Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Membro desde</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(user.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Permissões</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {isAdmin ? "Acesso total" : "Vendas apenas"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          <CardDescription>
            Funcionalidades disponíveis para sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isAdmin && (
            <>
              <Button variant="outline" className="w-full justify-start gap-2">
                <BarChart3 className="w-4 h-4" />
                Ver Relatórios Avançados
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <User className="w-4 h-4" />
                Gerenciar Usuários
              </Button>
            </>
          )}
          
          <Button variant="outline" className="w-full justify-start gap-2">
            <Calendar className="w-4 h-4" />
            Histórico de Vendas
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            variant="destructive" 
            className="w-full gap-2" 
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Livraria Digital v1.0.0
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Sistema de vendas presenciais
          </p>
        </CardContent>
      </Card>
    </div>
  );
}