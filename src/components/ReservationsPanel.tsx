import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Reservation } from '@/hooks/useReservations';
import { 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShoppingBag,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReservationsPanelProps {
  reservations: Reservation[];
  onUpdateStatus: (reservationId: string, status: Reservation['status'], notes?: string) => void;
  loading: boolean;
}

const statusConfig = {
  pending: { 
    label: 'Pendente', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: Clock 
  },
  confirmed: { 
    label: 'Confirmada', 
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: CheckCircle 
  },
  completed: { 
    label: 'Concluída', 
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle 
  },
  cancelled: { 
    label: 'Cancelada', 
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: XCircle 
  }
};

export function ReservationsPanel({ 
  reservations, 
  onUpdateStatus, 
  loading 
}: ReservationsPanelProps) {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [newStatus, setNewStatus] = useState<Reservation['status']>('pending');
  const [notes, setNotes] = useState('');

  const handleStatusUpdate = () => {
    if (selectedReservation) {
      onUpdateStatus(selectedReservation.id, newStatus, notes);
      setSelectedReservation(null);
      setNotes('');
    }
  };

  useEffect(() => {
    if (selectedReservation) {
      setNewStatus(selectedReservation.status);
      setNotes(selectedReservation.notes || '');
    }
  }, [selectedReservation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Painel de Reservas</h2>
        <Badge variant="secondary" className="text-sm">
          {reservations.length} {reservations.length === 1 ? 'reserva' : 'reservas'}
        </Badge>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma reserva encontrada</h3>
              <p className="text-muted-foreground">
                As reservas dos clientes aparecerão aqui
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Reservas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reservas Recentes</h3>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {reservations.map((reservation) => {
                  const statusInfo = statusConfig[reservation.status];
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <Card 
                      key={reservation.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedReservation?.id === reservation.id 
                          ? 'ring-2 ring-primary' 
                          : ''
                      }`}
                      onClick={() => setSelectedReservation(reservation)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-sm">{reservation.customer_name}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(reservation.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                          <Badge className={`${statusInfo.color} border text-xs flex items-center gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {reservation.customer_phone}
                          </p>
                          {reservation.customer_email && (
                            <p className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {reservation.customer_email}
                            </p>
                          )}
                          {reservation.pickup_location && (
                            <p className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {reservation.pickup_location}
                            </p>
                          )}
                        </div>

                        <Separator className="my-3" />

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {reservation.reservation_items.length} {reservation.reservation_items.length === 1 ? 'livro' : 'livros'}
                          </span>
                          <span className="font-bold text-sm">
                            {reservation.total_amount.toFixed(2)} MZN
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Detalhes da Reserva Selecionada */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalhes da Reserva</h3>
            
            {selectedReservation ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedReservation.customer_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Informações do Cliente */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Informações do Cliente
                    </h4>
                    <div className="pl-6 space-y-1 text-sm">
                      <p className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {selectedReservation.customer_phone}
                      </p>
                      {selectedReservation.customer_email && (
                        <p className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {selectedReservation.customer_email}
                        </p>
                      )}
                      {selectedReservation.pickup_location && (
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {selectedReservation.pickup_location}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Livros Reservados */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Livros Reservados
                    </h4>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {selectedReservation.reservation_items.map((item) => (
                          <div key={item.id} className="flex gap-3 p-2 bg-muted/30 rounded">
                            <div className="w-10 h-12 rounded overflow-hidden flex-shrink-0">
                              <img 
                                src={item.book.cover} 
                                alt={item.book.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">{item.book.title}</p>
                              <p className="text-xs text-muted-foreground">{item.book.author}</p>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-xs">Qtd: {item.quantity}</span>
                                <span className="text-sm font-semibold">
                                  {item.total_price.toFixed(2)} MZN
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <Separator />

                  {/* Gerenciar Status */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Gerenciar Reserva
                    </h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">Status da Reserva</Label>
                      <Select value={newStatus} onValueChange={(value) => setNewStatus(value as Reservation['status'])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="confirmed">Confirmada</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Adicione observações..."
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={handleStatusUpdate}
                      className="w-full"
                      disabled={newStatus === selectedReservation.status && notes === (selectedReservation.notes || '')}
                    >
                      Atualizar Reserva
                    </Button>
                  </div>

                  <Separator />

                  <div className="text-center">
                    <div className="text-lg font-bold">
                      Total: {selectedReservation.total_amount.toFixed(2)} MZN
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Selecione uma reserva para ver os detalhes
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}