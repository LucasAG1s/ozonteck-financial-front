import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { updateSupplierBank } from '@/lib/services/finance/suppliers.service';
import { ISupplierBank } from '@/interfaces/finance/SuppliersInterface';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBanks } from '@/lib/services/universal/banks.service';
import { Skeleton } from '@/components/ui/skeleton';

const bankSchema = z.object({
  bank_id: z.coerce.number({ invalid_type_error: 'Banco é obrigatório.' }).min(1, 'Banco é obrigatório.'),
  agency: z.coerce.number({ invalid_type_error: 'Número da agência é obrigatório.' }).min(1, 'Número da agência é obrigatório.'),
  account: z.coerce.number({ invalid_type_error: 'Número da conta é obrigatório.' }).min(1, 'Número da conta é obrigatório.'),
  account_type: z.string().min(1, 'Tipo de conta é obrigatório.'),
  pix_key: z.string().nullable().optional(),
});

type BankFormData = z.infer<typeof bankSchema>;

interface SupplierBankFormProps {
  bank: ISupplierBank;
}

export function SupplierBankForm({ bank }: SupplierBankFormProps) {
  const queryClient = useQueryClient();
  const { data: bankOptions = [], isLoading: isLoadingBanks } = useBanks();

  const form = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bank_id: bank?.bank_id || undefined,
      agency: bank?.agency || undefined,
      account: bank?.account || undefined,
      account_type: bank?.account_type || '',
      pix_key: bank?.pix_key ||  null || undefined,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: BankFormData) => updateSupplierBank(bank.id, data),
    onSuccess: () => {
      toast.success('Dados bancários atualizados com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['supplier', String(bank.supplier_id)] });
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
            {isLoadingBanks ? <Skeleton className="h-10 w-full" /> : (
              <FormField control={form.control} name="bank_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value || '')}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione o banco" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {bankOptions.map((bankOption) => (
                        <SelectItem key={bankOption.id} value={String(bankOption.id)}>{bankOption.code} - {bankOption.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            <FormField control={form.control} name="agency" render={({ field }) => (<FormItem><FormLabel>Número da Agência</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="account" render={({ field }) => (<FormItem><FormLabel>Número da Conta</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="account_type" render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Conta</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
                  <SelectContent><SelectItem value="Corrente">Corrente</SelectItem><SelectItem value="Poupança">Poupança</SelectItem></SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="pix_key" render={({ field }) => (<FormItem><FormLabel>Chave PIX</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
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
