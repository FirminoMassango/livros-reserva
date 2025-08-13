import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Phone, MapPin, ShoppingBag, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatarValor } from "@/lib/utils";
import { Reservation } from "@/hooks/useReservations";

interface ReservationCardProps {
  reservation: Reservation;
  selected: boolean;
  onClick: () => void;
}

export function ReservationCard({
  reservation,
  selected,
  onClick,
}: ReservationCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selected ? "ring-2 ring-primary" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-sm">{reservation.customer_name}</h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(reservation.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </p>
          </div>
          <Badge
            className={`flex items-center gap-1 ${reservation.status === "completed"
              ? "bg-green-100 text-green-800 border-green-300"
              : "bg-yellow-100 text-yellow-800 border-yellow-300"
            }`}
          >
            {reservation.status === "completed" ? (
              <ShoppingBag className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            {reservation.status === "completed" ? "Concluída" : "Pendente"}
          </Badge>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {reservation.customer_phone}
          </p>
          {reservation.customer_alternative_phone && (
            <p className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {reservation.customer_alternative_phone}
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
            {reservation.reservation_items.length} {reservation.reservation_items.length === 1 ? "livro" : "livros"}
          </span>
          <span className="font-bold text-sm">
            {formatarValor(reservation.total_amount)} MT
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
