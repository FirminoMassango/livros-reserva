import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Reservation } from "@/hooks/useReservations";
import {
  Phone,
  ShoppingBag,
  AlertCircle,
  CreditCard,
  Search,
  X,
  ListFilter,
} from "lucide-react";
import { format, addDays, isAfter, isBefore, isEqual } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { formatarValor } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ReservationCard } from "./ReservationCard";
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface ReservationsPanelProps {
  reservations: Reservation[];
  onUpdateStatus: (
    reservationId: string,
    userId: string,
    status: string,
    notes?: string
  ) => void;
  loading: boolean;
}

export function ReservationsPanel({
  reservations,
  onUpdateStatus,
  loading,
}: ReservationsPanelProps) {
  const { profile, isAdmin } = useSupabaseAuth();
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const today = format(new Date(), "yyyy-MM-dd");
  const fiveDaysAgo = format(addDays(new Date(), -5), "yyyy-MM-dd");
  const [startDate, setStartDate] = useState<string>(fiveDaysAgo);
  const [endDate, setEndDate] = useState<string>(today);
  const [searchContent, setSearchContent] = useState<string>("");
  const [isSearchInputVisible, setIsSearchInputVisible] = useState<boolean>(false);



  useEffect(() => {
    if (selectedReservation) {
      setNotes(selectedReservation.notes || "");
    }
  }, [selectedReservation]);

  // Filtra reservas pelo range de datas
  const filteredReservations = reservations.filter((reservation) => {
    if (!startDate && !endDate) return true;
    const created = new Date(reservation.created_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? addDays(new Date(endDate), 1) : null; // inclui o dia final
    if (start && end) {
      return (isAfter(created, start) || isEqual(created, start)) && (isBefore(created, end));
    } else if (start) {
      return isAfter(created, start) || isEqual(created, start);
    } else if (end) {
      return isBefore(created, end);
    }
    return true;
  });


  const isAdminProfile = profile?.role === 'admin';



  // Filtra reservas pagas/concluídas (agora qualquer usuário vê todas)
  const completedReservations = 
          isAdminProfile ?
                filteredReservations.filter(r => r.status === 'completed' && ((String(r.reservation_number).includes(searchContent) || r.customer_name.toLowerCase().includes(searchContent.toLowerCase()))))
                :
                filteredReservations.filter(r => r.status === 'completed' && r.user_id === profile?.user_id && ((String(r.reservation_number).includes(searchContent) || r.customer_name.toLowerCase().includes(searchContent.toLowerCase()))));
                
  // Pendentes sempre mostra todas
  const pendingReservations = filteredReservations.filter(r => r.status === 'pending' && ((String(r.reservation_number).includes(searchContent) || r.customer_name.toLowerCase().includes(searchContent.toLowerCase()))));
  // const pendingReservations = filteredReservations.filter(r => r.status === 'pending' || r.reservation_number === Number(searchContent));

  // Estatísticas para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2'];
  const salesByBook = Object.values(
    completedReservations.reduce((acc, r) => {
      r.reservation_items.forEach(item => {
        if (!acc[item.book.title]) {
          acc[item.book.title] = { title: item.book.title, totalSold: 0 };
        }
        acc[item.book.title].totalSold += item.quantity;
      });
      return acc;
    }, {} as Record<string, { title: string; totalSold: number }>)
  );
  const salesByPayment = Object.values(
    completedReservations.reduce((acc, r) => {
      if (r.payment_method) {
        if (!acc[r.payment_method]) {
          acc[r.payment_method] = { method: r.payment_method, value: 0 };
        }
        acc[r.payment_method].value += 1;
      }
      return acc;
    }, {} as Record<string, { method: string; value: number }>)
  );
  const salesOverTime = completedReservations.reduce((acc, r) => {
    const date = format(new Date(r.created_at), 'dd/MM/yyyy');
    const found = acc.find(d => d.date === date);
    if (found) {
      found.total += r.total_amount;
    } else {
      acc.push({ date, total: r.total_amount });
    }
    return acc;
  }, [] as { date: string; total: number }[]);

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-white hover:bg-gray-100 hover:text-slate-700" size="sm">
              Filtrar <ListFilter />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="p-4">
              <Label htmlFor="start-date" className="mr-2">Data inicial</Label>
              <input
                id="start-date"
                type="date"
                className="w-full border rounded px-2 py-1"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                max={endDate}
              />
            </div>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Label htmlFor="end-date" className="mr-2">Data final</Label>
              <input
                id="end-date"
                type="date"
                className="w-full border rounded px-2 py-1"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Campo de pesquisa*/}
      {isSearchInputVisible &&
        <div className="m-0 p-0">
          <div className="fixed top-0 left-0 w-full z-50 bg-white h-32 border flex items-center">
            <input
              id="pesquisa"
              className="w-full h-10 border rounded px-2 py-1 mx-4"
              onChange={(e) => setSearchContent(e.target.value)}
              placeholder="pesquisar..."
            />
            <X className="w-8 h-8 mr-3 text-muted-foreground cursor-pointer" 
              onClick={() => {
                setIsSearchInputVisible(!isSearchInputVisible)
                setSearchContent("")
                }
              }
            />
          </div>
        </div>
      }
      
      {/* Botão de Pesquisa */}
      <Search className="fixed top-1 right-12 z-40 w-6 h-6 mr-3 text-muted-foreground cursor-pointer" onClick={() => setIsSearchInputVisible(!isSearchInputVisible)}/>
      
      {filteredReservations.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhuma reserva encontrada
              </h3>
              <p className="text-muted-foreground">
                As reservas dos clientes aparecerão aqui
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Lista de Reservas */}
          <div className="space-y-4 ">
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  Pendente(s)
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-2">
                  Pago(s)
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="space-y-4">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {pendingReservations.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        selected={selectedReservation?.id === reservation.id}
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setIsOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="completed" className="space-y-4">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {completedReservations.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        selected={selectedReservation?.id === reservation.id}
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setIsOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          {/* Detalhes da Reserva Selecionada */}
          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) {
                setSelectedReservation(null);
                setNotes("");
              }
            }}
          >
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalhes da {selectedReservation.status === 'pending' ? 'Reserva' : 'Compra'}</DialogTitle>
              </DialogHeader>
              {selectedReservation ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedReservation.customer_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="pl-6 space-y-1 text-sm">
                        <p className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {selectedReservation.customer_phone}
                        </p>
                        {selectedReservation.customer_alternative_phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {selectedReservation.customer_alternative_phone}
                          </p>
                        )}
                        {selectedReservation.payment_method && (
                          <p className="flex items-center gap-2">
                            <CreditCard className="w-3 h-3" />
                            {selectedReservation.payment_method}
                          </p>
                        )}
                      </div>
                    </div>
                    <Tabs defaultValue="observacoes" className="space-y-4">
                      <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="observacoes">Observações</TabsTrigger>
                        <TabsTrigger value="livros">{selectedReservation.status === 'pending' ? 'Livros Reservados' : 'Livros Pagos'}</TabsTrigger>
                      </TabsList>
                      <TabsContent value="observacoes">
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
                      </TabsContent>
                      <TabsContent value="livros">
                        <ScrollArea className="h-48">
                          <div className="space-y-2">
                            {selectedReservation.reservation_items.map((item) => (
                              <div
                                key={item.id}
                                className="flex gap-3 p-2 bg-muted/30 rounded"
                              >
                                <div className="w-10 h-12 rounded overflow-hidden flex-shrink-0">
                                  <img
                                    src={item.book.cover}
                                    alt={item.book.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium line-clamp-1">
                                    {item.book.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.book.author}
                                  </p>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs">
                                      Qtd: {item.quantity}
                                    </span>
                                    <span className="text-sm font-semibold">
                                      {formatarValor(item.total_price)} MT
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>

                    <Separator />

                    <div className="text-center mb-4">
                      <div className="text-lg font-bold">
                        Total: {formatarValor(selectedReservation.total_amount)} MT
                      </div>
                    </div>
                    { selectedReservation.status === 'pending' && 
                        <Button
                          onClick={() => {
                            if (selectedReservation) {
                              onUpdateStatus(
                                selectedReservation.id,
                                profile.user_id,
                                "completed",
                                notes
                              );
                              setSelectedReservation(null);
                              setNotes("");
                              setIsOpen(false);
                            }
                          }}
                          className="w-full"
                        >
                          Confirmar Reserva
                        </Button>
                    }
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
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
