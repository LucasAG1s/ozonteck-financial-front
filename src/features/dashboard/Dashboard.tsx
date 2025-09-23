import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, Building2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import {DashboardData, getDashboardData} from '@/lib/services/dashboard.service'
import { useCompanies } from '@/contexts/CompaniesContext'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from "@/components/ui/skeleton"
import { useState} from 'react'
import { DateRangeFilter } from '@/components/ui/dateRangeFilter'




export function Dashboard() { 

  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-01-30");

  const { selectedCompany } = useCompanies();

  const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard', startDate, endDate, selectedCompany?.id],
    queryFn: () =>
      getDashboardData(startDate, endDate, String(selectedCompany?.id)),
    enabled: !!selectedCompany?.id,
    refetchOnWindowFocus: true,
  });

  const cardsData = data?.cardsData
  const chartsData = data?.chartsData

  const entriesToExpensesChart = chartsData?.entriesToExpensesChart || [];
  const expensesCategoriesChart = chartsData?.expensesCategoriesChart || [];



  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Gerencial</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Gerencial</h1>
          <p className="text-destructive">Erro ao carregar dados do dashboard.</p>
        </div>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-foreground">Dashboard Gerencial</h1>
          <p className="text-muted-foreground">Visão geral do sistema financeiro</p>
        </div>

        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onFilter={(start, end) => {
            setStartDate(start);
            setEndDate(end);
            refetch();
          }}
        />
      </div>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(cardsData.totalEntriesMonth || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {cardsData.growthEntries} em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(cardsData.totalExpensesMonth || 20)}</div>
            <p className="text-xs text-muted-foreground">
              {cardsData.growthExpenses} em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(cardsData.actualBalance || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Saldo positivo este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{cardsData.totalCompanies || 0}</div>
            <p className="text-xs text-muted-foreground">
              CNPJs cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras */}
        <Card>
          <CardHeader>
            <CardTitle>Entradas vs Saídas (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={entriesToExpensesChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="entries" fill="#10b981" name="Entradas" />
                <Bar dataKey="expenses" fill="#ef4444" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza */}
        <Card>
          <CardHeader>
            <CardTitle>Principais Categorias de Despesa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesCategoriesChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="amount" // pega o valor real
                  nameKey="name"  // pega o nome da categoria
                >
                  {expensesCategoriesChart.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || `hsl(${index * 60}, 70%, 50%)`} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)} 
                  labelFormatter={(name: string) => `Categoria: ${name}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}