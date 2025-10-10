import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, format, subMonths, subQuarters, subYears } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight, Filter, TrendingUp, TrendingDown, Scale, Target, PieChart, BarChart, CheckCircle, AlertCircle, Info, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton';
import { useCompanies } from '@/hooks/useCompanies';
import { getDre } from '@/lib/services/finance/dre.service'
import { DateRangeFilter } from '@/components/ui/dateRangeFilter';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface DRENode {
  id: number
  name: string
  description: string | null
  parent_id: number | null
  type: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  total: number
  children: DRENode[]
}
interface DREApiResponse {
  dre_tree: DRENode[];
  receita_bruta: number;
  deducoes: number;
  receita_liquida: number;
  cmv_csv: number;
  lucro_bruto: number;
  despesas_operacionais: number;
  lucro_operacional: number;
  outras_receitas_despesas: number;
  lucro_liquido: number;
  margem_bruta: number;
  margem_operacional: number;
  margem_liquida: number;
}

const formatCurrencyBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const isPercentageKey = (key: string) => key.startsWith('margem_')

const formatPercentagePT = (value: number) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(value) + '%'

const formatSummaryValue = (key: string, value: number) =>
  isPercentageKey(key) ? formatPercentagePT(value) : formatCurrencyBRL(value)

const getValueClass = (key: string, value: number) => {
  if (isPercentageKey(key)) {
    if (value < 0) return 'text-red-600'
    if (value > 0) return 'text-emerald-700'
    return 'text-muted-foreground'
  }
  if (value < 0) return 'text-red-600'
  if (value > 0) return 'text-green-600'
  return 'text-muted-foreground'
}

const formatKeyLabel = (key: string) => {
    const labels: Record<string, string> = {
      receita_bruta: 'Receita Bruta',
      deducoes: '(-) Deduções',
      receita_liquida: 'Receita Líquida',
      cmv_csv: '(-) CMV/CSV',
      lucro_bruto: 'Lucro Bruto',
      despesas_operacionais: '(-) Despesas Operacionais',
      lucro_operacional: 'Lucro Operacional',
      outras_receitas_despesas: 'Outras Receitas e Despesas',
      lucro_liquido: 'Lucro Líquido do Exercício',
      margem_bruta: 'Margem Bruta',
      margem_operacional: 'Margem Operacional',
      margem_liquida: 'Margem Líquida'
    };
    // const icons: Record<string, React.ElementType> = {
    //   receita_bruta: TrendingUp,
    //   deducoes: TrendingDown,
    //   receita_liquida: CheckCircle,
    //   cmv_csv: TrendingDown,
    //   lucro_bruto: Target,
    //   despesas_operacionais: TrendingDown,
    //   lucro_operacional: Target,
    //   outras_receitas_despesas: BarChart,
    //   lucro_liquido: CheckCircle,
    //   margem_bruta: PieChart, margem_operacional: PieChart, margem_liquida: PieChart,
    // }
    return labels[key] || key
  }

export function TreeRow({ node, level = 0 }: { node: DRENode, level?: number }) {
  const [open, setOpen] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  const paddingLeft = 12 + level * 16
  const isExpense = node.type === 2
  const valueClass = isExpense
    ? 'text-red-600'
    : node.total < 0
      ? 'text-red-600'
      : node.total > 0
        ? 'text-green-600'
        : 'text-green-600'       

  return (
    <div>
      <div className="flex items-center justify-between py-2 hover:bg-accent rounded-md" style={{ paddingLeft }}>
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(!open)}>
              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          ) : (
            <span className="inline-block w-6" />
          )}
          <span className={`text-sm ${level === 0 ? 'font-semibold' : 'font-medium'}`}>
            {isExpense ? '(-) ' : '(+) '}{node.name}
          </span>
        </div>
        <div className={`text-sm font-semibold tabular-nums ${valueClass}`}>{formatCurrencyBRL(node.total)}</div>
      </div>
      {hasChildren && open && (
        <div className="border-l border-border ml-6">
          {node.children.map(child => (
            <TreeRow key={child.id} node={child} level={level + 1} />)
          )}
        </div>
      )}
    </div>
  )
}

// Componente de Tooltip customizado para o gráfico
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-sm bg-background/95 border border-border rounded-lg shadow-lg backdrop-blur-sm">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((p: any, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <span style={{ color: p.color }}>{p.name}:</span>
            <span className="font-semibold ml-4">{formatCurrencyBRL(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function DRE() {
  const { selectedCompany } = useCompanies();
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [period, setPeriod] = useState('month');
  // Estados para o período de comparação
  const [prevStartDate, setPrevStartDate] = useState(format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [prevEndDate, setPrevEndDate] = useState(format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
  const [focusBar, setFocusBar] = useState<string | null>(null);


  const { data: dreData, isLoading, isError, error } = useQuery<DREApiResponse>({
    queryKey: ['dre', selectedCompany?.id, startDate, endDate],
    queryFn: () => getDre(startDate, endDate, selectedCompany!.id),
    enabled: !!selectedCompany?.id,
    staleTime: 1000 * 60, // 1 minuto de cache
  });

  const { data: prevDreData, isLoading: isLoadingPrev } = useQuery<DREApiResponse>({
    queryKey: ['dre', selectedCompany?.id, prevStartDate, prevEndDate],
    queryFn: () => getDre(prevStartDate, prevEndDate, selectedCompany!.id),
    enabled: !!selectedCompany?.id,
    staleTime: 1000 * 60,
  });

  const handlePeriodChange = (selectedPeriod: string) => {
    setPeriod(selectedPeriod);
    if (selectedPeriod !== 'custom') {
      const now = new Date();
      let currentStart, currentEnd, prevStart, prevEnd;

      switch (selectedPeriod) {
        case 'quarter':
          currentStart = startOfQuarter(now);
          currentEnd = endOfQuarter(now);
          prevStart = startOfQuarter(subQuarters(now, 1));
          prevEnd = endOfQuarter(subQuarters(now, 1));
          break;
        case 'semester':
          const currentMonth = now.getMonth(); // 0-11
          if (currentMonth < 6) {
            currentStart = startOfYear(now);
            currentEnd = endOfMonth(subMonths(startOfYear(now), -5)); // Fim de Junho
            prevStart = startOfYear(subYears(now, 1));
            prevEnd = endOfMonth(subMonths(startOfYear(subYears(now, 1)), -5));
          } else {
            currentStart = startOfMonth(subMonths(startOfYear(now), -6)); // Início de Julho
            currentEnd = endOfYear(now);
            prevStart = startOfMonth(subMonths(startOfYear(subYears(now, 1)), -6));
            prevEnd = endOfYear(subYears(now, 1));
          }
          break;
        case 'year':
          currentStart = startOfYear(now);
          currentEnd = endOfYear(now);
          prevStart = startOfYear(subYears(now, 1));
          prevEnd = endOfYear(subYears(now, 1));
          break;
        case 'month':
        default:
          currentStart = startOfMonth(now);
          currentEnd = endOfMonth(now);
          prevStart = startOfMonth(subMonths(now, 1));
          prevEnd = endOfMonth(subMonths(now, 1));
          break;
      }
      setStartDate(format(currentStart, 'yyyy-MM-dd'));
      setEndDate(format(currentEnd, 'yyyy-MM-dd'));
      setPrevStartDate(format(prevStart, 'yyyy-MM-dd'));
      setPrevEndDate(format(prevEnd, 'yyyy-MM-dd'));
    }
  };

  const isComponentLoading = isLoading || isLoadingPrev;
  const hasData = !isComponentLoading && !isError && dreData && dreData.dre_tree.length > 0;
  const noData = !isComponentLoading && !isError && (!dreData || dreData.dre_tree.length === 0);

  const getSummaryIcon = (key: string) => {
    const icons: Record<string, React.ElementType> = {
      receita_bruta: TrendingUp, deducoes: TrendingDown, receita_liquida: CheckCircle,
      cmv_csv: TrendingDown, lucro_bruto: Target, despesas_operacionais: TrendingDown,
      lucro_operacional: Target, outras_receitas_despesas: BarChart, lucro_liquido: CheckCircle,
      margem_bruta: PieChart, margem_operacional: PieChart, margem_liquida: PieChart,
    };
    return icons[key] || Scale;
  };

  const chartData = hasData ? [
    { name: 'Receita Bruta', atual: dreData.receita_bruta, anterior: prevDreData?.receita_bruta ?? 0 },
    { name: 'CMV/CSV', atual: Math.abs(dreData.cmv_csv), anterior: Math.abs(prevDreData?.cmv_csv ?? 0) },
    { name: 'Despesas', atual: Math.abs(dreData.despesas_operacionais), anterior: Math.abs(prevDreData?.despesas_operacionais ?? 0) },
    { name: 'Lucro Líquido', atual: dreData.lucro_liquido, anterior: prevDreData?.lucro_liquido ?? 0 },
  ] : [];

  const calculateVariation = (current: number, previous: number) => {
    if (previous === 0) {
      return current > 0 ? Infinity : (current < 0 ? -Infinity : 0);
    }
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const renderVariation = (variation: number) => {
    if (variation === Infinity) return <span className="text-green-600 flex items-center"><ArrowUp className="h-3 w-3 mr-1" /> Novo</span>;
    if (variation === -Infinity) return <span className="text-red-600 flex items-center"><ArrowDown className="h-3 w-3 mr-1" /> Novo</span>;
    return <span className={`flex items-center ${variation > 0 ? 'text-green-600' : variation < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>{variation > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : variation < 0 ? <ArrowDown className="h-3 w-3 mr-1" /> : <Minus className="h-3 w-3 mr-1" />}{Math.abs(variation).toFixed(1)}%</span>;
  };
  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">DRE Gerencial</h1>
          <p className="text-muted-foreground">Demonstração do Resultado do Exercício</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center"><Filter className="h-5 w-5 mr-2" /> Filtros</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <Select onValueChange={handlePeriodChange} value={period}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="quarter">Este Trimestre</SelectItem>
                  <SelectItem value="semester">Este Semestre</SelectItem>
                  <SelectItem value="year">Este Ano</SelectItem>
                  <SelectItem value="custom">Período Customizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {period === 'custom' && (
              <div className="md:col-span-2">
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  onFilter={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Estrutura da DRE</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {isComponentLoading && <Skeleton className="h-64 w-full" />}
            {isError && <p className="text-destructive p-4 flex items-center gap-2"><AlertCircle className="h-5 w-5" /> Erro ao carregar DRE: {error.message}</p>}
            {noData && <p className="text-muted-foreground p-4 flex items-center gap-2"><Info className="h-5 w-5" /> Nenhum dado encontrado para o período e empresa selecionados.</p>}
            {hasData && dreData.dre_tree.map(root => (
              <div key={root.id} className="py-2">
                <TreeRow node={root} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          {hasData && (
            <div className="h-80 mb-8 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart 
                  data={chartData}
                  onMouseMove={(state) => {
                    if (state.isTooltipActive) {
                      setFocusBar(state.activeTooltipIndex as any);
                    } else {
                      setFocusBar(null);
                    }
                  }}
                  onMouseLeave={() => setFocusBar(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${(Number(value) / 1000).toLocaleString()}k`} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
                  <Legend verticalAlign="top" iconSize={10} />
                  <Bar dataKey="anterior" name="Período Anterior" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={focusBar !== null ? 0.5 : 1} />
                  <Bar dataKey="atual" name="Período Atual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={focusBar !== null ? 0.5 : 1}>
                    {chartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill="hsl(var(--primary))" opacity={focusBar === null || focusBar === index.toString() ? 1 : 0.5} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isComponentLoading && Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            {hasData &&
            (
              [
                'receita_bruta',
                'deducoes',
                'receita_liquida',
                'cmv_csv',
                'lucro_bruto',
                'despesas_operacionais',
                'lucro_operacional',
                'outras_receitas_despesas',
                'lucro_liquido',
                'margem_bruta',
                'margem_operacional',
                'margem_liquida'
              ] as Array<keyof DREApiResponse>
            ).filter((k) => k in dreData).map((key) => {
              const value = dreData[key] as number;
              const prevValue = prevDreData?.[key] as number | undefined;
              const variation = prevValue !== undefined ? calculateVariation(value, prevValue) : null;
              const Icon = getSummaryIcon(key);
              return (
                <div key={key} className="rounded-lg border border-border p-4 bg-card flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      {formatKeyLabel(key)}
                    </div>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold tabular-nums ${getValueClass(key, value)}`}>
                      {formatSummaryValue(key, value)}
                    </div>
                    {variation !== null && <div className="text-xs text-muted-foreground">{renderVariation(variation)}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
export default DRE;
