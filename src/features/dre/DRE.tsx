import { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { startOfMonth, endOfMonth, format, getYear, getMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight, Filter, PieChart,  Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton';
import { useCompanies } from '@/hooks/useCompanies';
import { getDre } from '@/lib/services/finance/dre.service'
import { toast } from 'react-toastify';

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
interface DREPeriodData {
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
  month_key: string;
  month_name: string;
}
interface DREApiResponse {
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
    return labels[key] || key
  }

function TreeRow({ node, level = 0, monthKeys, dataMap, expanded, onToggle }: { node: DRENode, level?: number, monthKeys: string[], dataMap: Map<string, Map<number, number>>, expanded: Set<number>, onToggle: (id: number) => void }) {
  const hasChildren = node.children && node.children.length > 0
  const paddingLeft = 12 + level * 16
  const isExpense = node.type === 2

  return (
    <>
      <tr className="hover:bg-accent">
        <td className="px-4 py-2 whitespace-nowrap" style={{ paddingLeft }}>
          <div className="flex items-center gap-2">
          {hasChildren ? (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onToggle(node.id)}>
              {expanded.has(node.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          ) : (
            <span className="inline-block w-6" />
          )}
            <span className={`text-sm ${level === 0 ? 'font-semibold' : 'font-medium'}`}>
            {isExpense ? '(-) ' : '(+) '}{node.name}
          </span>
          </div>
        </td>
        {monthKeys.map(monthKey => {
          const total = dataMap.get(monthKey)?.get(node.id) || 0;
          const valueClass = total == 0 ? 'text-muted-foreground' : isExpense ? 'text-red-600' : total >= 0 ? 'text-green-600' : 'text-red-600';
          return (
            <td key={`${node.id}-${monthKey}`} className={`px-4 py-2 text-right font-medium tabular-nums whitespace-nowrap ${valueClass}`}>
              {formatCurrencyBRL(total)}
            </td>
          );
        })}
        {(() => {
          const rowTotal = monthKeys.reduce((acc, monthKey) => acc + (dataMap.get(monthKey)?.get(node.id) || 0), 0);
          const totalValueClass = rowTotal == 0 ? 'text-muted-foreground' : isExpense ? 'text-red-600' : rowTotal >= 0 ? 'text-green-600' : 'text-red-600';
          return (
            <td className={`px-4 py-2 text-right font-medium tabular-nums whitespace-nowrap ${totalValueClass}`}>
              {formatCurrencyBRL(rowTotal)}
            </td>
          );
        })()}
      </tr>
      {hasChildren && expanded.has(node.id) && (
        <>
          {node.children.map(child =>
            <TreeRow key={child.id} node={child} level={level + 1} monthKeys={monthKeys} dataMap={dataMap} expanded={expanded} onToggle={onToggle} />
          )}
        </>
      )}
    </>
  )
}

export function DRE() {
  const { selectedCompany } = useCompanies();
  
  const currentYear = getYear(new Date());
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('pt-BR', { month: 'long' }) }));

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedEndYear, setSelectedEndYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()) + 1);
  const [selectedEndMonth, setSelectedEndMonth] = useState(getMonth(new Date()) + 1);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [dreData, setDreData] = useState<DREPeriodData[] | null>(null);

  useEffect(() => {
    const start = startOfMonth(new Date(selectedYear, selectedMonth - 1));
    const end = endOfMonth(new Date(selectedEndYear, selectedEndMonth - 1));

    if (start && end) {
      setStartDate(format(start, 'yyyy-MM-dd'));
      setEndDate(format(end, 'yyyy-MM-dd'));
    }
  }, [selectedYear, selectedMonth, selectedEndYear, selectedEndMonth]);

  const { mutate: generateDreMutation, isPending: isLoading } = useMutation<DREPeriodData[], Error, { startDate: string, endDate: string, companyId: number }>({
    mutationFn: ({ startDate, endDate, companyId }) => getDre(startDate, endDate, companyId),
    onSuccess: (data) => {
      setDreData(data);
      toast.success("DRE gerada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao gerar DRE: ${error.message}`);
    }
  });

  const handleGenerateDRE = () => {
    if (selectedCompany && startDate && endDate) {
      generateDreMutation({ startDate, endDate, companyId: selectedCompany.id });
    } else {
      toast.warn("Por favor, selecione uma empresa primeiro.");
    }
  };

  const { unifiedTree, dataMap, monthHeaders, summaryTotals } = useMemo(() => {
    if (!dreData || dreData.length === 0) {
      return { unifiedTree: [], dataMap: new Map(), monthHeaders: [], summaryTotals: null };
    }

    const monthHeaders = dreData.map(d => ({ month_key: d.month_key, month_name: d.month_name }));
    const unifiedTree = dreData[0].dre_tree; 

    const dataMap = new Map<string, Map<number, number>>();
    const summaryTotals: Omit<DREPeriodData, 'dre_tree' | 'month_key' | 'month_name'> = {
      receita_bruta: 0, deducoes: 0, receita_liquida: 0, cmv_csv: 0, lucro_bruto: 0,
      despesas_operacionais: 0, lucro_operacional: 0, outras_receitas_despesas: 0,
      lucro_liquido: 0, margem_bruta: 0, margem_operacional: 0, margem_liquida: 0,
    };

    const processNode = (node: DRENode, monthKey: string) => {
      if (!dataMap.has(monthKey)) {
        dataMap.set(monthKey, new Map());
      }
      dataMap.get(monthKey)!.set(node.id, node.total);
      node.children.forEach(child => processNode(child, monthKey));
    };

    dreData.forEach(periodData => {
      periodData.dre_tree.forEach(node => processNode(node, periodData.month_key!));
      
      (Object.keys(summaryTotals) as Array<keyof typeof summaryTotals>).forEach(key => {
        summaryTotals[key] += periodData[key] || 0;
      });
    });

    if (summaryTotals.receita_liquida !== 0) {
      summaryTotals.margem_bruta = (summaryTotals.lucro_bruto / summaryTotals.receita_liquida) * 100;
      summaryTotals.margem_operacional = (summaryTotals.lucro_operacional / summaryTotals.receita_liquida) * 100;
      summaryTotals.margem_liquida = (summaryTotals.lucro_liquido / summaryTotals.receita_liquida) * 100;
    }

    return { unifiedTree, dataMap, monthHeaders, summaryTotals };
  }, [dreData]);

  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const handleToggle = (id: number) => {
    setExpanded(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
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
        <CardContent className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label>Período de Análise</Label> 
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select onValueChange={(v) => setSelectedMonth(Number(v))} value={String(selectedMonth)}> 
                    <SelectTrigger><SelectValue placeholder="Mês Inicial" /></SelectTrigger>
                    <SelectContent>
                      {months.map(month => <SelectItem key={month.value} value={String(month.value)}>{month.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select onValueChange={(v) => setSelectedYear(Number(v))} value={String(selectedYear)}> 
                    <SelectTrigger><SelectValue placeholder="Ano Inicial" /></SelectTrigger>
                    <SelectContent>
                      {years.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-muted-foreground">até</span>
                <div className="flex-1">
                  <Select onValueChange={(v) => setSelectedEndMonth(Number(v))} value={String(selectedEndMonth)}> 
                    <SelectTrigger><SelectValue placeholder="Mês Final" /></SelectTrigger>
                    <SelectContent>
                      {months.map(month => <SelectItem key={month.value} value={String(month.value)}>{month.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select onValueChange={(v) => setSelectedEndYear(Number(v))} value={String(selectedEndYear)}> 
                    <SelectTrigger><SelectValue placeholder="Ano Final" /></SelectTrigger>
                    <SelectContent>
                      {years.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <Button onClick={handleGenerateDRE} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PieChart className="h-4 w-4 mr-2" />}
            Analisar Período
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Estrutura da DRE</CardTitle></CardHeader>
        <CardContent>
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2 ml-8" />
            <Skeleton className="h-8 w-1/2 ml-8" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2 ml-8" />
          </div>
        ) : dreData ? (
          <div className="overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border scrollbar-thumb-rounded-md hover:scrollbar-thumb-accent">
            <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-1/3">Plano de Contas</th>
                    {monthHeaders.map(header => <th key={header.month_key} className="px-3 py-3 text-right text-sm font-medium text-muted-foreground">{header.month_name.toLocaleUpperCase()}</th>)}
                    <th className="px-3 py-3 text-sm font-bold text-muted-foreground">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm text-center">
                  {unifiedTree.map(rootNode => (
                    <TreeRow key={rootNode.id} node={rootNode} monthKeys={monthHeaders.map(h => h.month_key!)} dataMap={dataMap} expanded={expanded} onToggle={handleToggle} />
                  ))}
                </tbody>
            </table>
          </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>Selecione um período e clique em &quot;Analisar Período&quot; para gerar a DRE.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading && Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            {summaryTotals &&
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
            ).filter((k) => k in summaryTotals).map((key) => {
              const value = summaryTotals[key] as number;
              return (
                <div key={key} className="rounded-lg border border-border p-4 bg-card flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      {formatKeyLabel(key)}
                    </div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold tabular-nums ${getValueClass(key, value)}`}>
                      {formatSummaryValue(key, value)}
                    </div>
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
