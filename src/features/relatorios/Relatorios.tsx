import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, FileText, Download, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'react-toastify'

interface DadosRelatorio {
  periodo: string
  entradas: number
  saidas: number
  saldo: number
}

const dadosIniciais: DadosRelatorio[] = [
  { periodo: 'Jan 2024', entradas: 45000, saidas: 32000, saldo: 13000 },
  { periodo: 'Fev 2024', entradas: 52000, saidas: 38000, saldo: 14000 },
  { periodo: 'Mar 2024', entradas: 48000, saidas: 35000, saldo: 13000 },
  { periodo: 'Abr 2024', entradas: 55000, saidas: 42000, saldo: 13000 },
  { periodo: 'Mai 2024', entradas: 58000, saidas: 45000, saldo: 13000 },
  { periodo: 'Jun 2024', entradas: 62000, saidas: 48000, saldo: 14000 }
]

interface IndicadorCard {
  titulo: string
  valor: number
  icone: React.ReactNode
  cor: string
  tendencia?: 'up' | 'down'
  percentual?: number
}

export function Relatorios() {
  const [dataInicio, setDataInicio] = useState('2024-01-01')
  const [dataFim, setDataFim] = useState('2024-06-30')
  const [cnpjSelecionado, setCnpjSelecionado] = useState('12.345.678/0001-90')
  const [tipoGrafico, setTipoGrafico] = useState<'bar' | 'line'>('bar')


  // Cálculos dos totais
  const totalEntradas = dadosIniciais.reduce((sum, item) => sum + item.entradas, 0)
  const totalSaidas = dadosIniciais.reduce((sum, item) => sum + item.saidas, 0)
  const saldoTotal = totalEntradas - totalSaidas
  const mediaEntradas = totalEntradas / dadosIniciais.length
  const mediaSaidas = totalSaidas / dadosIniciais.length

  const indicadores: IndicadorCard[] = [
    {
      titulo: 'Total de Entradas',
      valor: totalEntradas,
      icone: <TrendingUp className="h-6 w-6" />,
      cor: 'text-green-600',
      tendencia: 'up',
      percentual: 12.5
    },
    {
      titulo: 'Total de Saídas',
      valor: totalSaidas,
      icone: <TrendingDown className="h-6 w-6" />,
      cor: 'text-red-600',
      tendencia: 'up',
      percentual: 8.3
    },
    {
      titulo: 'Saldo Líquido',
      valor: saldoTotal,
      icone: <DollarSign className="h-6 w-6" />,
      cor: saldoTotal >= 0 ? 'text-green-600' : 'text-red-600',
      tendencia: saldoTotal >= 0 ? 'up' : 'down',
      percentual: 15.2
    },
    {
      titulo: 'Relatórios Gerados',
      valor: 24,
      icone: <FileText className="h-6 w-6" />,
      cor: 'text-blue-600',
      tendencia: 'up',
      percentual: 5.1
    }
  ]

  const handleExportarPDF = () => {
    toast.success("O relatório em PDF será baixado em breve.")
    // Simular download
    setTimeout(() => {
      toast.success("Relatório financeiro exportado com sucesso.")
    }, 2000)
  }

  const handleExportarExcel = () => {
    toast.success("O relatório em Excel será baixado em breve.")
    // Simular download
    setTimeout(() => {
      toast.success("Planilha financeira exportada com sucesso.")
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">Análise detalhada das movimentações financeiras</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportarPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={handleExportarExcel}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Filtros de Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <select
                id="cnpj"
                value={cnpjSelecionado}
                onChange={(e) => setCnpjSelecionado(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
              >
                <option value="">Todos os CNPJs</option>
                <option value="12.345.678/0001-90">Empresa Principal LTDA</option>
                <option value="98.765.432/0001-10">Filial Norte LTDA</option>
                <option value="11.222.333/0001-44">Filial Sul LTDA</option>
              </select>
            </div>
            <div>
              <Label htmlFor="tipoGrafico">Tipo de Gráfico</Label>
              <select
                id="tipoGrafico"
                value={tipoGrafico}
                onChange={(e) => setTipoGrafico(e.target.value as 'bar' | 'line')}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
              >
                <option value="bar">Gráfico de Barras</option>
                <option value="line">Gráfico de Linhas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {indicadores.map((indicador, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{indicador.titulo}</p>
                  <p className={`text-2xl font-bold ${indicador.cor}`}>
                    {indicador.titulo.includes('Relatórios') 
                      ? indicador.valor 
                      : formatCurrency(indicador.valor)
                    }
                  </p>
                  {indicador.percentual && (
                    <div className="flex items-center mt-2">
                      {indicador.tendencia === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${
                        indicador.tendencia === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {indicador.percentual}%
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">vs mês anterior</span>
                    </div>
                  )}
                </div>
                <div className={`${indicador.cor} opacity-80`}>
                  {indicador.icone}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico Principal */}
      <Card>
        <CardHeader>
          <CardTitle>Entradas vs Saídas por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {tipoGrafico === 'bar' ? (
                <BarChart data={dadosIniciais}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar dataKey="entradas" fill="#10b981" name="Entradas" />
                  <Bar dataKey="saidas" fill="#ef4444" name="Saídas" />
                </BarChart>
              ) : (
                <LineChart data={dadosIniciais}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="entradas" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Entradas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="saidas" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Saídas"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Estatístico */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo Estatístico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Média de Entradas:</span>
                <span className="font-medium text-green-600">{formatCurrency(mediaEntradas)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Média de Saídas:</span>
                <span className="font-medium text-red-600">{formatCurrency(mediaSaidas)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maior Entrada:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(Math.max(...dadosIniciais.map(d => d.entradas)))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maior Saída:</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(Math.max(...dadosIniciais.map(d => d.saidas)))}
                </span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span className="text-foreground font-medium">Saldo Acumulado:</span>
                <span className={`font-bold ${
                  saldoTotal >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(saldoTotal)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análise de Tendências</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Crescimento de Entradas</span>
                  <span className="text-green-600 font-medium">+12.5%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Controle de Saídas</span>
                  <span className="text-yellow-600 font-medium">+8.3%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Margem de Lucro</span>
                  <span className="text-blue-600 font-medium">23.8%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  📈 Tendência positiva nos últimos 6 meses com crescimento sustentável das receitas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}