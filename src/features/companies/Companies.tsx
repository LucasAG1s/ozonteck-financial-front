import { useState, useEffect } from 'react'
import { z } from 'zod';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  AlertDialog,
   AlertDialogAction,
    AlertDialogCancel,
     AlertDialogContent,
      AlertDialogDescription,
       AlertDialogFooter,
        AlertDialogHeader,
         AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react'
import { formatCNPJ } from '@/lib/utils'
import { toast } from 'react-toastify'
import { getCompanies, createCompany, updateCompany, deleteCompany, NewCompanyPayload, UpdateCompanyPayload } from '@/lib/services/finance/company.service'
import { ICompany as Company} from '@/interfaces/universal/CompanyInterface'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Skeleton } from "@/components/ui/skeleton"
import { GenericForm, FormFieldConfig } from '@/components/forms/GenericForm'
import { useAddressData, ICity, IState, ICountry } from '@/lib/services/universal/address_data.service';
import { getAddressByCEP } from '@/lib/services/universal/viacep.service';

const companySchema = z.object({
  corporate_name: z.string().min(3, 'A razão social é obrigatória.'),
  cnpj: z.string().length(14, 'O CNPJ deve ter 14 dígitos.'),
  trade_name: z.string().min(1, 'A abreviação é obrigatória.'),
  email: z.string().email('Formato de e-mail inválido.').optional().nullable(),
  phone_number: z.string().optional().nullable(),
  zipcode: z.string().optional().nullable(),
  address_line: z.string().optional().nullable(),
  complement: z.string().optional().nullable(),
  type: z.enum(['matriz', 'filial']),
  country_id: z.coerce.number().optional().nullable(),
  state_id: z.coerce.number().optional().nullable(),
  city_id: z.coerce.number().optional().nullable(),
});

export function Companies() {
  const queryClient = useQueryClient();

  const { data: empresas = [], isLoading, isError } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: getCompanies,
    staleTime: 30000,
  });

  const { mutate: createCompanyMutation, isPending: isCreating } = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      toast.success("Nova empresa cadastrada com sucesso.");
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setModalAberto(false);
    },
    onError: (error) => {
      toast.error(`Erro ao cadastrar empresa: ${error.message}`);
    }
  });

  const { mutate: updateCompanyMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateCompany,
    onSuccess: () => {
      toast.success("Dados da empresa atualizados com sucesso.");
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setModalAberto(false);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar empresa: ${error.message}`);
    }
  });

  const { mutate: deleteCompanyMutation } = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      toast.success("A empresa foi removida com sucesso.");
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error) => {
      toast.error(`${error.message}`);
    }
  });

  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<Company | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<number | null>(null);

  const empresasFiltradas = empresas.filter(empresa =>
    empresa.corporate_name.toLowerCase().includes(busca.toLowerCase()) ||
    empresa.cnpj.includes(busca) ||
    (empresa.trade_name && empresa.trade_name.toLowerCase().includes(busca.toLowerCase()))
  );

  const handleSubmit = (data: z.infer<typeof companySchema>) => {
    if (empresaEditando) {
      updateCompanyMutation({ id: empresaEditando.id, payload: data as UpdateCompanyPayload });
    } else {
      createCompanyMutation(data as NewCompanyPayload);
    }
  };

  const handleEdit = (empresa: Company) => {
    setEmpresaEditando(empresa);
    setModalAberto(true);
  };
  
  const openNewModal = () => {
    setEmpresaEditando(null);
    setModalAberto(true);
  };
  
  const handleDeleteClick = (id: number) => {
    setCompanyToDelete(id);
    setIsAlertOpen(true);
  };
  
  const confirmDelete = () => {
    if (companyToDelete !== null) {
      deleteCompanyMutation(companyToDelete);
      setIsAlertOpen(false);
      setCompanyToDelete(null);
    }
  };

  const { data: addressData, isLoading: isLoadingAddressData } = useAddressData();

  const { mutate: searchCep, isPending: isSearchingCep, data: cepData, isSuccess: isCepSearchSuccess } = useMutation({
    mutationFn: getAddressByCEP,
    onSuccess: () => {
      toast.success('Endereço preenchido automaticamente!');
    },
    onError: (error) => toast.error(error.message),
  });

  const handleCepBlur = (event: React.FocusEvent<HTMLInputElement>, setValue: Function) => {
    const cep = event.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      searchCep(cep, {
        onSuccess: (data) => {
          const state = addressData?.states.find((s: IState) => s.uf === data.uf);
          if (state) {
            setValue('state_id', state.id, { shouldValidate: true });
          }
          setValue('address_line', data.logradouro, { shouldValidate: true });
          setValue('complement', data.complemento, { shouldValidate: true });
        }
      });
    }
  };

  const formFields = (watch: Function, setValue: Function): FormFieldConfig<any>[] => {
    const selectedStateId = watch('state_id');

    useEffect(() => {
      if (selectedStateId && isCepSearchSuccess && cepData && addressData?.cities) {
        const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const city = addressData.cities.find((c: ICity) => 
          c.state_id === selectedStateId && normalize(c.name) === normalize(cepData.localidade)
        );
        if (city) setValue('city_id', city.id, { shouldValidate: true });
      }
    }, [selectedStateId, isCepSearchSuccess, cepData, addressData, setValue]);

    return [
    { name: 'corporate_name', label: 'Razão Social', type: 'text', placeholder: 'Nome completo da empresa', gridCols: 2 },
    { name: 'cnpj', label: 'CNPJ', type: 'text', placeholder: 'Apenas números', gridCols: 1 },
    { name: 'trade_name', label: 'Apelido', type: 'text', placeholder: 'Nome popular da empresa', gridCols: 1 },
    { name: 'email', label: 'E-mail', type: 'email', placeholder: 'contato@empresa.com', gridCols: 1 },
    { name: 'phone_number', label: 'Telefone', type: 'text', placeholder: '(00) 00000-0000', gridCols: 1 },
    { name: 'zipcode', label: 'CEP', type: 'text', placeholder: '00000-000', gridCols: 1, onBlur: (e) => handleCepBlur(e, setValue), rightIcon: isSearchingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined },
    { name: 'type', label: 'Tipo', type: 'select', options: [{ value: 'matriz', label: 'Matriz' }, { value: 'filial', label: 'Filial' }], gridCols: 1 },
    { name: 'address_line', label: 'Endereço', type: 'text', placeholder: 'Rua, Avenida, etc.', gridCols: 2 },
    { name: 'complement', label: 'Complemento', type: 'text', placeholder: 'Apto, Bloco, etc.', gridCols: 1 },
    { name: 'country_id', label: 'País', type: 'select', options: addressData?.countries.map((c: ICountry) => ({ value: c.id, label: c.name })), disabled: isLoadingAddressData, placeholder: 'Selecione o país', gridCols: 1 },
    { name: 'state_id', label: 'Estado', type: 'select', options: addressData?.states.map((s: IState) => ({ value: s.id, label: s.name })), disabled: isLoadingAddressData, placeholder: 'Selecione o estado', gridCols: 1 },
    { name: 'city_id', label: 'Cidade', type: 'select', options: addressData?.cities.filter((c: ICity) => c.state_id === selectedStateId).map((c: ICity) => ({ value: c.id, label: c.name })), disabled: !selectedStateId || isLoadingAddressData, placeholder: 'Selecione uma cidade', gridCols: 1 },
  ];
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <h1 className="text-3xl font-bold">Empresas</h1>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <h1 className="text-3xl font-bold">Empresas</h1>
        <p className="text-destructive">Ocorreu um erro ao carregar os dados das empresas.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Empresas</h1>
          <p className="text-muted-foreground">Gerencie os CNPJs cadastrados no sistema</p>
        </div>
        
        <Button onClick={openNewModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
          <div className="relative top-2">
              <Search className="absolute right-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar CNPJ ou Razão Social..." value={busca} onChange={(e) => setBusca(e.target.value)} className="max-w-sm" />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão Social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Abreviação</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className='text-right'>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresasFiltradas.map((empresa) => (
                <TableRow key={empresa.id}>
                  <TableCell className="font-medium">{empresa.corporate_name}</TableCell>
                  <TableCell>{formatCNPJ(empresa.cnpj)}</TableCell>
                  <TableCell>{empresa.trade_name}</TableCell>
                  <TableCell>{empresa.type.toLocaleUpperCase()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex space-x-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(empresa)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(empresa.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <GenericForm
        isOpen={modalAberto}
        onOpenChange={(isOpen) => { if (!isOpen) setEmpresaEditando(null); setModalAberto(isOpen); }}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        initialData={empresaEditando || { type: 'matriz', country_id: 1 }}
        fields={formFields}
        schema={companySchema}
        title={empresaEditando ? 'Editar Empresa' : 'Nova Empresa'}
        description="Preencha as informações para gerenciar a empresa."
      />
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá excluir permanentemente a
              empresa e todos os seus dados associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCompanyToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}