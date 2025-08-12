import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { DollarSign, BookCheck, TrendingUp, Users, Calendar, Package } from "lucide-react";
import { SalesData } from "@/hooks/useSales";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { formatarValor } from "@/lib/utils";

interface EnhancedDashboardProps {
  salesData: SalesData;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function EnhancedDashboard({ salesData }: EnhancedDashboardProps) {
  const { isAdmin, profile } = useSupabaseAuth();

  // Prepare chart data
  const categoryData = Object.entries(salesData.salesByCategory).map(([category, sales]) => ({
    category,
    sales,
    revenue: sales * 25 // Approximate average price
  }));

  const userSalesData = Object.entries(salesData.salesByUser).map(([userId, sales]) => ({
    user: userId.split('-')[0],
    sales,
    revenue: sales * 25
  }));

  const recentSalesData = salesData.recentSales.slice(0, 7).map((sale, index) => ({
    day: `Dia ${index + 1}`,
    vendas: sale.quantity,
    receita: sale.total_price
  }));

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Dashboard de Vendas</h2>
        <p className="text-muted-foreground">
          {isAdmin ? 'Visão geral de todas as vendas' : 'Suas vendas pessoais'}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Livros Vendidos
            </CardTitle>
            <BookCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {salesData.totalSold}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatarValor(salesData.totalRevenue)} MT
            </div>
            <p className="text-xs text-muted-foreground">
              +8% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Ticket Médio</span>
            <span className="font-semibold">
              {salesData.totalSold > 0 ? formatarValor(salesData.totalRevenue / salesData.totalSold) : '0.00'} MT
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Categorias Ativas</span>
            <Badge variant="secondary">
              {Object.keys(salesData.salesByCategory).length}
            </Badge>
          </div>
          {isAdmin && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Vendedores Ativos</span>
              <Badge variant="secondary">
                {Object.keys(salesData.salesByUser).length}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales by Category Chart */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vendas por Categoria</CardTitle>
            <CardDescription>Distribuição de vendas por categoria de livros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <ChartContainer
                config={{
                  sales: { label: "Vendas", color: "hsl(var(--primary))" },
                }}
                className="h-[200px] min-w-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                  <XAxis 
                    dataKey="category" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="sales" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Sales (Admin only) */}
      {isAdmin && userSalesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance por Vendedor</CardTitle>
            <CardDescription>Vendas realizadas por cada vendedor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <ChartContainer
                config={{
                  sales: { label: "Vendas", color: "hsl(var(--secondary))" },
                }}
                className="h-[200px] min-w-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userSalesData} layout="horizontal">
                  <XAxis type="number" fontSize={12} />
                  <YAxis 
                    dataKey="user" 
                    type="category" 
                    fontSize={12}
                    width={60}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="sales" 
                    fill="hsl(var(--secondary))"
                    radius={[0, 4, 4, 0]}
                  />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sales Trend */}
      {recentSalesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tendência de Vendas</CardTitle>
            <CardDescription>Vendas dos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <ChartContainer
                config={{
                  vendas: { label: "Vendas", color: "hsl(var(--accent))" },
                }}
                className="h-[200px] min-w-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recentSalesData}>
                  <XAxis 
                    dataKey="day" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="vendas" 
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                  />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-lg font-bold">7</div>
            <div className="text-xs text-muted-foreground">Dias ativos</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <div className="text-lg font-bold">
              {categoryData.reduce((acc, cat) => acc + cat.sales, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total de itens</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}