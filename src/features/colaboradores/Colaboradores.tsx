import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Search, Users, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate, formatCPF } from '@/lib/utils'
import { toast } from 'react-toastify'

interface Colaborador {
  id: string
  nome: string
  cpf: string
  cargo: string
  salario: number
  dataAdmissao: Date
  telefone: string
  email: string
  endereco: string
  status: 'ativo' | 'inativo'
  cnpj: string
}

const colaboradoresIniciais: Colaborador[] = [
  {
    id: '1',
    nome: 'João Silva Santos',
    cpf: '123.456.789-00',
    cargo: 'Desenvolvedor Senior',
    salario: 8500.00,
    dataAdmissao: new Date('2023-03-15'),
    telefone: '(11) 99999-1234',
    email: 'joao.silva@empresa.com',
    endereco: 'Rua das Flores, 123 - São Paulo/SP',
    status: 'ativo',
    cnpj: '12.345.678/0001-90'
  },
  {
    id: '2',
    nome: 'Maria Oliveira Costa',
    cpf: '987.654.321-00',
    cargo: 'Analista Financeiro',
    salario: 6200.00,
    dataAdmissao: new Date('2023-01-10'),
    telefone: '(11) 88888-5678',
    email: 'maria.oliveira@empresa.com',
    endereco: 'Av. Paulista, 456 - São Paulo/SP',
    status: 'ativo',
    cnpj: '12.345.678/0001-90'
  },
  {
    id: '3',
    nome: 'Carlos Roberto Lima',
    cpf: '456.789.123-00',
    cargo: 'Gerente de Vendas',
    salario: 9800.00,
    dataAdmissao: new Date('2022-08-20'),
    telefone: '(11) 77777-9012',
    email: 'carlos.lima@empresa.com',
    endereco: 'Rua Augusta, 789 - São Paulo/SP',
    status: 'ativo',
    cnpj: '98.765.432/0001-10'
  },
  {
    id: '4',
    nome: 'Ana Paula Ferreira',
    cpf: '321.654.987-00',
    cargo: 'Designer UX/UI',
    salario: 7200.00,
    dataAdmissao: new Date('2023-06-01'),
    telefone: '(11) 66666-3456',
    email: 'ana.ferreira@empresa.com',
    endereco: 'Rua Oscar Freire, 321 - São Paulo/SP',
    status: 'inativo',
    cnpj: '12.345.678/0001-90'
  }
]

export function Colaboradores() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(colaboradoresIniciais)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroCargo, setFiltroCargo] = useState('')
  const [filtroCNPJ, setFiltroCNPJ] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [colaboradorEditando, setColaboradorEditando] = useState<Colaborador | null>(null)


  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    cargo: '',
    salario: '',
    dataAdmissao: '',
    telefone: '',
    email: '',
    endereco: '',
    status: 'ativo' as 'ativo' | 'inativo',
    cnpj: '12.345.678/0001-90'
  })

  const colaboradoresFiltrados = colaboradores.filter(colaborador => {
    const matchBusca = colaborador.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      colaborador.cpf.includes(busca) ||
                      colaborador.cargo.toLowerCase().includes(busca.toLowerCase())
    const matchStatus = !filtroStatus || colaborador.status === filtroStatus
    const matchCargo = !filtroCargo || colaborador.cargo === filtroCargo
    const matchCNPJ = !filtroCNPJ || colaborador.cnpj.includes(filtroCNPJ)
    
    return matchBusca && matchStatus && matchCargo && matchCNPJ
  })

  const colaboradoresAtivos = colaboradores.filter(c => c.status === 'ativo').length
  const totalFolhaPagamento = colaboradores
    .filter(c => c.status === 'ativo')
    .reduce((sum, c) => sum + c.salario, 0)

  const cargosUnicos = [...new Set(colaboradores.map(c => c.cargo))]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (colaboradorEditando) {
      // Editando colaborador existente
      const colaboradorAtualizado: Colaborador = {
        ...colaboradorEditando,
        nome: formData.nome,
        cpf: formData.cpf,
        cargo: formData.cargo,
        salario: parseFloat(formData.salario),
        dataAdmissao: new Date(formData.dataAdmissao),
        telefone: formData.telefone,
        email: formData.email,
        endereco: formData.endereco,
        status: formData.status,
        cnpj: formData.cnpj
      }
      
      setColaboradores(colaboradores.map(c => 
        c.id === colaboradorEditando.id ? colaboradorAtualizado : c
      ))
      
      toast.success("Os dados do colaborador foram atualizados com sucesso.")
    } else {
      // Novo colaborador
      const novoColaborador: Colaborador = {
        id: Date.now().toString(),
        nome: formData.nome,
        cpf: formData.cpf,
        cargo: formData.cargo,
        salario: parseFloat(formData.salario),
        dataAdmissao: new Date(formData.dataAdmissao),
        telefone: formData.telefone,
        email: formData.email,
        endereco: formData.endereco,
        status: formData.status,
        cnpj: formData.cnpj
      }
      
      setColaboradores([novoColaborador, ...colaboradores])
      toast.success("Novo colaborador foi adicionado com sucesso.")
    }
    
    setModalAberto(false)
    setColaboradorEditando(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      cargo: '',
      salario: '',
      dataAdmissao: '',
      telefone: '',
      email: '',
      endereco: '',
      status: 'ativo',
      cnpj: '12.345.678/0001-90'
    })
  }

  const handleEditar = (colaborador: Colaborador) => {
    setColaboradorEditando(colaborador)
    setFormData({
      nome: colaborador.nome,
      cpf: colaborador.cpf,
      cargo: colaborador.cargo,
      salario: colaborador.salario.toString(),
      dataAdmissao: colaborador.dataAdmissao.toISOString().split('T')[0],
      telefone: colaborador.telefone,
      email: colaborador.email,
      endereco: colaborador.endereco,
      status: colaborador.status,
      cnpj: colaborador.cnpj
    })
    setModalAberto(true)
  }

  const handleExcluir = (id: string) => {
    setColaboradores(colaboradores.filter(c => c.id !== id))
    toast.success("O colaborador foi removido do sistema.")
  }

  const handleNovoColaborador = () => {
    setColaboradorEditando(null)
    resetForm()
    setModalAberto(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Colaboradores</h1>
        <p className="text-muted-foreground">Gerencie os funcionários da empresa</p>
        </div>
        
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button onClick={handleNovoColaborador}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {colaboradorEditando ? 'Editar Colaborador' : 'Novo Colaborador'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Nome completo do colaborador"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                    placeholder="Ex: Desenvolvedor, Analista, Gerente"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="salario">Salário</Label>
                  <Input
                    id="salario"
                    type="number"
                    step="0.01"
                    value={formData.salario}
                    onChange={(e) => setFormData({...formData, salario: e.target.value})}
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataAdmissao">Data de Admissão</Label>
                  <Input
                    id="dataAdmissao"
                    type="date"
                    value={formData.dataAdmissao}
                    onChange={(e) => setFormData({...formData, dataAdmissao: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="colaborador@empresa.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                  placeholder="Rua, número, bairro - Cidade/UF"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'ativo' | 'inativo'})}
                    className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
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
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {colaboradorEditando ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Colaboradores Ativos</p>
                <p className="text-3xl font-bold text-blue-600">{colaboradoresAtivos}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total da Folha</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalFolhaPagamento)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admissões este Ano</p>
                <p className="text-3xl font-bold text-purple-600">12</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Nome, CPF ou cargo..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
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
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <div>
              <Label htmlFor="filtroCargo">Cargo</Label>
              <select
                id="filtroCargo"
                value={filtroCargo}
                onChange={(e) => setFiltroCargo(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
              >
                <option value="">Todos os cargos</option>
                {cargosUnicos.map(cargo => (
                  <option key={cargo} value={cargo}>{cargo}</option>
                ))}
              </select>
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

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Colaboradores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Salário</TableHead>
                <TableHead>Admissão</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colaboradoresFiltrados.map((colaborador) => (
                <TableRow key={colaborador.id}>
                  <TableCell className="font-medium">{colaborador.nome}</TableCell>
                  <TableCell>{formatCPF(colaborador.cpf)}</TableCell>
                  <TableCell>{colaborador.cargo}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(colaborador.salario)}</TableCell>
                  <TableCell>{formatDate(colaborador.dataAdmissao)}</TableCell>
                  <TableCell>{colaborador.telefone}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      colaborador.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {colaborador.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{colaborador.cnpj}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditar(colaborador)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleExcluir(colaborador.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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