import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { IPaymentMethod } from '@/interfaces/finance/PaymentMethodInterface';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPaymentMethods } from '@/lib/services/finance/payment-methods.service';
import { getBanksAccount } from '@/lib/services/finance/banks.service'; 
import { getAccountPlans } from '@/lib/services/finance/account-plan.service';
import { IBankAccount } from '@/interfaces/finance/BankAccountInterface';
import { IEmployeePaymentSummary } from '@/interfaces/HR/EmployeeInterface';
import { formatCurrency, formatBankAccount, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IAccountPlan } from '@/interfaces/finance/AccountPlanInterface';

interface SettlePaymentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (data: { bankAccountId: number; accountPlanId: number; paymentMethodId: number; paidAt: string; referenceMonth: string }) => void;
  isLoading: boolean;
  employee?: IEmployeePaymentSummary;
  amount: number;
  companyId?: number;
  referenceMonth: string;
}


const settleSchema = z.object({
  bank_account_id: z.coerce.number().min(1, 'Selecione a conta de origem.'),
  paid_at: z.string().min(1, 'Informe a data do pagamento.'),
  account_plan_id: z.coerce.number().min(1, 'Selecione o plano de contas.'),
  payment_method_id: z.coerce.number().min(1, 'Selecione a forma de pagamento'),
  reference_month: z.string(),
});

type SettleFormData = z.infer<typeof settleSchema>;

export function SettlePaymentModal({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
  employee,
  amount,
  companyId,
  referenceMonth,
}: SettlePaymentModalProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);



  const form = useForm<SettleFormData>({
    resolver: zodResolver(settleSchema),
    defaultValues: {
      bank_account_id: undefined,
      account_plan_id: undefined,
      payment_method_id: undefined,
      reference_month: referenceMonth,
      paid_at: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        bank_account_id: undefined,
        account_plan_id: undefined,
        payment_method_id: undefined,
        reference_month: referenceMonth,
        paid_at: format(new Date(), 'yyyy-MM-dd'),
      });
      setSelectedAccountId(null);
      setSelectedPaymentMethodId(null);
    }
  }, [isOpen, form, referenceMonth]);

  const { data: bankAccounts = [], isLoading: isLoadingBanks } = useQuery({
    queryKey: ['bankAccounts', companyId],
    queryFn: () => getBanksAccount(companyId!),
    enabled: !!companyId && isOpen,
  });

  const { data: paymentMethod = [], isLoading: isLoadingPaymentMethod } = useQuery<IPaymentMethod[]>({
      queryKey: ['paymentMethod'],
      queryFn: getPaymentMethods,
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
    }); 

  const { data: accountPlans = [], isLoading: isLoadingPlans } = useQuery<IAccountPlan[]>({
    queryKey: ['accountPlans', 'expenses'],
    queryFn: () => getAccountPlans({ type: 2 }), // Filtra por despesas
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
  });

  const onSubmit = (data: SettleFormData) => {
    onConfirm({
      bankAccountId: data.bank_account_id,
      accountPlanId: data.account_plan_id,
      paymentMethodId: data.payment_method_id,
      paidAt: data.paid_at,
      referenceMonth: data.reference_month,
    });
  };

  return (
    <Form {...form}>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Fechar Folha de Pagamento</DialogTitle>
            <DialogDescription>
              Confirme a liquidação do saldo para <span className="font-bold">{employee ? employee.name : 'todos os colaboradores'}</span>.
            </DialogDescription>
          </DialogHeader>

          {employee && employee.advances_details && employee.advances_details.length > 0 && (
            <div className="my-4 rounded-lg border bg-card text-card-foreground shadow-sm ">
              <div className="p-4">
                <h4 className="font-semibold mb-2">Detalhes dos Adiantamentos</h4>
                <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border scrollbar-thumb-rounded-md hover:scrollbar-thumb-accent">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead className='text-center'>Descrição</TableHead>
                        <TableHead className="text-center">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.advances_details.map(detail => (
                        <TableRow key={detail.id}>
                          <TableCell>{formatDate(new Date(detail.date))}</TableCell>
                          <TableCell className='text-center'>{detail.description}</TableCell>
                          <TableCell className="text-center">{formatCurrency(detail.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...form.register('reference_month')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="bank_account_id" render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="bank-account">Conta de Origem</FormLabel>
                  {isLoadingBanks ? <Skeleton className="h-10 w-full" /> : (
                    <Select onValueChange={(value) => { field.onChange(Number(value)); setSelectedAccountId(Number(value)); }} value={String(field.value || '')}>
                      <FormControl><SelectTrigger id="bank-account"><SelectValue placeholder="Selecione a conta..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {bankAccounts.map((account: IBankAccount) => (
                          <SelectItem key={account.id} value={String(account.id)}>{account.bank_name} - {formatBankAccount(account.account)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="payment_method_id" render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="payment_method">Forma de pagamento</FormLabel>
                  {isLoadingPaymentMethod ? <Skeleton className="h-10 w-full" /> : (
                    <Select onValueChange={(value) => { field.onChange(Number(value)); setSelectedPaymentMethodId(Number(value)); }} value={String(field.value || '')}>
                      <FormControl><SelectTrigger id="payment_method"><SelectValue placeholder="Selecione a forma..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {paymentMethod.map((method: IPaymentMethod) => (
                          <SelectItem key={method.id} value={String(method.id)}>{method.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="account_plan_id" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="account-plan">Plano de Contas para Salário</FormLabel>
                {isLoadingPlans ? <Skeleton className="h-10 w-full" /> : (
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value || '')}>
                    <FormControl><SelectTrigger id="account-plan"><SelectValue placeholder="Selecione o plano de contas..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      {accountPlans.map((plan) => (
                        <SelectItem key={plan.id} value={String(plan.id)}>{plan.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="paid_at" render={({ field }) => (
              <FormItem>
                <FormLabel>Data do Pagamento</FormLabel>
                <FormControl><Input type="datetime-local" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            </div>
            <div className="flex justify-between items-center border-t pt-4 mt-4">
              <span className="text-lg font-bold">Saldo Final a Pagar:</span>
              <span className="text-lg font-bold text-green-600">{formatCurrency(amount)}</span>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} type="button">Cancelar</Button>
              <Button type="submit" disabled={!selectedAccountId || isLoading || !selectedPaymentMethodId}>
                {isLoading ? 'Liquidando...' : 'Confirmar Pagamento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  );
}