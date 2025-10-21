import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { updateEmployeeBank } from '@/lib/services/hr/employees.service';
import { IEmployee as Employee, IEmployeeBank as EmployeeBankType} from '@/interfaces/HR/EmployeeInterface';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBanks } from '@/lib/services/universal/banks.service';
import { Skeleton } from '@/components/ui/skeleton';

const bankSchema = z.object({
  bank_id: z.coerce.number({ invalid_type_error: 'Banco é obrigatório.' }).min(1, 'Banco é obrigatório.'), 
  agency: z.coerce.number({ invalid_type_error: 'Número da agência é obrigatório.' }).min(1, 'Número da agência é obrigatório.'),
  account_number: z.coerce.number({ invalid_type_error: 'Número da conta é obrigatório.' }).min(1, 'Número da conta é obrigatório.'),
  account_type: z.string().min(1, 'Tipo de conta é obrigatório.'),
  pix_key: z.string().min(5, 'Chave PIX deve ter pelo menos 5 caracteres.'),
});

type BankFormData = z.infer<typeof bankSchema>;

interface EmployeeBankFormProps {
  bank: EmployeeBankType;
}

export function EmployeeBankForm({ bank }: EmployeeBankFormProps) {
  const queryClient = useQueryClient();
  const { data: bankOptions = [], isLoading: isLoadingBanks } = useBanks();

  const form = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bank_id: bank?.bank_id || undefined,
      agency: bank?.agency_number || undefined,
      account_number: bank?.account_number || undefined,
      account_type: bank?.account_type || '',
      pix_key: bank?.pix_key || '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: BankFormData) => updateEmployeeBank(bank.id, data),
    onSuccess: (updatedBank) => {
      toast.success('Dados bancários atualizados com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['employee', String(bank.employee_id)] });
      queryClient.setQueryData(['employee', String(bank.employee_id)], (oldData: Employee | undefined) => {
        if (oldData) {
          return { ...oldData, bank: updatedBank };
        }
        return oldData;
      });
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar dados bancários: ${error.message}`);
    },
  });

  const onSubmit = (data: BankFormData) => {
    mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Dados Bancários</CardTitle>
            <CardDescription>Informações da conta bancária para pagamentos.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            {isLoadingBanks ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <FormField control={form.control} name="bank_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value || '')}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o banco" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bankOptions.map((bankOption) => (
                        <SelectItem key={bankOption.id} value={String(bankOption.id)}>
                          {bankOption.code} - {bankOption.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            <FormField
              control={form.control}
              name="agency_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número da Agência</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número da Conta</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_type"
              render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Conta</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Corrente">Corrente</SelectItem>
                    <SelectItem value="Poupança">Poupança</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
            />
            <FormField
              control={form.control}
              name="pix_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave PIX</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}