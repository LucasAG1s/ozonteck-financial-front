import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Search, Calendar, AlertTriangle, CheckCircle, Clock, Filter, Users, Truck } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'react-toastify'

interface Pagamento {
  id: string
  destinatario: string
  categoria: 'funcionario' | 'fornecedor'
  tipo: 'salario' | 'decimo_terceiro' | 'ferias' | 'beneficio' | 'bonus' | 'fornecedor' | 'servico' | 'produto'
  descricao: string
  valor: number
  valorProvisionado: number
  dataVencimento: Date
  dataPagamento?: Date
  status: 'pendente' | 'pago' | 'atrasado'
  observacoes?: string
  cnpj: string
  numeroNF?: string
  formaPagamento?: 'dinheiro' | 'pix' | 'transferencia' | 'boleto' | 'cartao'
}

const pagamentosIniciais: Pagamento[] = [
  {
    id: '1',
    destinatario: 'João Silva Santos',
    categoria: 'funcionario',
    tipo: 'salario',
    descricao: 'Salário Janeiro 2024',
    valor: 8500.00,
    valorProvisionado: 8500.00,
    dataVencimento: new Date('2024-01-05'),
    dataPagamento: new Date('2024-01-05'),
    status: 'pago',
    cnpj: '12.345.678/0001-90'
  },
  {
    id: '2',
    destinatario: 'Maria Oliveira Costa',
    categoria: 'funcionario',
    tipo: 'salario',
    descricao: 'Salário Janeiro 2024',
    valor: 6200.00,
    valorProvisionado: 6200.00,
    dataVencimento: new Date('2024-01-05'),
    dataPagamento: new Date('2024-01-05'),
    status: 'pago',
    cnpj: '12.345.678/0001-90'
  },
  {
    id: '3',
    destinatario: 'Carlos Roberto Lima',
    categoria: 'funcionario',
    tipo: 'decimo_terceiro',
    descricao: '13º Salário 2023 - 2ª Parcela',
    valor: 9800.00,
    valorProvisionado: 9800.00,
    dataVencimento: new Date('2024-01-15'),
    status: 'pendente',
    cnpj: '98.765.432/0001-10'
  },
  {
    id: '4',
    destinatario: 'Ana Paula Ferreira',
    categoria: 'funcionario',
    tipo: 'ferias',
    descricao: 'Férias + 1/3 Constitucional',
    valor: 9600.00,
    valorProvisionado: 9600.00,
    dataVencimento: new Date('2024-01-20'),
    status: 'pendente',
    cnpj: '12.345.678/0001-90'
  },
  {
    id: '5',
    destinatario: 'João Silva Santos',
    categoria: 'funcionario',
    tipo: 'beneficio',
    descricao: 'Vale Alimentação Janeiro',
    valor: 600.00,
    valorProvisionado: 600.00,
    dataVencimento: new Date('2024-01-10'),
    status: 'atrasado',
    observacoes: 'Aguardando aprovação do RH',
    cnpj: '12.345.678/0001-90'
  },
  {
    id: '6',
    destinatario: 'Maria Oliveira Costa',
    categoria: 'funcionario',
    tipo: 'bonus',
    descricao: 'Bônus por Performance Q4 2023',
    valor: 3100.00,
    valorProvisionado: 3100.00,
    dataVencimento: new Date('2024-01-25'),
    status: 'pendente',
    cnpj: '12.345.678/0001-90'
  }
]

export function Pagamentos() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>(pagamentosIniciais)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroCNPJ, setFiltroCNPJ] = useState('')
  const [filtroData, setFiltroData] = useState('')
  const [modalAberto, setModalAberto] = useState(false)


  const [formData, setFormData] = useState({
    destinatario: '',
    categoria: 'funcionario' as 'funcionario' | 'fornecedor',
    tipo: 'salario' as 'salario' | 'decimo_terceiro' | 'ferias' | 'beneficio' | 'bonus' | 'servico' | 'produto' | 'fornecedor',
    descricao: '',
    valor: '',
    dataVencimento: '',
    observacoes: '',
    cnpj: '12.345.678/0001-90',
    numeroNF: '',
    formaPagamento: 'pix' as 'dinheiro' | 'pix' | 'transferencia' | 'boleto' | 'cartao'
  })

  const pagamentosFiltrados = pagamentos.filter(pagamento => {
    const matchBusca = pagamento.destinatario.toLowerCase().includes(busca.toLowerCase()) ||
                      pagamento.descricao.toLowerCase().includes(busca.toLowerCase())
    const matchTipo = !filtroTipo || pagamento.tipo === filtroTipo
    const matchStatus = !filtroStatus || pagamento.status === filtroStatus
    const matchCategoria = !filtroCategoria || pagamento.categoria === filtroCategoria
    const matchCNPJ = !filtroCNPJ || pagamento.cnpj.includes(filtroCNPJ)
    const matchData = !filtroData || pagamento.dataVencimento.toISOString().slice(0, 10) === filtroData
    
    return matchBusca && matchTipo && matchStatus && matchCategoria && matchCNPJ && matchData
  })

  // Cálculos de resumo
  const totalPendente = pagamentos
    .filter(p => p.status === 'pendente')
    .reduce((sum, p) => sum + p.valor, 0)
  
  const totalPago = pagamentos
    .filter(p => p.status === 'pago')
    .reduce((sum, p) => sum + p.valor, 0)
  
  const totalAtrasado = pagamentos
    .filter(p => p.status === 'atrasado')
    .reduce((sum, p) => sum + p.valor, 0)
  
  const totalProvisionado = pagamentos
    .reduce((sum, p) => sum + p.valorProvisionado, 0)

  // Vencimentos próximos (próximos 7 dias)
  const hoje = new Date()
  const proximosSete = new Date()
  proximosSete.setDate(hoje.getDate() + 7)
  
  const vencimentosProximos = pagamentos.filter(p => 
    p.status === 'pendente' && 
    p.dataVencimento >= hoje && 
    p.dataVencimento <= proximosSete
  ).length

  const pagamentosFuncionarios = pagamentos.filter(p => p.categoria === 'funcionario').length
  const pagamentosFornecedores = pagamentos.filter(p => p.categoria === 'fornecedor').length

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const novoPagamento: Pagamento = {
      id: Date.now().toString(),
      destinatario: formData.destinatario,
      categoria: formData.categoria,
      tipo: formData.tipo,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      valorProvisionado: parseFloat(formData.valor),
      dataVencimento: new Date(formData.dataVencimento),
      status: 'pendente',
      observacoes: formData.observacoes,
      cnpj: formData.cnpj,
      numeroNF: formData.numeroNF,
      formaPagamento: formData.formaPagamento
    }
    
    setPagamentos([novoPagamento, ...pagamentos])
    toast.success("Novo pagamento foi registrado com sucesso.")
    
    setModalAberto(false)
    setFormData({
      destinatario: '',
      categoria: 'funcionario',
      tipo: 'salario',
      descricao: '',
      valor: '',
      dataVencimento: '',
      observacoes: '',
      cnpj: '12.345.678/0001-90',
      numeroNF: '',
      formaPagamento: 'pix'
    })
  }

  const handleMarcarComoPago = (id: string) => {
    setPagamentos(pagamentos.map(p => 
      p.id === id 
        ? { ...p, status: 'pago' as const, dataPagamento: new Date() }
        : p
    ))
    toast.success("O pagamento foi marcado como realizado.")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800'
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'atrasado': return 'bg-red-100 text-red-800'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'salario': 'Salário',
      'decimo_terceiro': '13º Salário',
      'ferias': 'Férias',
      'beneficio': 'Benefício',
      'bonus': 'Bônus',
      'servico': 'Serviço',
      'produto': 'Produto',
      'fornecedor': 'Fornecedor Geral'
    }
    return labels[tipo] || tipo
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pagamentos e Provisões</h1>
          <p className="text-muted-foreground">Gerencie pagamentos, 13º, férias e benefícios</p>
        </div>
        
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Pagamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="destinatario">Destinatário</Label>
                <Input
                  id="destinatario"
                  value={formData.destinatario}
                  onChange={(e) => setFormData({...formData, destinatario: e.target.value})}
                  placeholder="Nome do destinatário"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value as any})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    {formData.categoria === 'funcionario' ? (
                      <>
                        <option value="salario">Salário</option>
                        <option value="decimo_terceiro">13º Salário</option>
                        <option value="ferias">Férias</option>
                        <option value="beneficio">Benefício</option>
                        <option value="bonus">Bônus</option>
                      </>
                    ) : (
                      <>
                        <option value="servico">Serviço</option>
                        <option value="produto">Produto</option>
                        <option value="fornecedor">Fornecedor Geral</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                  <Input
                    id="dataVencimento"
                    type="date"
                    value={formData.dataVencimento}
                    onChange={(e) => setFormData({...formData, dataVencimento: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descrição do pagamento"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor">Valor</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <select
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value as 'funcionario' | 'fornecedor'})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="funcionario">Funcionário</option>
                    <option value="fornecedor">Fornecedor</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <select
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                  className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                >
                  <option value="12.345.678/0001-90">Empresa Principal LTDA</option>
                  <option value="98.765.432/0001-10">Filial Norte LTDA</option>
                  <option value="11.222.333/0001-44">Filial Sul LTDA</option>
                </select>
              </div>
              {formData.categoria === 'fornecedor' && (
                <>
                  <div>
                    <Label htmlFor="numeroNF">Número da Nota Fiscal</Label>
                    <Input
                      id="numeroNF"
                      value={formData.numeroNF}
                      onChange={(e) => setFormData({...formData, numeroNF: e.target.value})}
                      placeholder="NF-000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                    <select
                      id="formaPagamento"
                      value={formData.formaPagamento}
                      onChange={(e) => setFormData({...formData, formaPagamento: e.target.value as 'dinheiro' | 'pix' | 'transferencia' | 'boleto' | 'cartao'})}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="pix">PIX</option>
                      <option value="transferencia">Transferência</option>
                      <option value="boleto">Boleto</option>
                      <option value="cartao">Cartão</option>
                      <option value="dinheiro">Dinheiro</option>
                    </select>
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Observações adicionais (opcional)"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Cadastrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo - Primeira linha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Funcionários</p>
                <p className="text-2xl font-bold text-blue-600">{pagamentosFuncionarios}</p>
                <p className="text-xs text-muted-foreground">pagamentos</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fornecedores</p>
                <p className="text-2xl font-bold text-purple-600">{pagamentosFornecedores}</p>
                <p className="text-xs text-muted-foreground">pagamentos</p>
              </div>
              <Truck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPendente)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Resumo - Segunda linha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pagos</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Atraso</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalAtrasado)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vencimentos Próximos</p>
                <p className="text-2xl font-bold text-blue-600">{vencimentosProximos}</p>
                <p className="text-xs text-muted-foreground">próximos 7 dias</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Destinatário ou descrição..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filtroCategoria">Categoria</Label>
              <select
                id="filtroCategoria"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
              >
                <option value="">Todas as categorias</option>
                <option value="funcionario">Funcionários</option>
                <option value="fornecedor">Fornecedores</option>
              </select>
            </div>
            <div>
              <Label htmlFor="filtroTipo">Tipo</Label>
              <select
                id="filtroTipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
              >
                <option value="">Todos os tipos</option>
                {filtroCategoria === 'funcionario' || !filtroCategoria ? (
                  <>
                    <option value="salario">Salário</option>
                    <option value="decimo_terceiro">13º Salário</option>
                    <option value="ferias">Férias</option>
                    <option value="beneficio">Benefício</option>
                    <option value="bonus">Bônus</option>
                  </>
                ) : null}
                {filtroCategoria === 'fornecedor' || !filtroCategoria ? (
                  <>
                    <option value="servico">Serviço</option>
                    <option value="produto">Produto</option>
                    <option value="fornecedor">Fornecedor Geral</option>
                  </>
                ) : null}
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
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>
            <div>
              <Label htmlFor="filtroData">Data</Label>
              <Input
                id="filtroData"
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="filtroCNPJ">CNPJ</Label>
              <select
                id="filtroCNPJ"
                value={filtroCNPJ}
                onChange={(e) => setFiltroCNPJ(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
              >
                <option value="">Todos os CNPJs</option>
                <option value="12.345.678/0001-90">Empresa Principal LTDA</option>
                <option value="98.765.432/0001-10">Filial Norte LTDA</option>
                <option value="11.222.333/0001-44">Filial Sul LTDA</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Total Provisionado */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Provisionado</p>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalProvisionado)}</p>
            <p className="text-sm text-muted-foreground">{pagamentosFiltrados.length} pagamento(s) filtrado(s)</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destinatário</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Provisionado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagamentosFiltrados.map((pagamento) => (
                <TableRow key={pagamento.id}>
                  <TableCell className="font-medium">{pagamento.destinatario}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      pagamento.categoria === 'funcionario' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {pagamento.categoria === 'funcionario' ? 'Funcionário' : 'Fornecedor'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                      {getTipoLabel(pagamento.tipo)}
                    </span>
                  </TableCell>
                  <TableCell>{pagamento.descricao}</TableCell>
                  <TableCell>{formatDate(pagamento.dataVencimento)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(pagamento.valor)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatCurrency(pagamento.valorProvisionado)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(pagamento.status)}`}>
                      {pagamento.status === 'pago' ? 'Pago' : 
                       pagamento.status === 'pendente' ? 'Pendente' : 'Atrasado'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{pagamento.cnpj}</TableCell>
                  <TableCell>
                    {pagamento.status === 'pendente' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMarcarComoPago(pagamento.id)}
                      >
                        Marcar como Pago
                      </Button>
                    )}
                    {pagamento.status === 'pago' && pagamento.dataPagamento && (
                      <span className="text-xs text-muted-foreground">
                        Pago em {formatDate(pagamento.dataPagamento)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}