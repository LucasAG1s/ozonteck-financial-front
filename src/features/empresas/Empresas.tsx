import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { formatCNPJ } from '@/lib/utils'
import { toast } from 'react-toastify'

interface Empresa {
  id: string
  razaoSocial: string
  cnpj: string
  nomeFantasia: string
  tipo: string
  status: 'Ativa' | 'Inativa'
}

const empresasIniciais: Empresa[] = [
  {
    id: '1',
    razaoSocial: 'Empresa Principal LTDA',
    cnpj: '12345678000190',
    nomeFantasia: 'Empresa Principal',
    tipo: 'Matriz',
    status: 'Ativa'
  },
  {
    id: '2',
    razaoSocial: 'Filial Norte LTDA',
    cnpj: '98765432000110',
    nomeFantasia: 'Filial Norte',
    tipo: 'Filial',
    status: 'Ativa'
  },
  {
    id: '3',
    razaoSocial: 'Filial Sul LTDA',
    cnpj: '11222333000144',
    nomeFantasia: 'Filial Sul',
    tipo: 'Filial',
    status: 'Inativa'
  }
]

export function Empresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>(empresasIniciais)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null)

  const [formData, setFormData] = useState({
    razaoSocial: '',
    cnpj: '',
    nomeFantasia: '',
    tipo: 'Matriz'
  })

  const empresasFiltradas = empresas.filter(empresa =>
    empresa.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
    empresa.cnpj.includes(busca) ||
    empresa.nomeFantasia.toLowerCase().includes(busca.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (empresaEditando) {
      setEmpresas(empresas.map(emp => 
        emp.id === empresaEditando.id 
          ? { ...emp, ...formData }
          : emp
      ))
      toast.success("Os dados da empresa foram atualizados com sucesso.")
    } else {
      const novaEmpresa: Empresa = {
        id: Date.now().toString(),
        ...formData,
        status: 'Ativa'
      }
      setEmpresas([...empresas, novaEmpresa])
      toast.success("Nova empresa foi cadastrada com sucesso.")
    }
    
    setModalAberto(false)
    setEmpresaEditando(null)
    setFormData({ razaoSocial: '', cnpj: '', nomeFantasia: '', tipo: 'Matriz' })
  }

  const handleEdit = (empresa: Empresa) => {
    setEmpresaEditando(empresa)
    setFormData({
      razaoSocial: empresa.razaoSocial,
      cnpj: empresa.cnpj,
      nomeFantasia: empresa.nomeFantasia,
      tipo: empresa.tipo
    })
    setModalAberto(true)
  }

  const handleDelete = (id: string) => {
    setEmpresas(empresas.filter(emp => emp.id !== id))
    toast.success("A empresa foi removida com sucesso.")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Empresas</h1>
        <p className="text-muted-foreground">Gerencie os CNPJs cadastrados no sistema</p>
        </div>
        
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEmpresaEditando(null)
              setFormData({ razaoSocial: '', cnpj: '', nomeFantasia: '', tipo: 'Matriz' })
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {empresaEditando ? 'Editar Empresa' : 'Nova Empresa'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="razaoSocial">Razão Social</Label>
                <Input
                  id="razaoSocial"
                  value={formData.razaoSocial}
                  onChange={(e) => setFormData({...formData, razaoSocial: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input
                  id="nomeFantasia"
                  value={formData.nomeFantasia}
                  onChange={(e) => setFormData({...formData, nomeFantasia: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                >
                  <option value="Matriz">Matriz</option>
                  <option value="Filial">Filial</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {empresaEditando ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por razão social, CNPJ ou nome fantasia..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão Social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Nome Fantasia</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresasFiltradas.map((empresa) => (
                <TableRow key={empresa.id}>
                  <TableCell className="font-medium">{empresa.razaoSocial}</TableCell>
                  <TableCell>{formatCNPJ(empresa.cnpj)}</TableCell>
                  <TableCell>{empresa.nomeFantasia}</TableCell>
                  <TableCell>{empresa.tipo}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      empresa.status === 'Ativa' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {empresa.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(empresa)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(empresa.id)}
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