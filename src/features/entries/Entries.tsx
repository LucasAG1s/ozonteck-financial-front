import { useState, useMemo, useEffect } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableFooter as ShadcnTableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Plus, Search, Filter, Edit, Trash2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { toast } from 'react-toastify';
import { Entrie, getEntries, createEntry, updateEntry, UpdateEntryPayload, deleteEntry } from '@/lib/services/finance/entries.service';
import { getAccountPlans } from '@/lib/services/finance/account-plan.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from '@/hooks/useCompanies';
import { DateRangeFilter } from '@/components/ui/dateRangeFilter';
import { GenericForm, FormFieldConfig} from '@/components/forms/GenericForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const entrySchema = z.object({
  description: z.string().min(3, 'A descrição é obrigatória.'),
  amount: z.coerce.string().min(1, 'O valor é obrigatório.'),
  entry_date: z.string().min(1, 'A data é obrigatória.'),
  company_id: z.coerce.number().min(1, 'A empresa é obrigatória.'),
  account_plan_id: z.coerce.number().min(1, 'O plano de contas é obrigatório.'),
  bank_account_id: z.coerce.number().min(1, 'A conta bancária é obrigatória.'),
  origin: z.string().min(3, 'A origem é obrigatória.'),
});

const getBankAccounts = async () => Promise.resolve([
    { id: 1, name: "Conta Corrente Principal" },
    { id: 2, name: "Conta Poupança" },
]);

export function Entries() {
  const queryClient = useQueryClient();

  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const { selectedCompany } = useCompanies();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<Entrie | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bankAccountFilter, setBankAccountFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const { data: entries = [], isLoading: isLoadingEntries } = useQuery<Entrie[]>({ 
    queryKey: ['entries', selectedCompany?.id, startDate, endDate], 
    queryFn: () => getEntries(startDate, endDate, String(selectedCompany?.id)),
    enabled: !!selectedCompany?.id,
  });
  const { data: accountPlans = [], isLoading: isLoadingPlans } = useQuery({ queryKey: ['accountPlans'], queryFn: getAccountPlans });
  const { data: bankAccounts = [], isLoading: isLoadingBanks } = useQuery({ queryKey: ['bankAccounts'], queryFn: getBankAccounts, staleTime: Infinity }); // Adicionado staleTime para simulação
  const { companies, loading: isLoadingCompanies } = useCompanies();

  const { mutate: createEntryMutation, isPending: isCreating } = useMutation({
    mutationFn: createEntry,
    onSuccess: () => {
      toast.success("Nova entrada registrada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setIsModalOpen(false);
    },
    onError: (error: Error) => toast.error(`Erro ao criar entrada: ${error.message}`),
  });

  const { mutate: updateEntryMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateEntryPayload }) => updateEntry(id, payload),
    onSuccess: () => {
      toast.success("Entrada atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setIsModalOpen(false);
      setEntryToEdit(null);
    },
    onError: (error: Error) => toast.error(`Erro ao atualizar entrada: ${error.message}`),
  });

  const { mutate: deleteEntryMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => {
      toast.success("Entrada excluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      setIsAlertOpen(false);
      setEntryToDelete(null);
    },
    onError: (error: Error) => toast.error(`Erro ao excluir entrada: ${error.message}`),
  });

  const handleFormSubmit = (data: z.infer<typeof entrySchema>) => {
    if (entryToEdit) {
      updateEntryMutation({ id: entryToEdit.id, payload: data });
    } else {
      createEntryMutation(data);
    }
  };

  const handleOpenNewModal = () => {
    setEntryToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (entry: Entrie) => {
    setEntryToEdit(entry);
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (id: number) => {
    setEntryToDelete(id);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (entryToDelete !== null) {
      deleteEntryMutation(entryToDelete);
    }
  };

  // Lógica de filtro e total
  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    return entries.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBankAccount = !bankAccountFilter || String(e.bank_account_id) === bankAccountFilter;
      return matchesSearch && matchesBankAccount;
    });
  }, [entries, searchTerm, bankAccountFilter]);

  // O total continua sendo calculado sobre TODOS os itens filtrados, não apenas os paginados.
  const totalEntries = filteredEntries.reduce((sum, entry) => sum + Number(entry.amount), 0);

  // Lógica para fatiar os dados para a página atual
  const paginatedEntries = useMemo(() => {
    return filteredEntries.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredEntries, currentPage]);

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);

  const formFields: FormFieldConfig[] = [
    { name: 'description', label: 'Descrição', type: 'text', placeholder: 'Ex: Venda de produto X', gridCols: 2 },
    { name: 'amount', label: 'Valor', type: 'number', placeholder: '0,00', step: "0.01", gridCols: 1 },
    { name: 'entry_date', label: 'Data da Entrada', type: 'date', gridCols: 1 },
    {
      name: 'company_id',
      label: 'Empresa (CNPJ)',
      type: 'select',
      placeholder: 'Selecione uma empresa',
      options: companies.map(c => ({ value: c.id, label: `${c.corporate_name} (${c.cnpj})` })),
      gridCols: 2,
    },
    {
      name: 'account_plan_id',
      label: 'Plano de Contas',
      type: 'select',
      placeholder: 'Selecione um plano',
      options: accountPlans.filter(p => p.type === 1).map(p => ({ value: p.id, label: `${p.name} (${p.description})` })),
      gridCols: 1,
    },
    {
      name: 'bank_account_id',
      label: 'Conta Bancária',
      type: 'select',
      placeholder: 'Selecione uma conta',
      options: bankAccounts.map(b => ({ value: b.id, label: b.name })),
      gridCols: 1,
    },
    { name: 'origin', label: 'Origem', type: 'text', placeholder: 'Ex: Cliente Y', gridCols: 2 },
  ];

  const isLoading = isLoadingEntries || isLoadingCompanies || isLoadingPlans || isLoadingBanks;
  if (isLoading) return <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Entradas</h1>
          <p className="text-muted-foreground">Gerencie as receitas e entradas financeiras</p>
        </div>
        <Button onClick={handleOpenNewModal}><Plus className="h-4 w-4 mr-2" /> Nova Entrada</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center"><Filter className="h-5 w-5 mr-2" /> Filtros</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="busca">Buscar por descrição</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="busca" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div>
              <Label htmlFor="bankAccountFilter">Filtrar por Conta</Label>
              <Select onValueChange={(value) => setBankAccountFilter(value === "all" ? "" : value)} value={bankAccountFilter || "all"}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as contas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as contas</SelectItem>
                  {bankAccounts.map(account => (
                    <SelectItem key={account.id} value={String(account.id)}>{account.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Período</Label>
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onFilter={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lista de Entradas</CardTitle></CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border scrollbar-thumb-rounded-md hover:scrollbar-thumb-accent">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Plano de Contas</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(new Date(entry.entry_date))}</TableCell>
                  <TableCell className="font-medium">{entry.description}</TableCell>
                  <TableCell>{entry.account_plan?.name || 'N/A'}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">{formatCurrency(Number(entry.amount))}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(entry)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(entry.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <ShadcnTableFooter>
              <TableRow>
                <TableCell colSpan={4} className="font-bold text-right">Total</TableCell>
                <TableCell className="text-right font-bold text-green-600">{formatCurrency(totalEntries)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </ShadcnTableFooter>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            {filteredEntries.length} registro(s) encontrado(s).
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>
              Anterior
            </Button>
            <span className="text-sm font-medium">
              Página {currentPage} de {totalPages > 0 ? totalPages : 1}
            </span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage >= totalPages}>
              Próximo
            </Button>
          </div>
        </CardFooter>
      </Card>

      <GenericForm
        isOpen={isModalOpen}
        onOpenChange={(isOpen) => { if (!isOpen) setEntryToEdit(null); setIsModalOpen(isOpen); }}
        onSubmit={handleFormSubmit}
        isLoading={isCreating || isUpdating}
        initialData={entryToEdit}
        fields={formFields}
        schema={entrySchema}
        title={entryToEdit ? 'Editar Entrada' : 'Nova Entrada'}
        description="Preencha as informações abaixo para registrar a entrada financeira."
      />

       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita. Isso irá excluir permanentemente o lançamento.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
