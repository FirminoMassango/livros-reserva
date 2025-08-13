import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarValor } from "@/lib/utils";
import { DollarSign, BookCheck, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

interface DashboardProps {
  totalSold: number;
  totalRevenue: number;
  totalBooks: number;
  salesByDay?: { date: string; total: number }[];
  salesByBook?: { title: string; total: number }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A020F0", "#FF69B4"];

export function Dashboard({ totalSold, totalRevenue, totalBooks, salesByDay = [], salesByBook = [] }: DashboardProps) {
  const percentageSold = totalBooks > 0 ? (totalSold / totalBooks * 100) : 0;

  return (
    <div className="space-y-8">
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

      {/* Gráfico de vendas por dia */}
      {salesByDay.length > 0 && (
        <div className="bg-white rounded-xl p-4 border">
          <h3 className="text-lg font-bold mb-4">Vendas por Dia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByDay}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico de vendas por livro */}
      {salesByBook.length > 0 && (
        <div className="bg-white rounded-xl p-4 border">
          <h3 className="text-lg font-bold mb-4">Vendas por Livro</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={salesByBook} dataKey="total" nameKey="title" cx="50%" cy="50%" outerRadius={100} label>
                {salesByBook.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}