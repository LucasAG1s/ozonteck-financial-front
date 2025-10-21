import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Keep this import
import { updateSupplierData } from '@/lib/services/finance/suppliers.service';
import { ISupplierData } from '@/interfaces/finance/SuppliersInterface';

const taxRegimeOptions = [
  { value: 'SN', label: 'Simples Nacional' },
  { value: 'LP', label: 'Lucro Presumido' },
  { value: 'LR', label: 'Lucro Real' },
  { value: 'ME', label: 'Microempresa' },
  { value: 'LA', label: 'Lucro Arbitrado' },
  { value: 'MEI', label: 'Microempreendedor Individual' },
];

const crtCodeOptions = [
  { value: '1', label: '1 - Simples Nacional' },
  { value: '2', label: '2 - Simples Nacional – excesso de sublimite de receita bruta' },
  { value: '3', label: '3 - Regime Normal' },
  { value: '4', label: '4 - Simples Nacional – Microempreendedor Individual (MEI)' },
];

const dataSchema = z.object({
  state_registration: z.coerce.number().nullable().optional(),
  municipal_registration: z.coerce.number().nullable().optional(),
  tax_regime: z.enum(['SN', 'LP', 'LR', 'ME', 'LA', 'MEI']).nullable().optional(),
  crt_code: z.enum(['1', '2', '3', '4']).nullable().optional(),
});

type DataFormData = z.infer<typeof dataSchema>;

interface SupplierDataFormProps {
  data: ISupplierData;
}

export function SupplierDataForm({ data }: SupplierDataFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<DataFormData>({
    resolver: zodResolver(dataSchema),
    defaultValues: {
      state_registration: data?.state_registration ?? undefined,
      municipal_registration: data?.municipal_registration ?? undefined,
      tax_regime: data?.tax_regime || '',
      crt_code: data?.crt_code || '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: DataFormData) => updateSupplierData(data.id, formData),
    onSuccess: () => {
      toast.success('Dados fiscais atualizados com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['supplier', String(data.supplier_id)] });
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const onSubmit = (formData: DataFormData) => {
    mutate(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Dados Fiscais</CardTitle>
            <CardDescription>Informações fiscais e de registro do fornecedor.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField control={form.control} name="state_registration" render={({ field }) => (<FormItem><FormLabel>Inscrição Estadual</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="municipal_registration" render={({ field }) => (<FormItem><FormLabel>Inscrição Municipal</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            <FormField
              control={form.control}
              name="tax_regime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Regime Tributário</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione o regime" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {taxRegimeOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="crt_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Regime Tributário (CRT)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione o código" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {crtCodeOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
