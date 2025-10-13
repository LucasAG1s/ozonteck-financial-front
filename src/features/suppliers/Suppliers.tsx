import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Building, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { GenericForm, FormFieldConfig } from '@/components/forms/GenericForm';
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog';
import { Supplier, getSuppliers, createSupplier, deleteSupplier, CreateSupplierPayload } from '@/lib/services/finance/suppliers.service';
import { formatCNPJ } from '@/lib/utils';
import { toast } from 'react-toastify';

const supplierSchema = z.object({
  name: z.string().min(3, 'O nome é obrigatório.'),
  document: z.string().min(11, 'O documento (CPF/CNPJ) é obrigatório.'),
  email: z.string().email('O e-mail é inválido.'),
  phone: z.string().min(10, 'O telefone é obrigatório.'),
  status: z.enum(['ativo', 'inativo']),
});

export function Suppliers() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const { mutate: createSupplierMutation, isPending: isCreating } = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      toast.success("Fornecedor criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setIsModalOpen(false);
    },
    onError: (error: Error) => toast.error(`Erro ao criar: ${error.message}`),
  });

  const { mutate: deleteSupplierMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      toast.success("Fornecedor excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setIsAlertOpen(false);
    },
    onError: (error: Error) => toast.error(`Erro ao excluir: ${error.message}`),
  });

  const filteredSuppliers = useMemo(() => suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.document.includes(searchTerm);
    const matchesStatus = !statusFilter || supplier.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [suppliers, searchTerm, statusFilter]);

  const activeSuppliersCount = suppliers.filter(f => f.status === 'ativo').length;
  const inactiveSuppliersCount = suppliers.filter(f => f.status === 'inativo').length;

  const handleFormSubmit = (data: z.infer<typeof supplierSchema>) => {
    createSupplierMutation(data as CreateSupplierPayload);
  };

  const handleEditClick = (supplier: Supplier) => {
    navigate(`/suppliers/edit/${supplier.id}`);
  };

  const handleDeleteClick = (id: number) => {
    setSupplierToDelete(id);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (supplierToDelete) {
      deleteSupplierMutation(supplierToDelete);
    }
  };

  const formFields: FormFieldConfig<typeof supplierSchema>[] = [
    { name: 'name', label: 'Nome / Razão Social', type: 'text', placeholder: 'Nome do fornecedor', gridCols: 2, disabled: false },
    { name: 'document', label: 'CNPJ', type: 'text', placeholder: 'Documento', gridCols: 1, disabled: false },
    { name: 'email', label: 'E-mail', type: 'email', placeholder: 'contato@fornecedor.com', gridCols: 1, disabled: false },
    { name: 'phone', label: 'Telefone', type: 'text', placeholder: '(00) 00000-0000', gridCols: 1, disabled: false },
    { name: 'status', label: 'Status', type: 'select', options: [{ value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }], gridCols: 1, disabled: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fornecedores</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Fornecedores</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{suppliers.length}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-green-600">{activeSuppliersCount}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Inativos</CardTitle>
            <Building className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-red-600">{inactiveSuppliersCount}</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Filter className="h-5 w-5 mr-2" /> Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="search" placeholder="Nome ou Documento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div>
              <Label htmlFor="statusFilter">Status</Label>
              <Select onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)} value={statusFilter || "all"}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))}
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{formatCNPJ(supplier.document)}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      supplier.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {supplier.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(supplier)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(supplier.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <GenericForm
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleFormSubmit}
        isLoading={isCreating}
        initialData={null}
        fields={formFields}
        schema={supplierSchema}
        title="Novo Fornecedor"
        description="Preencha as informações para cadastrar um novo fornecedor."
      />

      <DeleteConfirmationDialog
        isOpen={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        description="Essa ação não pode ser desfeita. Isso irá excluir permanentemente o fornecedor."
      />
    </div>
  );
}

export default Suppliers;