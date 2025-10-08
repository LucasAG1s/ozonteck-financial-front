import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Search, Users, Shield, Key, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'react-toastify'

interface Usuario {
  id: string
  nome: string
  email: string
  nivel: 'master' | 'gerente' | 'auxiliar'
  status: 'ativo' | 'inativo'
  ultimoAcesso?: Date
  dataCriacao: Date
  permissoes: {
    dashboard: boolean
    empresas: boolean
    entradas: boolean
    saidas: boolean
    relatorios: boolean
    colaboradores: boolean
    pagamentos: boolean
    integracoes: boolean
    usuarios: boolean
  }
}

const usuariosIniciais: Usuario[] = [
  {
    id: '1',
    nome: 'Admin Sistema',
    email: 'admin@empresa.com',
    nivel: 'master',
    status: 'ativo',
    ultimoAcesso: new Date('2024-01-15T10:30:00'),
    dataCriacao: new Date('2023-01-01'),
    permissoes: {
      dashboard: true,
      empresas: true,
      entradas: true,
      saidas: true,
      relatorios: true,
      colaboradores: true,
      pagamentos: true,
      integracoes: true,
      usuarios: true
    }
  },
  {
    id: '2',
    nome: 'Maria Gerente',
    email: 'maria.gerente@empresa.com',
    nivel: 'gerente',
    status: 'ativo',
    ultimoAcesso: new Date('2024-01-15T09:15:00'),
    dataCriacao: new Date('2023-03-15'),
    permissoes: {
      dashboard: true,
      empresas: true,
      entradas: true,
      saidas: true,
      relatorios: true,
      colaboradores: true,
      pagamentos: true,
      integracoes: false,
      usuarios: false
    }
  },
  {
    id: '3',
    nome: 'João Auxiliar',
    email: 'joao.auxiliar@empresa.com',
    nivel: 'auxiliar',
    status: 'ativo',
    ultimoAcesso: new Date('2024-01-14T16:45:00'),
    dataCriacao: new Date('2023-06-10'),
    permissoes: {
      dashboard: true,
      empresas: false,
      entradas: true,
      saidas: true,
      relatorios: false,
      colaboradores: false,
      pagamentos: false,
      integracoes: false,
      usuarios: false
    }
  },
  {
    id: '4',
    nome: 'Ana Financeiro',
    email: 'ana.financeiro@empresa.com',
    nivel: 'auxiliar',
    status: 'inativo',
    ultimoAcesso: new Date('2024-01-10T14:20:00'),
    dataCriacao: new Date('2023-08-20'),
    permissoes: {
      dashboard: true,
      empresas: false,
      entradas: true,
      saidas: true,
      relatorios: true,
      colaboradores: false,
      pagamentos: true,
      integracoes: false,
      usuarios: false
    }
  }
]

const permissoesPorNivel = {
  master: {
    dashboard: true,
    empresas: true,
    entradas: true,
    saidas: true,
    relatorios: true,
    colaboradores: true,
    pagamentos: true,
    integracoes: true,
    usuarios: true
  },
  gerente: {
    dashboard: true,
    empresas: true,
    entradas: true,
    saidas: true,
    relatorios: true,
    colaboradores: true,
    pagamentos: true,
    integracoes: false,
    usuarios: false
  },
  auxiliar: {
    dashboard: true,
    empresas: false,
    entradas: true,
    saidas: true,
    relatorios: false,
    colaboradores: false,
    pagamentos: false,
    integracoes: false,
    usuarios: false
  }
}

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciais)
  const [busca, setBusca] = useState('')
  const [filtroNivel, setFiltroNivel] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [modalPermissoesAberto, setModalPermissoesAberto] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null)
  const [usuarioPermissoes, setUsuarioPermissoes] = useState<Usuario | null>(null)
  const [mostrarSenha, setMostrarSenha] = useState(false)


  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    nivel: 'auxiliar' as 'master' | 'gerente' | 'auxiliar',
    status: 'ativo' as 'ativo' | 'inativo'
  })

  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchBusca = usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      usuario.email.toLowerCase().includes(busca.toLowerCase())
    const matchNivel = !filtroNivel || usuario.nivel === filtroNivel
    const matchStatus = !filtroStatus || usuario.status === filtroStatus
    
    return matchBusca && matchNivel && matchStatus
  })

  const usuariosAtivos = usuarios.filter(u => u.status === 'ativo').length
  const usuariosMaster = usuarios.filter(u => u.nivel === 'master').length
  const usuariosGerente = usuarios.filter(u => u.nivel === 'gerente').length
  const usuariosAuxiliar = usuarios.filter(u => u.nivel === 'auxiliar').length

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (usuarioEditando) {
      // Editando usuário existente
      const usuarioAtualizado: Usuario = {
        ...usuarioEditando,
        nome: formData.nome,
        email: formData.email,
        nivel: formData.nivel,
        status: formData.status,
        permissoes: permissoesPorNivel[formData.nivel]
      }
      
      setUsuarios(usuarios.map(u => 
        u.id === usuarioEditando.id ? usuarioAtualizado : u
      ))
      
      toast.success("Os dados do usuário foram atualizados com sucesso.")
    } else {
      // Novo usuário
      const novoUsuario: Usuario = {
        id: Date.now().toString(),
        nome: formData.nome,
        email: formData.email,
        nivel: formData.nivel,
        status: formData.status,
        dataCriacao: new Date(),
        permissoes: permissoesPorNivel[formData.nivel]
      }
      
      setUsuarios([novoUsuario, ...usuarios])
      toast.success("Novo usuário foi criado com sucesso.")
    }
    
    setModalAberto(false)
    setUsuarioEditando(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      nivel: 'auxiliar',
      status: 'ativo'
    })
  }

  const handleEditar = (usuario: Usuario) => {
    setUsuarioEditando(usuario)
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      nivel: usuario.nivel,
      status: usuario.status
    })
    setModalAberto(true)
  }

  const handleExcluir = (id: string) => {
    setUsuarios(usuarios.filter(u => u.id !== id))
    toast.success("O usuário foi removido do sistema.")
  }

  const handleNovoUsuario = () => {
    setUsuarioEditando(null)
    resetForm()
    setModalAberto(true)
  }

  const handleGerenciarPermissoes = (usuario: Usuario) => {
    setUsuarioPermissoes(usuario)
    setModalPermissoesAberto(true)
  }

  const handleSalvarPermissoes = () => {
    if (usuarioPermissoes) {
      setUsuarios(usuarios.map(u => 
        u.id === usuarioPermissoes.id ? usuarioPermissoes : u
      ))
      
      toast.success("As permissões do usuário foram atualizadas.")
    }
    
    setModalPermissoesAberto(false)
    setUsuarioPermissoes(null)
  }

  const handlePermissaoChange = (modulo: keyof Usuario['permissoes'], valor: boolean) => {
    if (usuarioPermissoes) {
      setUsuarioPermissoes({
        ...usuarioPermissoes,
        permissoes: {
          ...usuarioPermissoes.permissoes,
          [modulo]: valor
        }
      })
    }
  }

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'master': return 'bg-red-100 text-red-800'
      case 'gerente': return 'bg-blue-100 text-blue-800'
      case 'auxiliar': return 'bg-green-100 text-green-800'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getNivelLabel = (nivel: string) => {
    switch (nivel) {
      case 'master': return 'Master'
      case 'gerente': return 'Gerente'
      case 'auxiliar': return 'Auxiliar'
      default: return nivel
    }
  }

  const getModuloLabel = (modulo: string) => {
    const labels: Record<string, string> = {
      dashboard: 'Dashboard',
      empresas: 'Empresas',
      entradas: 'Entradas',
      saidas: 'Saídas',
      relatorios: 'Relatórios',
      colaboradores: 'Colaboradores',
      pagamentos: 'Pagamentos',
      integracoes: 'Integrações',
      usuarios: 'Usuários'
    }
    return labels[modulo] || modulo
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Controle de Acessos</h1>
          <p className="text-muted-foreground">Gerencie usuários e permissões do sistema</p>
        </div>
        
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button onClick={handleNovoUsuario}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome completo do usuário"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="usuario@empresa.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="senha">Senha {usuarioEditando && '(deixe vazio para manter)'}</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={(e) => setFormData({...formData, senha: e.target.value})}
                    placeholder="Senha do usuário"
                    required={!usuarioEditando}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                  >
                    {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nivel">Nível de Acesso</Label>
                  <select
                    id="nivel"
                    value={formData.nivel}
                    onChange={(e) => setFormData({...formData, nivel: e.target.value as any})}
                    className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                  >
                    <option value="auxiliar">Auxiliar</option>
                    <option value="gerente">Gerente</option>
                    <option value="master">Master</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {usuarioEditando ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuários Ativos</p>
                <p className="text-3xl font-bold text-green-600">{usuariosAtivos}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Masters</p>
                <p className="text-3xl font-bold text-red-600">{usuariosMaster}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gerentes</p>
                <p className="text-3xl font-bold text-blue-600">{usuariosGerente}</p>
              </div>
              <Key className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Auxiliares</p>
                <p className="text-3xl font-bold text-purple-600">{usuariosAuxiliar}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Nome ou e-mail..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filtroNivel">Nível</Label>
              <select
                id="filtroNivel"
                value={filtroNivel}
                onChange={(e) => setFiltroNivel(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
              >
                <option value="">Todos os níveis</option>
                <option value="master">Master</option>
                <option value="gerente">Gerente</option>
                <option value="auxiliar">Auxiliar</option>
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
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuariosFiltrados.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nome}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getNivelColor(usuario.nivel)}`}>
                      {getNivelLabel(usuario.nivel)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      usuario.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {usuario.ultimoAcesso ? formatDate(usuario.ultimoAcesso) : 'Nunca'}
                  </TableCell>
                  <TableCell>{formatDate(usuario.dataCriacao)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleGerenciarPermissoes(usuario)}
                        title="Gerenciar Permissões"
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditar(usuario)}
                        title="Editar Usuário"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleExcluir(usuario.id)}
                        title="Excluir Usuário"
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

      {/* Modal de Permissões */}
      <Dialog open={modalPermissoesAberto} onOpenChange={setModalPermissoesAberto}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Permissões - {usuarioPermissoes?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {usuarioPermissoes && Object.entries(usuarioPermissoes.permissoes).map(([modulo, permitido]) => (
                <div key={modulo} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={modulo}
                    checked={permitido}
                    onChange={(e) => handlePermissaoChange(modulo as keyof Usuario['permissoes'], e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={modulo} className="text-sm font-medium">
                    {getModuloLabel(modulo)}
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setModalPermissoesAberto(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSalvarPermissoes}>
                Salvar Permissões
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}