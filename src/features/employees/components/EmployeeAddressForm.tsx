import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Employee, updateEmployeeAddress, EmployeeAddress as EmployeeAddressType } from '@/lib/services/hr/employees.service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Keep Select components
import { useAddressData, ICity, IState, ICountry } from '@/lib/services/universal/address_data.service';
import { Skeleton } from '@/components/ui/skeleton';
import { getAddressByCEP } from '@/lib/services/universal/viacep.service';

const addressSchema = z.object({
  address_line: z.string().min(3, 'O endereço deve ter pelo menos 3 caracteres.'),
  complement: z.string().nullable().optional(),
  neighborhood: z.string().min(3, 'O bairro deve ter pelo menos 3 caracteres.'),
  number: z.string().min(1, 'O número é obrigatório.'),
  zip_code: z.string().min(8, 'O CEP deve ter 8 dígitos.').max(9, 'O CEP deve ter no máximo 9 dígitos.'), // Assumindo formato 00000-000 ou 00000000
  city_id: z.coerce.number({ invalid_type_error: 'Cidade é obrigatória.' }).min(1, 'Cidade é obrigatória.'),
  state_id: z.coerce.number({ invalid_type_error: 'Estado é obrigatório.' }).min(1, 'O estado é obrigatório.'),
  country_id: z.coerce.number({ invalid_type_error: 'País é obrigatório.' }).min(1, 'País é obrigatório.'),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface EmployeeAddressFormProps {
  address: EmployeeAddressType;
}

export function EmployeeAddressForm({ address }: EmployeeAddressFormProps) {
  const queryClient = useQueryClient();
  const { data: addressData, isLoading: isLoadingAddressData } = useAddressData(); 

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address_line: address?.address_line || '',
      complement: address?.complement || null,
      neighborhood: address?.neighborhood || '',
      number: address?.number || '',
      zip_code: address?.zip_code || '',
      city_id: address?.city_id || undefined,
      state_id: address?.state_id || undefined,
      country_id: address?.country_id || undefined,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AddressFormData) => updateEmployeeAddress(address.id, data),
    onSuccess: (updatedAddress) => { 
      toast.success('Endereço atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['employee', String(address.employee_id)] });
      queryClient.setQueryData(['employee', String(address.employee_id)], (oldData: Employee | undefined) => {
        if (oldData) {
          return { ...oldData, address: updatedAddress };
        }
        return oldData;
      });
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar endereço: ${error.message}`);
    },
  });

  const { mutate: searchCep, isPending: isSearchingCep } = useMutation({
    mutationFn: getAddressByCEP,
    onSuccess: (data) => {
      const state = addressData?.states.find((s: IState) => s.uf === data.uf);
      if (state) {
        form.setValue('state_id', state.id, { shouldValidate: true });
        
        const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
        const city = addressData?.cities.find((c: ICity) => 
          c.state_id === state.id && normalize(c.name) === normalize(data.localidade)
        );
        if (city) {
          form.setValue('city_id', city.id, { shouldValidate: true });
        }
      }

      form.setValue('address_line', data.logradouro, { shouldValidate: true });
      form.setValue('neighborhood', data.bairro, { shouldValidate: true });
      toast.success('Endereço preenchido automaticamente!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleCepBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const cep = event.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      searchCep(cep);
    }
  };

  const onSubmit = (data: AddressFormData) => {
    mutate(data);
  };

  if (isLoadingAddressData) {
    return <Skeleton className="h-64 w-full" />;
  }

  const states = addressData?.states || [];
  const allCities = addressData?.cities || []; 
  const countries = addressData?.countries || [];

  const selectedStateId = form.watch('state_id');
  const filteredCities = allCities.filter((city: ICity) => city.state_id === selectedStateId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>Informações de localização do colaborador.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField 
              control={form.control} 
              name="zip_code" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input {...field} onBlur={handleCepBlur} maxLength={9} />
                    </FormControl>
                    {isSearchingCep && <Loader2 className="absolute right-2 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
            <FormField control={form.control} name="address_line" render={({ field }) => (<FormItem><FormLabel>Endereço</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="number" render={({ field }) => (<FormItem><FormLabel>Número</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="complement" render={({ field }) => (<FormItem><FormLabel>Complemento</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="neighborhood" render={({ field }) => (<FormItem><FormLabel>Bairro</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />

            <FormField control={form.control} name="country_id" render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value || '')}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o país" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country: ICountry) => (
                      <SelectItem key={country.id} value={String(country.id)}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="state_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={(value) => {
                  field.onChange(Number(value));
                  form.setValue('city_id', undefined, { shouldValidate: true }); // Reseta a cidade quando o estado muda
                }} value={String(field.value || '')}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {states.map((state: IState) => (
                      <SelectItem key={state.id} value={String(state.id)}>
                        {state.uf} - {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="city_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value || '')} disabled={!selectedStateId}>
                  <FormControl> 
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredCities.map((city: ICity) => (
                      <SelectItem key={city.id} value={String(city.id)}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

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