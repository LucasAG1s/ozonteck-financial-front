import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RefreshCw, Settings, Zap, CheckCircle, XCircle, Clock, AlertTriangle, Plus, Search } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Integracao {
  id: string
  nome: string
  tipo: 'mercado_pago' | 'acqio' | 'banco' | 'contabilidade'
  status: 'ativa' | 'inativa' | 'erro' | 'sincronizando'
  ultimaSincronizacao?: Date
  transacoesImportadas: number
  configurada: boolean
  apiKey?: string
  webhook?: string
}

interface Transacao {
  id: string
  integracaoId: string
  integracaoNome: string
  tipo: 'entrada' | 'saida'
  descricao: string
  valor: number
  data: Date
  status: 'processada' | 'pendente' | 'erro' | 'cancelada'
  referencia: string
  metodo: string
}

const integracoesIniciais: Integracao[] = [
  {
    id: '1',
    nome: 'Mercado Pago',
    tipo: 'mercado_pago',
    status: 'ativa',
    ultimaSincronizacao: new Date('2024-01-15T10:30:00'),
    transacoesImportadas: 156,
    configurada: true,
    apiKey: 'APP_USR_****_****_****',
    webhook: 'https://api.empresa.com/webhook/mercadopago'
  },
  {
    id: '2',
    nome: 'Acqio',
    tipo: 'acqio',
    status: 'ativa',
    ultimaSincronizacao: new Date('2024-01-15T09:15:00'),
    transacoesImportadas: 89,
    configurada: true,
    apiKey: 'acqio_****_****_****'
  },
  {
    id: '3',
    nome: 'Banco do Brasil API',
    tipo: 'banco',
    status: 'erro',
    ultimaSincronizacao: new Date('2024-01-14T16:45:00'),
    transacoesImportadas: 234,
    configurada: true
  },
  {
    id: '4',
    nome: 'Sistema Contábil',
    tipo: 'contabilidade',
    status: 'inativa',
    transacoesImportadas: 0,
    configurada: false
  }
]

const transacoesIniciais: Transacao[] = [
  {
    id: '1',
    integracaoId: '1',
    integracaoNome: 'Mercado Pago',
    tipo: 'entrada',
    descricao: 'Pagamento PIX - Venda Online #12345',
    valor: 2500.00,
    data: new Date('2024-01-15T10:25:00'),
    status: 'processada',
    referencia: 'MP_12345678',
    metodo: 'PIX'
  },
  {
    id: '2',
    integracaoId: '1',
    integracaoNome: 'Mercado Pago',
    tipo: 'entrada',
    descricao: 'Pagamento Cartão - Venda #12346',
    valor: 1800.00,
    data: new Date('2024-01-15T09:45:00'),
    status: 'processada',
    referencia: 'MP_12345679',
    metodo: 'Cartão de Crédito'
  },
  {
    id: '3',
    integracaoId: '2',
    integracaoNome: 'Acqio',
    tipo: 'entrada',
    descricao: 'Transação POS - Terminal 001',
    valor: 450.00,
    data: new Date('2024-01-15T08:30:00'),
    status: 'processada',
    referencia: 'ACQ_789123',
    metodo: 'Cartão de Débito'
  },
  {
    id: '4',
    integracaoId: '1',
    integracaoNome: 'Mercado Pago',
    tipo: 'saida',
    descricao: 'Taxa de Processamento',
    valor: 75.00,
    data: new Date('2024-01-15T10:30:00'),
    status: 'processada',
    referencia: 'MP_FEE_001',
    metodo: 'Taxa'
  },
  {
    id: '5',
    integracaoId: '3',
    integracaoNome: 'Banco do Brasil API',
    tipo: 'entrada',
    descricao: 'Transferência TED Recebida',
    valor: 5000.00,
    data: new Date('2024-01-14T14:20:00'),
    status: 'erro',
    referencia: 'BB_TED_001',
    metodo: 'TED'
  }
]

export function Integracoes() {
  const [integracoes, setIntegracoes] = useState<Integracao[]>(integracoesIniciais)
  const [transacoes] = useState<Transacao[]>(transacoesIniciais)
  const [busca, setBusca] = useState('')
  const [filtroIntegracao, setFiltroIntegracao] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [modalConfigAberto, setModalConfigAberto] = useState(false)
  const [integracaoSelecionada, setIntegracaoSelecionada] = useState<Integracao | null>(null)

  const [configData, setConfigData] = useState({
    apiKey: '',
    webhook: '',
    ambiente: 'producao'
  })

  const transacoesFiltradas = transacoes.filter(transacao => {
    const matchBusca = transacao.descricao.toLowerCase().includes(busca.toLowerCase()) ||
                      transacao.referencia.toLowerCase().includes(busca.toLowerCase())
    const matchIntegracao = !filtroIntegracao || transacao.integracaoId === filtroIntegracao
    const matchStatus = !filtroStatus || transacao.status === filtroStatus
    
    return matchBusca && matchIntegracao && matchStatus
  })

  const handleSincronizar = async (integracaoId: string) => {
    // Atualizar status para sincronizando
    setIntegracoes(integracoes.map(i => 
      i.id === integracaoId 
        ? { ...i, status: 'sincronizando' as const }
        : i
    ))


    // Simular sincronização
    setTimeout(() => {
      const novasTransacoes = Math.floor(Math.random() * 10) + 1
      
      setIntegracoes(integracoes.map(i => 
        i.id === integracaoId 
          ? { 
              ...i, 
              status: 'ativa' as const, 
              ultimaSincronizacao: new Date(),
              transacoesImportadas: i.transacoesImportadas + novasTransacoes
            }
          : i
      ))
    }, 3000)
  }

  const handleConfigurar = (integracao: Integracao) => {
    setIntegracaoSelecionada(integracao)
    setConfigData({
      apiKey: integracao.apiKey || '',
      webhook: integracao.webhook || '',
      ambiente: 'producao'
    })
    setModalConfigAberto(true)
  }

  const handleSalvarConfig = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (integracaoSelecionada) {
      setIntegracoes(integracoes.map(i => 
        i.id === integracaoSelecionada.id 
          ? { 
              ...i, 
              configurada: true,
              status: 'ativa' as const,
              apiKey: configData.apiKey,
              webhook: configData.webhook
            }
          : i
      ))


    }
    
    setModalConfigAberto(false)
    setIntegracaoSelecionada(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativa': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'inativa': return <XCircle className="h-5 w-5 text-muted-foreground" />
      case 'erro': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'sincronizando': return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
      default: return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': case 'processada': return 'bg-green-100 text-green-800'
      case 'inativa': return 'bg-muted text-muted-foreground'
      case 'erro': case 'cancelada': return 'bg-red-100 text-red-800'
      case 'sincronizando': case 'pendente': return 'bg-blue-100 text-blue-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const totalTransacoes = transacoes.length
  const transacoesProcessadas = transacoes.filter(t => t.status === 'processada').length
  const valorTotalEntradas = transacoes
    .filter(t => t.tipo === 'entrada' && t.status === 'processada')
    .reduce((sum, t) => sum + t.valor, 0)
  const integracoesAtivas = integracoes.filter(i => i.status === 'ativa').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Integrações</h1>
          <p className="text-muted-foreground">Gerencie integrações com APIs externas</p>
        </div>
        
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Todas
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Integrações Ativas</p>
                <p className="text-3xl font-bold text-green-600">{integracoesAtivas}</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Transações</p>
                <p className="text-3xl font-bold text-blue-600">{totalTransacoes}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processadas</p>
                <p className="text-3xl font-bold text-purple-600">{transacoesProcessadas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Importado</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(valorTotalEntradas)}</p>
              </div>
              <Plus className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Integrações */}
      <Card>
        <CardHeader>
          <CardTitle>Integrações Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integracoes.map((integracao) => (
              <Card key={integracao.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(integracao.status)}
                      <div>
                        <h3 className="font-semibold">{integracao.nome}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{integracao.tipo.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(integracao.status)}`}>
                      {integracao.status === 'ativa' ? 'Ativa' :
                       integracao.status === 'inativa' ? 'Inativa' :
                       integracao.status === 'erro' ? 'Erro' : 'Sincronizando'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Transações:</span>
                      <span className="font-medium">{integracao.transacoesImportadas}</span>
                    </div>
                    {integracao.ultimaSincronizacao && (
                      <div className="flex justify-between">
                        <span>Última sync:</span>
                        <span className="font-medium">{formatDate(integracao.ultimaSincronizacao)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Configurada:</span>
                      <span className={`font-medium ${
                        integracao.configurada ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {integracao.configurada ? 'Sim' : 'Não'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleConfigurar(integracao)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configurar
                    </Button>
                    {integracao.configurada && integracao.status !== 'sincronizando' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSincronizar(integracao.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Sincronizar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtros para Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Integradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Descrição ou referência..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filtroIntegracao">Integração</Label>
              <select
                id="filtroIntegracao"
                value={filtroIntegracao}
                onChange={(e) => setFiltroIntegracao(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
              >
                <option value="">Todas as integrações</option>
                {integracoes.map(integracao => (
                  <option key={integracao.id} value={integracao.id}>{integracao.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="filtroStatus">Status</Label>
              <select
                id="filtroStatus"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
              >
                <option value="">Todos os status</option>
                <option value="processada">Processada</option>
                <option value="pendente">Pendente</option>
                <option value="erro">Erro</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Integração</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transacoesFiltradas.map((transacao) => (
                <TableRow key={transacao.id}>
                  <TableCell>{formatDate(transacao.data)}</TableCell>
                  <TableCell className="font-medium">{transacao.integracaoNome}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transacao.tipo === 'entrada' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </TableCell>
                  <TableCell>{transacao.descricao}</TableCell>
                  <TableCell>{transacao.metodo}</TableCell>
                  <TableCell className="font-mono text-sm">{transacao.referencia}</TableCell>
                  <TableCell className={`font-medium ${
                    transacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transacao.tipo === 'entrada' ? '+' : '-'}{formatCurrency(transacao.valor)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(transacao.status)}`}>
                      {transacao.status === 'processada' ? 'Processada' :
                       transacao.status === 'pendente' ? 'Pendente' :
                       transacao.status === 'erro' ? 'Erro' : 'Cancelada'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Configuração */}
      <Dialog open={modalConfigAberto} onOpenChange={setModalConfigAberto}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Configurar {integracaoSelecionada?.nome}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSalvarConfig} className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={configData.apiKey}
                onChange={(e) => setConfigData({...configData, apiKey: e.target.value})}
                placeholder="Sua chave de API"
                required
              />
            </div>
            {integracaoSelecionada?.tipo === 'mercado_pago' && (
              <div>
                <Label htmlFor="webhook">Webhook URL</Label>
                <Input
                  id="webhook"
                  value={configData.webhook}
                  onChange={(e) => setConfigData({...configData, webhook: e.target.value})}
                  placeholder="https://api.empresa.com/webhook/mercadopago"
                />
              </div>
            )}
            <div>
              <Label htmlFor="ambiente">Ambiente</Label>
              <select
                id="ambiente"
                value={configData.ambiente}
                onChange={(e) => setConfigData({...configData, ambiente: e.target.value})}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
              >
                <option value="sandbox">Sandbox (Teste)</option>
                <option value="producao">Produção</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setModalConfigAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Configuração
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}