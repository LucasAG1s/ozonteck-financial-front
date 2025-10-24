import { z } from 'zod'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { GenericForm, FormFieldConfig } from '@/components/forms/GenericForm'
import { IEmployeePaymentSummary } from '@/interfaces/HR/EmployeeInterface'
import { CreateEmployeePaymentPayload } from '@/lib/services/hr/employees.service'
import { useCompanies } from '@/hooks/useCompanies'
import { getBanksAccount } from '@/lib/services/finance/banks.service'
import { IBankAccount } from '@/interfaces/finance/BankAccountInterface'
import { IPaymentMethod } from '@/interfaces/finance/PaymentMethodInterface'
import { getPaymentMethods } from '@/lib/services/finance/payment-methods.service'
import { getAccountPlans } from '@/lib/services/finance/account-plan.service'
import { IAccountPlan } from '@/interfaces/finance/AccountPlanInterface'
import { formatBankAccount } from '@/lib/utils'


interface RegisterPaymentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (payload: CreateEmployeePaymentPayload) => void;
  isLoading: boolean;
  employee?: IEmployeePaymentSummary;
  referenceMonth: string;
}

const paymentSchema = z.object({
  type: z.enum(['salario', '13o', 'adiantamento', 'outro','ferias']),
  amount: z.coerce.number().positive('O valor deve ser maior que zero.'),
  reference_month: z.string().min(1, 'O mês de referência é obrigatório.'),
  paid_at: z.string().min(1, 'A data de pagamento é obrigatória.'),
  description: z.string().nullable(),
  account_plan_id: z.coerce.number().min(1, 'O plano de contas é obrigatório.'),
  bank_account_id: z.coerce.number().min(1, 'A conta de origem é obrigatória.'),
  payment_method_id:z.coerce.number().min(1, 'O método de pagamento é obrigatório.')
});

const paymentTypeOptions = [
  { value: 'salario', label: 'Salário' },
  {value:'ferias', label: 'Férias'},
  { value: '13o', label: '13° Salário' },
  { value: 'adiantamento', label: 'Adiantamento' },
  { value: 'outro', label: 'Outro' },
];

export function RegisterPaymentModal({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading,
  employee,
  referenceMonth,
}: RegisterPaymentModalProps) {
  if (!employee) return null;

  const { selectedCompany } = useCompanies();
  const { data: bankAccounts = [], isLoading: isLoadingBanks } = useQuery({
    queryKey: ['bankAccounts', selectedCompany?.id],
    queryFn: () => getBanksAccount(selectedCompany!.id),
    enabled: !!selectedCompany && isOpen,
  });

  const { data: accountPlans = [], isLoading: isLoadingPlans } = useQuery<IAccountPlan[]>({
    queryKey: ['accountPlans', 'expenses'],
    queryFn: () => getAccountPlans({ type: 2 }), 
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
  });

  const { data: paymentMethod = [], isLoading: isLoadingPaymentMethod } = useQuery<IPaymentMethod[]>({
    queryKey: ['paymentMethod'],
    queryFn: getPaymentMethods,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  }); 


  const handleFormSubmit = (data: z.infer<typeof paymentSchema>) => {
    const payload: CreateEmployeePaymentPayload = {
      ...data,
      employee_id: employee.employee_id,
      company_id: selectedCompany!.id,
      amount: String(data.amount),
    };
    onSubmit(payload);
  };

  const formFields: FormFieldConfig<typeof paymentSchema>[] = [
    { name: 'type', label: 'Tipo de Pagamento', type: 'select', options: paymentTypeOptions, gridCols: 1 },
    { name: 'amount', label: 'Valor', type: 'number', placeholder: '0.00', step: '0.01', gridCols: 1 },
    { name: 'paid_at', label: 'Data do Pagamento', type: 'datetime-local', gridCols: 1 },
    { name: 'reference_month', label: 'Mês de Referência', type: 'month', gridCols: 1 },
    { 
      name: 'bank_account_id', 
      label: 'Conta de Origem', 
      type: 'select', 
      options: bankAccounts.map((acc: IBankAccount) => ({ value: acc.id, label: `${acc.bank_name} - ${formatBankAccount(acc.account)}` })),
      placeholder: isLoadingBanks ? 'Carregando...' : 'Selecione a conta de origem',
      disabled: isLoadingBanks,
      gridCols: 1},
    {
      name: 'payment_method_id',
      label: 'Forma de Pagamento',
      type: 'select',
      options: paymentMethod.map((method: IPaymentMethod) => ({ value: method.id, label: method.name })),
      placeholder: isLoadingPaymentMethod ? 'Carregando...' : 'Selecione a forma de pagamento',
      disabled: isLoadingPaymentMethod,
      gridCols: 1,
    },
    { 
      name: 'account_plan_id', 
      label: 'Plano de Contas', 
      type: 'select', 
      options: accountPlans.map((plan) => ({ value: plan.id, label: plan.name })),
      placeholder: isLoadingPlans ? 'Carregando...' : 'Selecione o plano de contas',
      disabled: isLoadingPlans,
      gridCols: 2 },
    { name: 'description', label: 'Descrição (Opcional)', type: 'textarea', placeholder: 'Detalhes do pagamento...', gridCols: 2 },
  ];

  return (
    <GenericForm
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      initialData={{
        type: 'adiantamento',
        paid_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        reference_month: referenceMonth,
      }}
      fields={formFields}
      schema={paymentSchema}
      title={`Registrar Pagamento para ${employee.name}`}
      description="Preencha as informações para registrar um novo pagamento ou adiantamento."
    />
  );
}