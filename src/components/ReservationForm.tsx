import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/hooks/useCart';
import { CreateReservationData } from '@/hooks/useReservations';
import { ArrowLeft, User, Phone, Mail, MapPin, FileText, CreditCard } from 'lucide-react';

interface ReservationFormProps {
  cartItems: CartItem[];
  total: number;
  onSubmit: (data: CreateReservationData & { payment_method: string }) => void;
  onBack: () => void;
  loading?: boolean;
}

const pickupLocations = [
  'Loja Principal - Maputo',
  'Loja Secundária - Matola',
  'Ponto de Entrega - Universidade Eduardo Mondlane',
  'Ponto de Entrega - Universidade Católica'
];

const paymentMethods = [
  { value: 'Numerário', label: 'Numerário (Dinheiro)' },
  { value: 'M-Pesa', label: 'M-Pesa' },
  { value: 'e-Mola', label: 'e-Mola' },
  { value: 'POS', label: 'POS (Cartão)' }
];

export function ReservationForm({ 
  cartItems, 
  total, 
  onSubmit, 
  onBack, 
  loading = false 
}: ReservationFormProps) {
  const [formData, setFormData] = useState<CreateReservationData & { payment_method: string }>({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    pickup_location: '',
    notes: '',
    payment_method: 'Numerário'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof (CreateReservationData & { payment_method: string }), value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Confirmar Reserva</h1>
          <p className="text-muted-foreground">Preencha seus dados para finalizar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Número de Telefone *
                </Label>
                <Input
                  id="phone"
                  value={formData.customer_phone}
                  onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                  placeholder="+258 XX XXX XXXX"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail (opcional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => handleInputChange('customer_email', e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Local de Retirada (opcional)
                </Label>
                <Select 
                  value={formData.pickup_location} 
                  onValueChange={(value) => handleInputChange('pickup_location', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o local de retirada" />
                  </SelectTrigger>
                  <SelectContent>
                    {pickupLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Método de Pagamento *
                </Label>
                <Select 
                  value={formData.payment_method} 
                  onValueChange={(value) => handleInputChange('payment_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Observações (opcional)
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold"
                disabled={loading || !formData.customer_name || !formData.customer_phone}
              >
                {loading ? 'Processando...' : 'Finalizar Reserva'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resumo da Reserva */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo da Reserva</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 mb-4">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={item.book.cover} 
                        alt={item.book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm leading-tight line-clamp-2">
                        {item.book.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-1">
                        {item.book.author}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          Qtd: {item.quantity}
                        </Badge>
                        <span className="text-sm font-semibold">
                          {(item.book.price * item.quantity).toFixed(2)} MZN
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{total.toFixed(2)} MZN</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{total.toFixed(2)} MZN</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Importante:</strong> Esta é uma reserva antecipada. 
                O pagamento será realizado no momento da retirada presencial.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}