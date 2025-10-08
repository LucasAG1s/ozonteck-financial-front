import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Search, Filter, Download } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'react-toastify'

interface Saida {
  id: string
  fornecedor: string
  categoria: string
  descricao: string
  valor: number
  data: Date
  formaPagamento: string
  banco: string
  cnpj: string
  anexo?: string
}

const saidasIniciais: Saida[] = [
  {
    id: '1',
    fornecedor: 'Fornecedor ABC Ltda',
    categoria: 'Fornecedores',
    descricao: 'Compra de matéria-prima - NF 12345',
    valor: 3500.00,
    data: new Date('2024-01-15'),
    formaPagamento: 'Transferência',
    banco: 'Banco do Brasil',
    cnpj: '12.345.678/0001-90',
    anexo: 'nota_fiscal_12345.pdf'
  },
  {
    id: '2',
    fornecedor: 'João Silva',
    categoria: 'Salários',
    descricao: 'Salário Janeiro 2024 - João Silva',
    valor: 4500.00,
    data: new Date('2024-01-05'),
    formaPagamento: 'PIX',
    banco: 'Itaú',
    cnpj: '12.345.678/0001-90'
  },
  {
    id: '3',
    fornecedor: 'Receita Federal',
    categoria: 'Impostos',
    descricao: 'DARF - Imposto de Renda PJ',
    valor: 2800.00,
    data: new Date('2024-01-10'),
    formaPagamento: 'Débito Automático',
    banco: 'Santander',
    cnpj: '98.765.432/0001-10',
    anexo: 'darf_janeiro_2024.pdf'
  }
]

export function Expenses() {
  const [saidas, setSaidas] = useState<Saida[]>(saidasIniciais)
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroData, setFiltroData] = useState('')
  const [filtroCNPJ, setFiltroCNPJ] = useState('')
  const [modalAberto, setModalAberto] = useState(false)


  const [formData, setFormData] = useState({
    fornecedor: '',
    categoria: 'Fornecedores',
    descricao: '',
    valor: '',
    formaPagamento: 'PIX',
    banco: 'Banco do Brasil',
    cnpj: '12.345.678/0001-90'
  })

  const [anexo, setAnexo] = useState<File | null>(null)

  const saidasFiltradas = saidas.filter(saida => {
    const matchBusca = saida.fornecedor.toLowerCase().includes(busca.toLowerCase()) ||
                      saida.descricao.toLowerCase().includes(busca.toLowerCase())
    const matchCategoria = !filtroCategoria || saida.categoria === filtroCategoria
    const matchData = !filtroData || saida.data.toISOString().split('T')[0] >= filtroData
    const matchCNPJ = !filtroCNPJ || saida.cnpj.includes(filtroCNPJ)
    
    return matchBusca && matchCategoria && matchData && matchCNPJ
  })

  const totalSaidas = saidasFiltradas.reduce((sum, saida) => sum + saida.valor, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const novaSaida: Saida = {
      id: Date.now().toString(),
      fornecedor: formData.fornecedor,
      categoria: formData.categoria,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      data: new Date(),
      formaPagamento: formData.formaPagamento,
      banco: formData.banco,
      cnpj: formData.cnpj,
      anexo: anexo?.name
    }
    
    setSaidas([novaSaida, ...saidas])
    toast.success("Nova saída foi registrada com sucesso.")
    
    setModalAberto(false)
    setFormData({
      fornecedor: '',
      categoria: 'Fornecedores',
      descricao: '',
      valor: '',
      formaPagamento: 'PIX',
      banco: 'Banco do Brasil',
      cnpj: '12.345.678/0001-90'
    })
    setAnexo(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAnexo(e.target.files[0])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Saídas</h1>
        <p className="text-muted-foreground">Gerencie as despesas e saídas financeiras</p>
        </div>
        
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Saída
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Saída</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  value={formData.fornecedor}
                  onChange={(e) => setFormData({...formData, fornecedor: e.target.value})}
                  placeholder="Nome do fornecedor ou beneficiário"
                  required
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <select
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                >
                  <option value="Fornecedores">Fornecedores</option>
                  <option value="Salários">Salários</option>
                  <option value="Impostos">Impostos</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descrição detalhada da despesa"
                  required
                />
              </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                  <select
                    id="formaPagamento"
                    value={formData.formaPagamento}
                    onChange={(e) => setFormData({...formData, formaPagamento: e.target.value})}
                    className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Transferência">Transferência</option>
                    <option value="Débito Automático">Débito Automático</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="banco">Banco</Label>
                  <select
                    id="banco"
                    value={formData.banco}
                    onChange={(e) => setFormData({...formData, banco: e.target.value})}
                    className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                  >
                    <option value="Banco do Brasil">Banco do Brasil</option>
                    <option value="Itaú">Itaú</option>
                    <option value="Santander">Santander</option>
                    <option value="Bradesco">Bradesco</option>
                    <option value="Caixa">Caixa</option>
                    <option value="Nubank">Nubank</option>
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
              <div>
                <Label htmlFor="anexo">Anexo (Nota Fiscal, Comprovante)</Label>
                <Input
                  id="anexo"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {anexo && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Arquivo selecionado: {anexo.name}
                  </p>
                )}
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

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Buscar por fornecedor ou descrição..."
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
                <option value="Fornecedores">Fornecedores</option>
                <option value="Salários">Salários</option>
                <option value="Impostos">Impostos</option>
                <option value="Aluguel">Aluguel</option>
                <option value="Utilities">Utilities</option>
                <option value="Marketing">Marketing</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div>
              <Label htmlFor="filtroData">Data (a partir de)</Label>
              <Input
                id="filtroData"
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
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

      {/* Resumo */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total de Saídas Filtradas</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(totalSaidas)}</p>
            <p className="text-sm text-muted-foreground">{saidasFiltradas.length} registro(s)</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Saídas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Forma Pagamento</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Anexo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saidasFiltradas.map((saida) => (
                <TableRow key={saida.id}>
                  <TableCell>{formatDate(saida.data)}</TableCell>
                  <TableCell className="font-medium">{saida.fornecedor}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                      {saida.categoria}
                    </span>
                  </TableCell>
                  <TableCell>{saida.descricao}</TableCell>
                  <TableCell>{saida.formaPagamento}</TableCell>
                  <TableCell>{saida.banco}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{saida.cnpj}</TableCell>
                  <TableCell>
                    {saida.anexo ? (
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    {formatCurrency(saida.valor)}
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