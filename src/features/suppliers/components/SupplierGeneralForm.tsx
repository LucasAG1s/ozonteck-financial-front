import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {updateSupplier } from '@/lib/services/finance/suppliers.service';
import { ISupplierEdit } from '@/interfaces/finance/SuppliersInterface';

const generalSchema = z.object({
  fantasy_name: z.string().min(3, 'O Nome Fantasia é obrigatório.'),
  company_name: z.string().min(3, 'A Razão Social é obrigatória.'),
  document: z.string().min(11, 'O CNPJ é obrigatório.'),
  email: z.string().email('O e-mail é inválido.'),
  phone: z.string().min(10, 'O telefone é obrigatório.'),
  active: z.coerce.boolean().default(true),
});

type GeneralFormData = z.infer<typeof generalSchema>;

interface SupplierGeneralFormProps {
  supplier: ISupplierEdit;
}

export function SupplierGeneralForm({ supplier }: SupplierGeneralFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<GeneralFormData>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      fantasy_name: supplier.fantasy_name || '',
      company_name: supplier.company_name || '',
      document: supplier.document || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      active: !!supplier.active,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: GeneralFormData) => {
      const payload = { ...data, active: data.active ? 1 : 0 };
      return updateSupplier(supplier.id, payload);
    },
    onSuccess: () => {
      toast.success('Dados gerais atualizados com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['supplier', String(supplier.id)] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const onSubmit = (data: GeneralFormData) => {
    mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Dados Gerais</CardTitle>
            <CardDescription>Informações principais do fornecedor.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField control={form.control} name="fantasy_name" render={({ field }) => (<FormItem><FormLabel>Nome Fantasia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="company_name" render={({ field }) => (<FormItem><FormLabel>Razão Social</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="document" render={({ field }) => (<FormItem><FormLabel>CNPJ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="active" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="true">Ativo</SelectItem><SelectItem value="false">Inativo</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
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
