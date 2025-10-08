import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Search, Filter } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'react-toastify'

interface Entrada {
  id: string
  origem: string
  metodo: string
  descricao: string
  valor: number
  cnpj: string
  data: Date
  categoria: string
}

const entradasIniciais: Entrada[] = [
  {
    id: '1',
    origem: 'Vendas Online',
    metodo: 'PIX',
    descricao: 'Venda de produtos - Pedido #1234',
    valor: 2500.00,
    cnpj: '12.345.678/0001-90',
    data: new Date('2024-01-15'),
    categoria: 'Vendas'
  },
  {
    id: '2',
    origem: 'Prestação de Serviços',
    metodo: 'Transferência',
    descricao: 'Consultoria empresarial - Cliente ABC',
    valor: 5000.00,
    cnpj: '12.345.678/0001-90',
    data: new Date('2024-01-14'),
    categoria: 'Serviços'
  },
  {
    id: '3',
    origem: 'Vendas Presencial',
    metodo: 'Cartão de Crédito',
    descricao: 'Venda balcão - NFCe 12345',
    valor: 850.00,
    cnpj: '98.765.432/0001-10',
    data: new Date('2024-01-13'),
    categoria: 'Vendas'
  }
]

export function Entries() {
  const [entradas, setEntradas] = useState<Entrada[]>(entradasIniciais)
  const [busca, setBusca] = useState('')
  const [filtroData, setFiltroData] = useState('')
  const [filtroCNPJ, setFiltroCNPJ] = useState('')
  const [modalAberto, setModalAberto] = useState(false)


  const [formData, setFormData] = useState({
    origem: '',
    metodo: 'PIX',
    descricao: '',
    valor: '',
    cnpj: '12.345.678/0001-90',
    categoria: 'Vendas'
  })

  const entradasFiltradas = entradas.filter(entrada => {
    const matchBusca = entrada.descricao.toLowerCase().includes(busca.toLowerCase()) ||
                      entrada.origem.toLowerCase().includes(busca.toLowerCase())
    const matchData = !filtroData || entrada.data.toISOString().split('T')[0] >= filtroData
    const matchCNPJ = !filtroCNPJ || entrada.cnpj.includes(filtroCNPJ)
    
    return matchBusca && matchData && matchCNPJ
  })

  const totalEntradas = entradasFiltradas.reduce((sum, entrada) => sum + entrada.valor, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const novaEntrada: Entrada = {
      id: Date.now().toString(),
      origem: formData.origem,
      metodo: formData.metodo,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      cnpj: formData.cnpj,
      data: new Date(),
      categoria: formData.categoria
    }
    
    setEntradas([novaEntrada, ...entradas])
    toast.success("Nova entrada foi registrada com sucesso.")
    
    setModalAberto(false)
    setFormData({
      origem: '',
      metodo: 'PIX',
      descricao: '',
      valor: '',
      cnpj: '12.345.678/0001-90',
      categoria: 'Vendas'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Entradas</h1>
          <p className="text-muted-foreground">Gerencie as receitas e entradas financeiras</p>
        </div>
        
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Entrada
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Entrada</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="origem">Origem</Label>
                <Input
                  id="origem"
                  value={formData.origem}
                  onChange={(e) => setFormData({...formData, origem: e.target.value})}
                  placeholder="Ex: Vendas Online, Prestação de Serviços"
                  required
                />
              </div>
              <div>
                <Label htmlFor="metodo">Método de Pagamento</Label>
                <select
                  id="metodo"
                  value={formData.metodo}
                  onChange={(e) => setFormData({...formData, metodo: e.target.value})}
                  className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                >
                  <option value="PIX">PIX</option>
                  <option value="Transferência">Transferência</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Boleto">Boleto</option>
                </select>
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descrição detalhada da entrada"
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
                <Label htmlFor="categoria">Categoria</Label>
                <select
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                >
                  <option value="Vendas">Vendas</option>
                  <option value="Serviços">Serviços</option>
                  <option value="Investimentos">Investimentos</option>
                  <option value="Outros">Outros</option>
                </select>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Buscar por descrição ou origem..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
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
            <p className="text-sm text-muted-foreground">Total de Entradas Filtradas</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalEntradas)}</p>
            <p className="text-sm text-muted-foreground">{entradasFiltradas.length} registro(s)</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Entradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entradasFiltradas.map((entrada) => (
                <TableRow key={entrada.id}>
                  <TableCell>{formatDate(entrada.data)}</TableCell>
                  <TableCell className="font-medium">{entrada.origem}</TableCell>
                  <TableCell>{entrada.metodo}</TableCell>
                  <TableCell>{entrada.descricao}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {entrada.categoria}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{entrada.cnpj}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {formatCurrency(entrada.valor)}
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