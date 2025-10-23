import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, startOfMonth } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Search, DollarSign, Users, WalletCards, TrendingDown, CreditCard, Loader2, MoreHorizontal } from 'lucide-react' 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency } from '@/lib/utils'
import { toast } from 'react-toastify'
import { getPaymentsData, settleEmployeePayment, settleAllEmployeePayments, createEmployeePayment, CreateEmployeePaymentPayload } from '@/lib/services/hr/employees.service'
import { IEmployeePaymentSummary } from '@/interfaces/HR/EmployeeInterface'
import { useCompanies } from '@/hooks/useCompanies'
import { ISettlePaymentPayload, ISettleAllPaymentsPayload } from '@/interfaces/HR/EmployeeInterface'
import { SettlePaymentModal } from './components/SettlePaymentModal'
import { RegisterPaymentModal } from './components/RegisterPaymentModal'

type SettleModalState = {
  isOpen: boolean;
  employee?: IEmployeePaymentSummary;
  isGlobal: boolean;
};

type RegisterPaymentModalState = {
  isOpen: boolean;
  employee?: IEmployeePaymentSummary;
};

const parseCurrency = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    const cleanValue = value.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
};

const getBalanceDueAmount = (payment: IEmployeePaymentSummary) => {
    return parseCurrency(payment.balance_due);
}

export function PaymentsEmployees() {
  const queryClient = useQueryClient();
  const { selectedCompany } = useCompanies();
  const [referenceMonth, setReferenceMonth] = useState(format(startOfMonth(new Date()), 'yyyy-MM'));
  const [searchTerm, setSearchTerm] = useState('');
  const [settleModal, setSettleModal] = useState<SettleModalState>({ isOpen: false, isGlobal: false });
  const [registerPaymentModal, setRegisterPaymentModal] = useState<RegisterPaymentModalState>({ isOpen: false });

  const { data: paymentsData = [], isLoading } = useQuery<IEmployeePaymentSummary[]>({
    queryKey: ['employeePayments', selectedCompany?.id, referenceMonth],
    queryFn: () => getPaymentsData(selectedCompany!.id, referenceMonth),
    enabled: !!selectedCompany,
  });

  const { mutate: settlePaymentMutation, isPending: isSettling } = useMutation({
    mutationFn: (payload: { employeeId: number } & ISettlePaymentPayload) => 
      settleEmployeePayment(payload.employeeId, payload),
    onSuccess: () => {
      toast.success("Pagamento do colaborador liquidado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['employeePayments', selectedCompany?.id, referenceMonth] });
      setSettleModal({ isOpen: false, isGlobal: false });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const { mutate: settleAllPaymentsMutation, isPending: isSettlingAll } = useMutation({
    mutationFn: (payload: Omit<ISettleAllPaymentsPayload, 'company_id'>) => 
      settleAllEmployeePayments({ ...payload, company_id: selectedCompany!.id }),
    onSuccess: () => {
      toast.success("Todos os pagamentos foram liquidados com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['employeePayments', selectedCompany?.id, referenceMonth] });
      setSettleModal({ isOpen: false, isGlobal: false });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const { mutate: createPaymentMutation, isPending: isCreatingPayment } = useMutation({
    mutationFn: createEmployeePayment,
    onSuccess: () => {
      toast.success("Pagamento registrado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['employeePayments', selectedCompany?.id, referenceMonth] });
      setRegisterPaymentModal({ isOpen: false });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const filteredPayments = useMemo(() => 
    paymentsData.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [paymentsData, searchTerm]
  );

  const totalSalary = filteredPayments.reduce((sum, p) => sum + parseCurrency(p.salary), 0);
  const totalAdvanced = filteredPayments.reduce((sum, p) => sum + parseCurrency(p.total_advanced), 0);
  const totalBalanceDue = filteredPayments.reduce((sum, p) => sum + parseCurrency(p.balance_due), 0);
  
  const paymentsToSettleCount = filteredPayments.filter(p => getBalanceDueAmount(p) > 0).length;

  const handleSettleConfirm = (data: { bankAccountId: number; accountPlanId: number; paymentMethodId: number; paidAt: string; referenceMonth: string; }) => {
    if (settleModal.isGlobal) {
      settleAllPaymentsMutation({ 
        bank_account_id: data.bankAccountId, 
        account_plan_id: data.accountPlanId, 
        payment_method_id: data.paymentMethodId,
        paid_at: data.paidAt,
        reference_month: data.referenceMonth,
      });
    } else if (settleModal.employee) {
      settlePaymentMutation({ 
        employeeId: settleModal.employee.employee_id, 
        bank_account_id: data.bankAccountId, 
        account_plan_id: data.accountPlanId, 
        payment_method_id: data.paymentMethodId,
        company_id: selectedCompany!.id,
        paid_at: data.paidAt,
        reference_month: data.referenceMonth,
      });
    }
  };

  const handleRegisterPaymentSubmit = (payload: CreateEmployeePaymentPayload) => {
    createPaymentMutation(payload);
  };

  const openSettleModal = (payment: IEmployeePaymentSummary) => {
    const balance = getBalanceDueAmount(payment);
    if (balance > 0) {
        setSettleModal({ isOpen: true, employee: payment, isGlobal: false });
    } else {
        toast.info("Este colaborador já teve o saldo liquidado ou não tem valor a pagar.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Folha de Pagamento</h1>
          <p className="text-muted-foreground">Gerencie os pagamentos dos colaboradores para o mês de referência.</p>
        </div>
        <Button 
            onClick={() => setSettleModal({ isOpen: true, isGlobal: true })} 
            disabled={totalBalanceDue <= 0 || isSettlingAll || isLoading}
        >
          <WalletCards className="h-4 w-4 mr-2" />
          {isSettlingAll ? 'Liquidando Todos...' : `Fechar Folha (${paymentsToSettleCount})`}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Colaboradores</p>
                <p className="text-2xl font-bold text-blue-600">{paymentsData.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Salário Bruto (Provisionado)</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalSalary)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Adiantado</p>
                <p className="text-2xl font-bold text-orange-500">{formatCurrency(totalAdvanced)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Pendente (A Pagar)</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalBalanceDue)}</p>
                <p className="text-xs text-muted-foreground">{paymentsToSettleCount} pagamento(s) pendente(s)</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-end">
            <CardTitle>Colaboradores</CardTitle>
            <div className="flex items-end gap-4">
              <div className="w-50 text-white">
                <Label htmlFor="reference-month">Mês de Referência</Label>
                <Input
                  id="reference-month"
                  type="month"
                  value={referenceMonth}
                  onChange={(e) => setReferenceMonth(e.target.value)}
                />
              </div>
              <div className="w-80">
                <Label htmlFor="search">Buscar Colaborador</Label>
                <div className="relative">
                  <Search className="absolute right-2 top-3 h-4 w-4 text-muted-foreground " />
                  <Input
                    id="search"
                    placeholder="Nome do colaborador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            {isLoading && (
                 <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <span className="ml-3 text-lg text-muted-foreground">Carregando folha...</span>
                </div>
            )}
            {!isLoading && (
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Colaborador</TableHead>
                            <TableHead>Salário Bruto</TableHead>
                            <TableHead>Adiantamentos</TableHead>
                            <TableHead>Banco</TableHead>
                            <TableHead className="text-right">Saldo a Pagar</TableHead>
                            <TableHead className="text-right w-[150px]">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPayments.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum pagamento encontrado para este período.</TableCell></TableRow>
                        ) : (
                            filteredPayments.map((payment) => {
                                const balance = getBalanceDueAmount(payment);
                                
                                return (
                                    <TableRow key={payment.employee_id}>
                                        <TableCell className="font-medium">{payment.name}</TableCell>
                                        <TableCell>{formatCurrency(parseCurrency(payment.salary))}</TableCell>
                                        <TableCell className="text-orange-500">{formatCurrency(parseCurrency(payment.total_advanced))}</TableCell>
                                        <TableCell>{payment.bank_name || 'Não Informado'}</TableCell>
                                        <TableCell className={`text-right font-bold ${balance > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                            {formatCurrency(balance)}
                                        </TableCell>
                                        <TableCell className="text-right w-[50px]">
                                            <DropdownMenu modal={false}>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setRegisterPaymentModal({ isOpen: true, employee: payment })}>
                                                        Registrar Pagamento
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => openSettleModal(payment)}
                                                        disabled={balance <= 0 || isSettling || isSettlingAll}
                                                    >
                                                        Fechar Folha
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
            )}
        </CardContent>
      </Card>

      <SettlePaymentModal
        isOpen={settleModal.isOpen}
        onOpenChange={(isOpen) => setSettleModal({ ...settleModal, isOpen })}
        onConfirm={handleSettleConfirm}
        isLoading={isSettling || isSettlingAll}
        employee={settleModal.employee}
        amount={settleModal.isGlobal ? totalBalanceDue : getBalanceDueAmount(settleModal.employee || {} as IEmployeePaymentSummary)}
        companyId={selectedCompany?.id}
        referenceMonth={referenceMonth}
      />

      <RegisterPaymentModal
        isOpen={registerPaymentModal.isOpen}
        onOpenChange={(isOpen) => setRegisterPaymentModal({ ...registerPaymentModal, isOpen })}
        onSubmit={handleRegisterPaymentSubmit}
        isLoading={isCreatingPayment}
        employee={registerPaymentModal.employee}
      />
    </div>
  )
}