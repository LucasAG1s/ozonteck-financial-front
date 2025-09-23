import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, Building, FileText } from 'lucide-react';

interface Fornecedor {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  categoria: string;
  status: 'ativo' | 'inativo';
  observacoes: string;
  dataCadastro: string;
}

interface FornecedorForm {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  categoria: string;
  status: 'ativo' | 'inativo';
  observacoes: string;
}

export function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([
    {
      id: 1,
      razaoSocial: 'Tech Solutions Ltda',
      nomeFantasia: 'TechSol',
      cnpj: '12.345.678/0001-90',
      email: 'contato@techsol.com.br',
      telefone: '(11) 98765-4321',
      endereco: 'Rua das Flores, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      categoria: 'Tecnologia',
      status: 'ativo',
      observacoes: 'Fornecedor de equipamentos de TI',
      dataCadastro: '2024-01-15'
    },
    {
      id: 2,
      razaoSocial: 'Materiais de Escritório S.A.',
      nomeFantasia: 'MatEscritório',
      cnpj: '98.765.432/0001-10',
      email: 'vendas@matescritorio.com.br',
      telefone: '(11) 87654-3210',
      endereco: 'Av. Paulista, 456',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      categoria: 'Material de Escritório',
      status: 'ativo',
      observacoes: 'Fornecedor de materiais de escritório',
      dataCadastro: '2024-02-10'
    },
    {
      id: 3,
      razaoSocial: 'Limpeza Total Ltda',
      nomeFantasia: 'Clean Total',
      cnpj: '11.222.333/0001-44',
      email: 'contato@cleantotal.com.br',
      telefone: '(11) 76543-2109',
      endereco: 'Rua da Limpeza, 789',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04567-890',
      categoria: 'Serviços de Limpeza',
      status: 'inativo',
      observacoes: 'Contrato suspenso temporariamente',
      dataCadastro: '2024-01-20'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
  const [form, setForm] = useState<FornecedorForm>({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    categoria: '',
    status: 'ativo',
    observacoes: ''
  });


  const filteredFornecedores = fornecedores.filter(fornecedor => {
    const matchesSearch = fornecedor.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fornecedor.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fornecedor.cnpj.includes(searchTerm);
    const matchesStatus = statusFilter === 'todos' || fornecedor.status === statusFilter;
    const matchesCategoria = !categoriaFilter || fornecedor.categoria.toLowerCase().includes(categoriaFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesCategoria;
  });

  const categorias = [...new Set(fornecedores.map(f => f.categoria))];
  const fornecedoresAtivos = fornecedores.filter(f => f.status === 'ativo').length;
  const fornecedoresInativos = fornecedores.filter(f => f.status === 'inativo').length;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.razaoSocial || !form.cnpj || !form.email) {
      return;
    }

    if (editingFornecedor) {
      setFornecedores(prev => prev.map(fornecedor => 
        fornecedor.id === editingFornecedor.id 
          ? { ...fornecedor, ...form }
          : fornecedor
      ));

    } else {
      const novoFornecedor: Fornecedor = {
        id: Date.now(),
        ...form,
        dataCadastro: new Date().toISOString().split('T')[0]
      };
      setFornecedores(prev => [...prev, novoFornecedor]);

    }

    setForm({
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      categoria: '',
      status: 'ativo',
      observacoes: ''
    });
    setEditingFornecedor(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (fornecedor: Fornecedor) => {
    setForm({
      razaoSocial: fornecedor.razaoSocial,
      nomeFantasia: fornecedor.nomeFantasia,
      cnpj: fornecedor.cnpj,
      email: fornecedor.email,
      telefone: fornecedor.telefone,
      endereco: fornecedor.endereco,
      cidade: fornecedor.cidade,
      estado: fornecedor.estado,
      cep: fornecedor.cep,
      categoria: fornecedor.categoria,
      status: fornecedor.status,
      observacoes: fornecedor.observacoes
    });
    setEditingFornecedor(fornecedor);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setFornecedores(prev => prev.filter(fornecedor => fornecedor.id !== id));

  };

  const openNewDialog = () => {
    setForm({
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      categoria: '',
      status: 'ativo',
      observacoes: ''
    });
    setEditingFornecedor(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fornecedores</h1>
        <Button onClick={openNewDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Fornecedores</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fornecedores.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{fornecedoresAtivos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Inativos</CardTitle>
            <Building className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{fornecedoresInativos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorias.length}</div>
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
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'todos' | 'ativo' | 'inativo')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>

            <Input
              placeholder="Filtrar por categoria..."
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
            />

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todos');
                setCategoriaFilter('');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Fornecedores */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Fornecedores</CardTitle>
          <CardDescription>
            {filteredFornecedores.length} fornecedor(es) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão Social</TableHead>
                <TableHead>Nome Fantasia</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFornecedores.map((fornecedor) => (
                <TableRow key={fornecedor.id}>
                  <TableCell className="font-medium">{fornecedor.razaoSocial}</TableCell>
                  <TableCell>{fornecedor.nomeFantasia}</TableCell>
                  <TableCell>{fornecedor.cnpj}</TableCell>
                  <TableCell>{fornecedor.categoria}</TableCell>
                  <TableCell>{fornecedor.telefone}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      fornecedor.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {fornecedor.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(fornecedor)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(fornecedor.id)}
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

      {/* Dialog para Cadastro/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </DialogTitle>
            <DialogDescription>
              {editingFornecedor 
                ? 'Atualize as informações do fornecedor.' 
                : 'Preencha as informações do novo fornecedor.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="razaoSocial">Razão Social *</Label>
                <Input
                  id="razaoSocial"
                  name="razaoSocial"
                  value={form.razaoSocial}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input
                  id="nomeFantasia"
                  name="nomeFantasia"
                  value={form.nomeFantasia}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  value={form.cnpj}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  name="categoria"
                  value={form.categoria}
                  onChange={handleInputChange}
                  placeholder="Ex: Tecnologia, Serviços, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={form.telefone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                name="endereco"
                value={form.endereco}
                onChange={handleInputChange}
                placeholder="Rua, número, complemento"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  value={form.cidade}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  name="estado"
                  value={form.estado}
                  onChange={handleInputChange}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  name="cep"
                  value={form.cep}
                  onChange={handleInputChange}
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={form.observacoes}
                onChange={handleInputChange}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                placeholder="Observações adicionais sobre o fornecedor..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingFornecedor ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Fornecedores;