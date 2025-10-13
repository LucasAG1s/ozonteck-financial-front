
import { useState, useMemo } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableFooter as ShadcnTableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Plus, Search, Filter, Edit, Trash2, Download } from 'lucide-react';
import { formatCurrency, formatDate, formatBankAccount } from '@/lib/utils';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { toast } from 'react-toastify';
import { Expense, getExpenses, createExpense, updateExpense, UpdateExpensePayload, deleteExpense, uploadFile } from '@/lib/services/finance/expenses.service';
import { getAccountPlans, AccountPlan } from '@/lib/services/finance/account-plan.service';
import { getBanksAccount, BankAccount } from '@/lib/services/finance/banks.service';
import { getSuppliers, Supplier } from '@/lib/services/finance/suppliers.service';
import { PaymentMethod,getPaymentMethods } from '@/lib/services/finance/payment-methods.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanies } from '@/hooks/useCompanies';
import { DateRangeFilter } from '@/components/ui/dateRangeFilter';
import { GenericForm, FormFieldConfig } from '@/components/forms/GenericForm';
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const expenseSchema = z.object({
  description: z.string().min(3, 'A descrição é obrigatória.'),
  amount: z.coerce.string().min(1, 'O valor é obrigatório.'),
  expense_date: z.string().min(1, 'A data é obrigatória.'),
  company_id: z.coerce.number().min(1, 'A empresa é obrigatória.'),
  supplier_id: z.coerce.number().min(1, 'O fornecedor é obrigatório.'),
  payment_method_id:z.coerce.number().min(1, 'O método de pagamento é obrigatório.'),
  account_plan_id: z.coerce.number({ invalid_type_error: 'O plano de contas é obrigatório.' })
    .nullable()
    .refine(val => val !== null && val >= 1, { message: 'O plano de contas é obrigatório.' }),
  bank_account_id: z.coerce.number().min(1, 'A conta bancária é obrigatória.'),
  file_path: z.any()
    .transform((value) => {
      if (value instanceof FileList) return value[0] || null; 
      return value;
    })
    .refine(
      (file) => !(file instanceof File) || file.size <= MAX_FILE_SIZE_BYTES,
      `O tamanho máximo do arquivo é de ${MAX_FILE_SIZE_MB}MB.`
    )
    .optional().nullable(),
});

export function Expenses() {
  const queryClient = useQueryClient();

  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const { selectedCompany } = useCompanies();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bankAccountFilter, setBankAccountFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery<Expense[]>({
    queryKey: ['expenses', selectedCompany?.id, startDate, endDate],
    queryFn: () => getExpenses(startDate, endDate, String(selectedCompany?.id)),
    staleTime: 1000 * 60, // 1 minuto
    enabled: !!selectedCompany?.id,
  });

  const { companies, loading: isLoadingCompanies } = useCompanies();
  const { data: accountPlans = [], isLoading: isLoadingPlans } = useQuery<AccountPlan[]>({
    queryKey: ['accountPlans'],
    queryFn: getAccountPlans,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const { data: bankAccounts = [], isLoading: isLoadingBanks } = useQuery<BankAccount[]>({
    queryKey: ['bankAccounts', selectedCompany?.id],
    queryFn: () => getBanksAccount(selectedCompany!.id),
    enabled: !!selectedCompany?.id,
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: false,
  });
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery<Supplier[]>({
     queryKey: ['suppliers'], 
     queryFn: getSuppliers,
     staleTime: 1000 * 60 * 5, // 5 minutos
     refetchOnWindowFocus: false,
     });

  const { data: paymentMethod = [], isLoading: isLoadingPaymentMethod } = useQuery<PaymentMethod[]>({
    queryKey: ['paymentMethod'],
    queryFn: getPaymentMethods,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  }); 

  const { mutate: uploadFileMutation, isPending: isUploading } = useMutation({
    mutationFn: uploadFile,
    onError: (error: Error) => toast.error(`Erro no upload: ${error.message}`),
  });

  const { mutate: createExpenseMutation, isPending: isCreating } = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      toast.success("Nova despesa registrada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsModalOpen(false);
    },
    onError: (error: Error) => toast.error(`Erro ao criar despesa: ${error.message}`),
  });

  const { mutate: updateExpenseMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateExpensePayload }) => updateExpense(id, payload),
    onSuccess: () => {
      toast.success("Despesa atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsModalOpen(false);
      setExpenseToEdit(null);
    },
    onError: (error: Error) => toast.error(`Erro ao atualizar despesa: ${error.message}`),
  });

  const { mutate: deleteExpenseMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      toast.success("Despesa excluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsAlertOpen(false);
      setExpenseToDelete(null);
    },
    onError: (error: Error) => toast.error(`Erro ao excluir despesa: ${error.message}`),
  });

  const handleFormSubmit = (data: z.infer<typeof expenseSchema>) => {
    const processSubmit = (filePathUrl?: string | null) => {
      const payload = {
        ...data,

        account_plan_id: data.account_plan_id as number,
        file_path: filePathUrl ?? (expenseToEdit?.file_path ?? ''),
      };

      if (expenseToEdit) {
        updateExpenseMutation({ id: expenseToEdit.id, payload: payload });
      } else {
        createExpenseMutation(payload);
      }
    };

    if (data.file_path instanceof File) {
      uploadFileMutation(data.file_path, {
        onSuccess: (uploadResponse) => {
          processSubmit(uploadResponse.url);
        },
      });
    } else {
      processSubmit(data.file_path);
    }
  };

  const handleOpenNewModal = () => {
    setExpenseToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (expense: Expense) => {
    const formattedExpense = {
      ...expense,
      expense_date: expense.expense_date ? format(new Date(expense.expense_date), "yyyy-MM-dd'T'HH:mm") : '',
    };
    setExpenseToEdit(formattedExpense as any);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setExpenseToDelete(id);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (expenseToDelete !== null) {
      deleteExpenseMutation(expenseToDelete);
    }
  };

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBankAccount = !bankAccountFilter || String(e.bank_account_id) === bankAccountFilter;
      const matchesPaymentMethod = !paymentMethodFilter || String(e.payment_method_id) === paymentMethodFilter;
      const matchesSupplier = !supplierFilter || String(e.supplier_id) === supplierFilter;
      return matchesSearch && matchesPaymentMethod && matchesBankAccount && matchesSupplier;
    });
  }, [expenses, searchTerm, bankAccountFilter, supplierFilter, paymentMethodFilter]);

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  const paginatedExpenses = useMemo(() => {
    return filteredExpenses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredExpenses, currentPage]);

  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);

  const formFields: FormFieldConfig<typeof expenseSchema>[] = [
    { name: 'description', label: 'Descrição', type: 'text', placeholder: 'Ex: Compra de material', gridCols: 2 },
    { name: 'amount', label: 'Valor', type: 'number', placeholder: '0,00', step: "0.01", gridCols: 1 },
    { name: 'expense_date', label: 'Data da Despesa', type: 'datetime-local', gridCols: 1 },
    {
      name: 'company_id',
      label: 'Empresa (CNPJ)',
      type: 'select',
      placeholder: 'Selecione uma empresa',
      options: companies.map(c => ({ value: c.id, label: `${c.corporate_name} (${c.cnpj})` })),
      gridCols: 1,
    },
    {
      name: 'supplier_id',
      label: 'Fornecedor',
      type: 'select',
      placeholder: 'Selecione um fornecedor',
      options: suppliers.map(s => ({ value: s.id, label: s.name })),
      gridCols: 1,
    },
    {
      name: 'account_plan_id',
      label: 'Plano de Contas',
      type: 'select',
      placeholder: 'Selecione um plano',
      options: [
        { value: 'null', label: 'Selecione um plano' },
        ...accountPlans.filter(p => p.type === 2 && p.parent_id != null).map(p => ({ value: p.id, label: `${p.name} (${p.id})` }))
      ],
      gridCols: 1,
    },
    {
      name: 'payment_method_id',
      label: 'Método de Pagamento',
      type: 'select',
      placeholder: 'Selecione um método',
      options: [
        { value: 'null', label: 'Selecione um método' },
        ...paymentMethod.map(p => ({ value: p.id, label: p.name }))
      ],
      gridCols: 1,
    },
    {
      name: 'bank_account_id',
      label: 'Conta Bancária (Origem do Pagamento)',
      type: 'select',
      placeholder: 'Selecione uma conta',
      options: bankAccounts.map(b => ({ value: b.id, label: b.bank_name + ' ( ' + formatBankAccount(b.account) + ' )' })),
      gridCols: 1,
    },
    { name: 'file_path', label: 'Anexo (NF, Comprovante)', type: 'file' ,accept:'.pdf,.png,.jpg,.jpeg', gridCols: 2 },
  ];

  const isLoading = isLoadingExpenses || isLoadingCompanies || isLoadingPlans || isLoadingPaymentMethod || isLoadingBanks || isLoadingSuppliers;
  if (isLoading) return <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Despesas</h1>
          <p className="text-muted-foreground">Gerencie as despesas e saídas financeiras</p>
        </div>
        <Button onClick={handleOpenNewModal}><Plus className="h-4 w-4 mr-2" /> Nova Despesa</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center"><Filter className="h-5 w-5 mr-2" /> Filtros</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <Label htmlFor="busca">Buscar por descrição</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="busca" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div>
              <Label htmlFor="supplierFilter">Fornecedor</Label>
              <Select onValueChange={(value) => setSupplierFilter(value === "all" ? "" : value)} value={supplierFilter || "all"}>
                <SelectTrigger><SelectValue placeholder="Todos os fornecedores" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os fornecedores</SelectItem>
                  {suppliers.map(s => (<SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bankAccountFilter">Conta</Label>
              <Select onValueChange={(value) => setBankAccountFilter(value === "all" ? "" : value)} value={bankAccountFilter || "all"}>
                <SelectTrigger><SelectValue placeholder="Todas as contas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as contas</SelectItem>
                  {bankAccounts.map(account => (
                    <SelectItem key={account.id} value={String(account.id)}>{account.bank_name} ({formatBankAccount(account.account)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentMethodFilter">Método de Pagamento</Label>
              <Select onValueChange={(value) => setPaymentMethodFilter(value === "all" ? "" : value)} value={paymentMethodFilter || "all"}>
                  <SelectTrigger><SelectValue placeholder="Todos os métodos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os métodos</SelectItem> 
                    {paymentMethod.map(method => (
                      <SelectItem key={method.id} value={String(method.id)}>{method.name}</SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Período</Label>
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onFilter={(start, end) => { setStartDate(start); setEndDate(end); }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lista de Despesas</CardTitle></CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border scrollbar-thumb-rounded-md hover:scrollbar-thumb-accent">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Plano de Contas</TableHead>
                <TableHead className="text-center">Conta</TableHead>
                <TableHead className="text-center">Forma de pagamento</TableHead>
                <TableHead className="text-center">Valor</TableHead>
                <TableHead className="text-center w-[100px]">Anexo</TableHead>
                <TableHead className="text-right w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDate(new Date(expense.expense_date))}</TableCell>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>{expense.supplier?.name || 'N/A'}</TableCell>
                  <TableCell>{expense.account_plan?.name || 'N/A'}</TableCell>
                  <TableCell className="text-center">{expense.bank?.bank_name + ' (' + formatBankAccount(expense?.bank?.account || '') + ')' || 'N/A'}</TableCell>
                  <TableCell className="text-center">{expense.payment_method?.name || 'N/A'}</TableCell>
                  <TableCell className="text-center font-medium text-red-600">{formatCurrency(Number(expense.amount))}</TableCell>
                  <TableCell className="text-center">
                    {expense.file_path ? (
                      <Button asChild variant="ghost" size="icon">
                        <a href={expense.file_path} target="_blank" rel="noopener noreferrer" download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(expense)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(expense.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <ShadcnTableFooter>
              <TableRow>
                <TableCell colSpan={5} className="font-bold text-right">Total</TableCell>
                <TableCell className="text-right font-bold text-red-600">{formatCurrency(totalExpenses)}</TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </ShadcnTableFooter>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            {filteredExpenses.length} registro(s) encontrado(s).
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
        onOpenChange={(isOpen) => { if (!isOpen) setExpenseToEdit(null); setIsModalOpen(isOpen); }}
        onSubmit={handleFormSubmit}
        isLoading={isCreating || isUpdating || isUploading}
        initialData={expenseToEdit}
        fields={formFields}
        schema={expenseSchema}
        title={expenseToEdit ? 'Editar Despesa' : 'Nova Despesa'}
        description="Preencha as informações abaixo para registrar a despesa financeira."
      />

      <DeleteConfirmationDialog
        isOpen={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        description="Essa ação não pode ser desfeita. Isso irá excluir permanentemente a despesa."
      />
    </div>
  );
}
