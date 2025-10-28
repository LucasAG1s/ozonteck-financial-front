import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createContract, updateContract, deleteContract, UpdateContractPayload } from '@/lib/services/hr/employees.service';
import { IEmployee as Employee, IEmployeeContract as EmployeeContract} from '@/interfaces/HR/EmployeeInterface';
import { Button, buttonVariants } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { getCompanies } from '@/lib/services/finance/company.service'; 
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ICompany as Company } from '@/interfaces/universal/CompanyInterface';
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog';
import { GenericForm, FormFieldConfig } from '@/components/forms/GenericForm';
import {ISector as Sector} from '@/interfaces/HR/SectorInterface';
import { getSectors } from '@/lib/services/hr/sectors.service';
import { cn } from '@/lib/utils';
import { SalaryHistoryModal } from './SalaryHistoryModal';

const contractSchema = z.object({
  company_id: z.coerce.number().min(1, 'A empresa é obrigatória.'),
  contract_type: z.string().min(1, 'O tipo de contrato é obrigatório.'),
  admission_date: z.string().min(1, 'A data de admissão é obrigatória.'), 
  salary: z.coerce.string().min(1, 'O salário é obrigatório.'),
  position: z.string().min(1, 'O cargo é obrigatório.').nullable(),
  sector_id: z.coerce.number().min(1, 'O setor é obrigatório.'),
  is_unionized: z.coerce.boolean(),
  work_schedule: z.string().optional().nullable(),
  active: z.coerce.boolean(),
});

interface EmployeeContractsListProps {
  employee: Employee;
}

export function EmployeeContractsList({ employee }: EmployeeContractsListProps) {

  const contracts = employee.contracts || [];
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<Partial<EmployeeContract> & { salary?: string } | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<number | null>(null);
  const [isSalaryHistoryModalOpen, setIsSalaryHistoryModalOpen] = useState(false);
  const [selectedContractForHistory, setSelectedContractForHistory] = useState<EmployeeContract | null>(null);

  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: getCompanies,
    staleTime: 1000 * 60 * 360, 
  });

  const { mutate: createContractMutation, isPending: isCreating } = useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      toast.success("Contrato criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['employee', String(employee.id)] });
      setIsModalOpen(false);
    },
    onError: (error: Error) => toast.error(`Erro ao criar contrato: ${error.message}`),
  });

  const { mutate: updateContractMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateContractPayload }) => updateContract(id, payload),
    onSuccess: () => {
      toast.success("Contrato atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['employee', String(employee.id)] });
      setIsModalOpen(false);
      setContractToEdit(null);
    },
    onError: (error: Error) => toast.error(`Erro ao atualizar contrato: ${error.message}`),
  });

  const { mutate: deleteContractMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteContract,
    onSuccess: () => {
      toast.success("Contrato excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['employee', String(employee.id)] });
      setIsAlertOpen(false);
      setContractToDelete(null);
    },
    onError: (error: Error) => toast.error(`Erro ao excluir contrato: ${error.message}`),
  });

  const handleFormSubmit = (data: z.infer<typeof contractSchema>) => {
    if (contractToEdit && contractToEdit.id) {
      const payload = { 
        ...data, 
        is_unionized: data.is_unionized,
        active: data.active,
        work_schedule: data.work_schedule || null,
      };
      updateContractMutation({ id: contractToEdit.id, payload: payload });
    } else {
      const payloadWithEmployeeId = { 
        ...data, 
        employee_id: employee.id, 
        is_unionized: data.is_unionized,
        active: data.active,
        work_schedule: data.work_schedule || null,
        salaries: [], 
      };
      createContractMutation(payloadWithEmployeeId);
    }
  };

  const handleOpenNewModal = () => {
    setContractToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (contract: EmployeeContract) => {
    const currentSalary = contract.salaries?.sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime())[0];
    const contractForEdit = {
      ...contract,
      salary: currentSalary?.salary || '0', 
      is_unionized: !!contract.is_unionized,
      active: !!contract.active,
    };
    setContractToEdit(contractForEdit); 
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setContractToDelete(id);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (contractToDelete) {
      deleteContractMutation(contractToDelete);
    }
  };

  const handleOpenSalaryHistory = (contract: EmployeeContract) => {
    setSelectedContractForHistory(contract);
    setIsSalaryHistoryModalOpen(true);
  };

  const formFields = (watch: Function): FormFieldConfig<typeof contractSchema>[] => {
    const selectedCompanyId = watch('company_id');

    const { data: sectors = [], isLoading: isLoadingSectors } = useQuery<Sector[]>({
      queryKey: ['sectors', selectedCompanyId],
      queryFn: () => getSectors(selectedCompanyId),
      enabled: !!selectedCompanyId,
      staleTime: 1000 * 60 * 5, 
    });

    const fields: FormFieldConfig<typeof contractSchema>[] = [
      { name: 'company_id', label: 'Empresa', type: 'select', options: companies.map(c => ({ value: c.id, label: c.corporate_name })), gridCols: 1 },
      { name: 'sector_id', label: 'Setor', type: 'select', options: sectors.map(s => ({ value: s.id, label: s.name })), gridCols: 1, disabled: !selectedCompanyId || isLoadingSectors, placeholder: isLoadingSectors ? 'Carregando...' : 'Selecione um setor' },
      { name: 'contract_type', label: 'Tipo de Contrato', type: 'select', options: [{ value: 'CLT', label: 'CLT' }, { value: 'PJ', label: 'PJ' }, { value: 'Estágio', label: 'Estágio' }], gridCols: 1 },
      { name: 'position', label: 'Cargo', type: 'text', placeholder: 'Ex: Desenvolvedor', gridCols: 1 },
      { name: 'salary', label: 'Salário', type: 'number', placeholder: '0.00', step: '0.01', gridCols: 1 },
      { name: 'admission_date', label: 'Data de Admissão', type: 'date', gridCols: 1 },
      { name: 'work_schedule', label: 'Jornada de Trabalho (Opcional)', type: 'text', placeholder: 'Ex: 09:00 às 18:00', gridCols: 1 },
      { name: 'is_unionized', label: 'Sindicalizado?', type: 'select', options: [{ value: 'true', label: 'Sim' }, { value: 'false', label: 'Não' }], gridCols: 1 },
    ];

    fields.push({ name: 'active', label: 'Status do Contrato', type: 'select', options: [{ value: 'true', label: 'Ativo' }, { value: 'false', label: 'Inativo' }], gridCols: 1 });

    return fields;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Contratos</CardTitle>
          <Button size="sm" className="h-8" onClick={handleOpenNewModal}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar Contrato
          </Button>
        </CardHeader>
        <CardDescription className="px-6">Histórico e detalhes dos contratos de trabalho.</CardDescription>
        <CardContent className="pt-4">
          {contracts.length === 0 ? (
            <p className="text-muted-foreground">Nenhum contrato cadastrado para este colaborador.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Salário</TableHead>
                    <TableHead>Admissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCompanies ? (
                    <TableRow>
                      <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ) : (
                    contracts.map((contract) => {
                      const currentSalary = contract.salaries?.sort((a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime())[0];
                      const companyName = companies.find(c => c.id === contract.company_id)?.corporate_name || '...';
                      return (
                        <TableRow key={contract.id}>
                          <TableCell>{contract.contract_type}</TableCell>
                          <TableCell>{companyName}</TableCell>
                          <TableCell>{contract.position || 'N/A'}</TableCell>
                          <TableCell>
                            <Popover>
                              <PopoverTrigger asChild>
                                <span className="cursor-pointer  decoration-dashed">
                                  {currentSalary ? formatCurrency(Number(currentSalary.salary)) : 'N/A'}
                                </span>
                              </PopoverTrigger>
                              <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                  <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Histórico Salarial</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Salários anteriores para este contrato.
                                    </p>
                                  </div>
                                  <ul className="text-sm space-y-1">
                                    {contract.salaries?.map(s => (
                                      <li key={s.id} className="flex justify-between"><span>{formatCurrency(Number(s.salary))}</span> <span className="text-muted-foreground">desde {new Date(s.effective_date).toLocaleDateString('pt-BR')}</span></li>
                                    ))}
                                  </ul>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell>{new Date(contract.admission_date + 'T00:00:00').toLocaleDateString('PT-BR')}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              contract.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {contract.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className='flex items-center justify-end gap-2'>
                              <button onClick={() => handleOpenSalaryHistory(contract)} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))} title="Ver Histórico de Salários">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-history"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                              </button>
                              <button className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))} onClick={() => handleEditClick(contract)} title="Editar Contrato">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))} onClick={() => handleDeleteClick(contract.id)} title="Excluir Contrato">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <GenericForm
        isOpen={isModalOpen}
        onOpenChange={(isOpen) => { if (!isOpen) setContractToEdit(null); setIsModalOpen(isOpen); }}
        onSubmit={handleFormSubmit}
        isLoading={isCreating || isUpdating}
        initialData={contractToEdit || { company_id: companies[0]?.id, active: true, is_unionized: false}}
        fields={formFields}
        schema={contractSchema}
        title={contractToEdit ? 'Editar Contrato' : 'Novo Contrato'}
        description="Preencha as informações do contrato do colaborador."
      />

      <DeleteConfirmationDialog
        isOpen={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Excluir Contrato?"
        description="Essa ação não pode ser desfeita. Isso irá excluir permanentemente o contrato do colaborador."
      />

      <SalaryHistoryModal
        isOpen={isSalaryHistoryModalOpen}
        onOpenChange={(isOpen) => {
          setIsSalaryHistoryModalOpen(isOpen);
          if (!isOpen) setSelectedContractForHistory(null);
        }}
        contract={selectedContractForHistory}
      />
    </>
  );
}