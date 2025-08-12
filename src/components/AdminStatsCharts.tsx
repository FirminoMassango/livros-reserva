import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

// Exemplo de componente de estatísticas usando Recharts
export function AdminStatsCharts({ salesByBook, salesByPayment, salesOverTime }) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Vendas por Livro */}
      <div className="bg-white rounded-xl p-4 border">
        <h3 className="font-bold mb-2">Vendas por Livro</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesByBook}>
            <XAxis dataKey="title" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalSold" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Vendas por Método de Pagamento */}
      <div className="bg-white rounded-xl p-4 border">
        <h3 className="font-bold mb-2">Métodos de Pagamento</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={salesByPayment} dataKey="value" nameKey="method" cx="50%" cy="50%" outerRadius={100} label>
              {salesByPayment.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Vendas ao Longo do Tempo */}
      <div className="bg-white rounded-xl p-4 border col-span-2">
        <h3 className="font-bold mb-2">Vendas ao Longo do Tempo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesOverTime}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#845EC2" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
