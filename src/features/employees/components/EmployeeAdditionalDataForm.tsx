import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Keep Input
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EmployeeData, updateEmployeeData } from '@/lib/services/hr/employees.service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const additionalDataSchema = z.object({
  document_number: z.string().min(11, 'O CPF deve ter 11 dígitos.'),
  birth_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Data de nascimento inválida.' }),
  marital_status: z.string().min(1, 'Estado civil é obrigatório.'),
  gender: z.string().min(1, 'Gênero é obrigatório.'),
});

type AdditionalDataFormData = z.infer<typeof additionalDataSchema>;

interface EmployeeAdditionalDataFormProps {
  data: EmployeeData;
}

export function EmployeeAdditionalDataForm({ data }: EmployeeAdditionalDataFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<AdditionalDataFormData>({
    resolver: zodResolver(additionalDataSchema),
    defaultValues: {
      document_number: data?.document_number || '',
      birth_date: data?.birth_date || '',
      marital_status: data?.marital_status || '',
      gender: data?.gender || '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: AdditionalDataFormData) => updateEmployeeData(data.employee_id, formData),
    onSuccess: () => {
      toast.success('Dados adicionais atualizados com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['employee', String(data.employee_id)] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const onSubmit = (data: AdditionalDataFormData) => {
    mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Dados Adicionais</CardTitle>
            <CardDescription>Informações pessoais e documentação do colaborador.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="document_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="marital_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado Civil</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                      <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                      <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                      <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Feminino">Feminino</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
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