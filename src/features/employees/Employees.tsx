import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Plus, Search, Users, DollarSign, Edit, Trash2, Filter } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { GenericForm, FormFieldConfig } from '@/components/forms/GenericForm'
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog'
import { Employee, getEmployees, createEmployee, updateEmployee, deleteEmployee, CreateEmployeePayload, UpdateEmployeePayload } from '@/lib/services/hr/employees.service'
import { getSectors } from '@/lib/services/hr/sectors.service'
import { useCompanies } from '@/hooks/useCompanies'
import { formatCurrency, formatCPF } from '@/lib/utils'
import { toast } from 'react-toastify'

const employeeSchema = z.object({
  name: z.string().min(3, 'O nome é obrigatório.'),
  cpf: z.string().min(11, 'O CPF é obrigatório.'),
  position: z.string().min(3, 'O cargo é obrigatório.'),
  base_salary: z.coerce.string().min(1, 'O salário base é obrigatório.'),
  admission_date: z.string().min(1, 'A data de admissão é obrigatória.'),
  phone: z.string().min(10, 'O telefone é obrigatório.'),
  email: z.string().email('O e-mail é inválido.'),
  company_id: z.coerce.number().min(1, 'A empresa é obrigatória.'),
  sector_id:z.coerce.number().min(1, 'O setor é obrigatório.'),
});

export function Employees() {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanies();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);


  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees', selectedCompany?.id],
    queryFn: () => getEmployees(selectedCompany!.id),
    enabled: !!selectedCompany,
    staleTime: 1000 * 60, // 1 minuto
  });

  const {data:sectors = [], isLoading: isLoadingSectors} =useQuery({
    queryKey: ['sectors', selectedCompany?.id],
    queryFn: () => getSectors(selectedCompany!.id),
    staleTime: 1000 * 60 * 60, // 1 hora
  })

  const { mutate: createEmployeeMutation, isPending: isCreating } = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      toast.success("Colaborador criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsModalOpen(false);
    },
    onError: (error: Error) => toast.error(`Erro ao criar: ${error.message}`),
  });

  const { mutate: updateEmployeeMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateEmployeePayload }) => updateEmployee(id, payload),
    onSuccess: () => {
      toast.success("Colaborador atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsModalOpen(false);
    },
    onError: (error: Error) => toast.error(`Erro ao atualizar: ${error.message}`),
  });

  const { mutate: deleteEmployeeMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      toast.success("Colaborador excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsAlertOpen(false);
    },
    onError: (error: Error) => toast.error(`Erro ao excluir: ${error.message}`),
  });

  const filteredEmployees = useMemo(() => employees.filter(employee => {
    const matchSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       employee.cpf.includes(searchTerm) ||
                       employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || employee.status === statusFilter;
    const matchSector = !sectorFilter || employee.sector_id === Number(sectorFilter);
    return matchSearch && matchStatus && matchSector;
  }), [employees, searchTerm, statusFilter, sectorFilter]);

  const activeEmployeesCount = employees.filter(c => c.status === 'ativo').length;
  const totalPayroll = employees
    .filter(c => c.status === 'ativo')
    .reduce((sum, c) => sum + Number(c.base_salary), 0); // Usar base_salary

  const handleFormSubmit = (data: z.infer<typeof employeeSchema>) => {
    if (employeeToEdit) {
      updateEmployeeMutation({ id: employeeToEdit.id, payload: data });
    } else {
      createEmployeeMutation(data as CreateEmployeePayload);
    }
  };

  const handleEditClick = (employee: Employee) => {
    // Navega para a nova página de edição
    navigate(`/employees/edit/${employee.id}`);
  };

  const handleDeleteClick = (id: number) => {
    setEmployeeToDelete(id);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployeeMutation(employeeToDelete);
    }
  };

  const handleOpenNewModal = () => {
    setEmployeeToEdit(null);
    setIsModalOpen(true);
  };

  const formFields: FormFieldConfig<typeof employeeSchema>[] = [
    { name: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Nome do colaborador', gridCols: 2, disabled: false},
    { name: 'cpf', label: 'CPF', type: 'text', placeholder: '000.000.000-00', gridCols: 1 , disabled: false},
    { name: 'phone', label: 'Telefone', type: 'text', placeholder: '(00) 00000-0000', gridCols: 1, disabled: false},
    { name: 'email', label: 'E-mail', type: 'email', placeholder: 'colaborador@empresa.com', gridCols: 1 , disabled: false},
    { name: 'position', label: 'Cargo', type: 'text', placeholder: 'Ex: Desenvolvedor', gridCols: 1,  disabled: false},
    { name: 'base_salary', label: 'Salário Base', type: 'number', placeholder: '0,00', step: '0.01', gridCols: 1, disabled: false},
    { name: 'admission_date', label: 'Data de Admissão', type: 'date', gridCols: 1, disabled: false},
    {
      name: 'sector_id',
      label: 'Setor',
      type: 'select',
      placeholder: 'Selecione o setor',
      options: sectors.map(sector => ({ value: sector.id, label: sector.name })),
      gridCols: 1,
      disabled: false,
    },
    {
      name: 'company_id',
      label: 'Empresa',
      type: 'select',
      placeholder: 'Empresa',
      options: selectedCompany ? [{ value: selectedCompany.id, label: selectedCompany.corporate_name }] : [],
      gridCols: 1,
      disabled: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Colaboradores</h1>
        <p className="text-muted-foreground">Gerencie os funcionários da empresa</p>
        </div>
        <Button onClick={handleOpenNewModal}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Colaborador
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Colaboradores Ativos</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold text-blue-600">{activeEmployeesCount}</p>}
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
                {isLoading ? <Skeleton className="h-8 w-32 mt-1" /> : <p className="text-3xl font-bold text-green-600">{formatCurrency(totalPayroll)}</p>}
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Filter className="h-5 w-5 mr-2" /> Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="busca">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Nome, CPF ou Posição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filtroStatus">Status</Label>
              <Select onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)} value={statusFilter || "all"}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filtroSector">Setor</Label>
              <Select onValueChange={(value) => setSectorFilter(value === "all" ? "" : value)} value={sectorFilter || "all"}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {sectors.map((sector) =>
                    <SelectItem key={sector.id} value={ String(sector.id)}>
                      {sector.name}
                    </SelectItem> )
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Colaboradores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Salário</TableHead>
                <TableHead>Admissão</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
              ))}
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    <div>{employee.name}</div>
                    <div className="text-xs text-muted-foreground">{formatCPF(employee.cpf)}</div>
                  </TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(Number(employee.base_salary))}</TableCell> {/* Usar base_salary */}
                  <TableCell>{new Date(employee.admission_date).toLocaleDateString()}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      employee.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditClick(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(employee.id)}
                      >
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
        onOpenChange={(isOpen) => { if (!isOpen) setEmployeeToEdit(null); setIsModalOpen(isOpen); }}
        onSubmit={handleFormSubmit}
        isLoading={isCreating}
        initialData={employeeToEdit}
        fields={formFields}
        schema={employeeSchema}
        title={employeeToEdit ? 'Editar Colaborador' : 'Novo Colaborador'}
        description="Preencha as informações para gerenciar o colaborador."
      />

      <DeleteConfirmationDialog
        isOpen={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        description="Essa ação não pode ser desfeita. Isso irá excluir permanentemente o colaborador."
      />
    </div>
  )
}