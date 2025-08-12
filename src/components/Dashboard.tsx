import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarValor } from "@/lib/utils";
import { DollarSign, BookCheck, TrendingUp } from "lucide-react";

interface DashboardProps {
  totalSold: number;
  totalRevenue: number;
  totalBooks: number;
}

export function Dashboard({ totalSold, totalRevenue, totalBooks }: DashboardProps) {
  const percentageSold = totalBooks > 0 ? (totalSold / totalBooks * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Livros Vendidos
          </CardTitle>
          <BookCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {totalSold}
          </div>
          <p className="text-xs text-muted-foreground">
            de {totalBooks} livros
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Arrecadado
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
           { formatarValor(totalRevenue) } MT
          </div>
          <p className="text-xs text-muted-foreground">
            vendas em dinheiro
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Progresso
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">
            {percentageSold.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            do estoque vendido
          </p>
        </CardContent>
      </Card>
    </div>
  );
}