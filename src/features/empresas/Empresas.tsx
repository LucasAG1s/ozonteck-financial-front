import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Label } from '@/components/ui/label'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { formatCNPJ } from '@/lib/utils'
import { toast } from 'react-toastify'
import { Company, getCompanies, createCompany, updateCompany, deleteCompany } from '@/lib/services/company.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Skeleton } from "@/components/ui/skeleton"

const initialFormData: Omit<Company, 'id'> = {
  corporate_name: '',
  cnpj: '',
  phone_number: '',
  trade_name: '',
  type: 'matriz',
  address_line: '',
  city: '',
  complement: '',
  state: '',
  zipcode: '',
  country: 'BR', 
  email: ''
};

export function Empresas() {
  const queryClient = useQueryClient();

  const { data: empresas = [], isLoading, isError } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: getCompanies,
  });

  const { mutate: createCompanyMutation } = useMutation({
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

  const { mutate: updateCompanyMutation } = useMutation({
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
  const [formData, setFormData] = useState(initialFormData);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<number | null>(null);

  const empresasFiltradas = empresas.filter(empresa =>
    empresa.corporate_name.toLowerCase().includes(busca.toLowerCase()) ||
    empresa.cnpj.includes(busca) ||
    (empresa.trade_name && empresa.trade_name.toLowerCase().includes(busca.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (empresaEditando) {
      updateCompanyMutation({ id: empresaEditando.id, payload: formData });
    } else {
      createCompanyMutation(formData);
    }
  };

  const handleEdit = (empresa: Company) => {
    setEmpresaEditando(empresa);
    setFormData({
      corporate_name: empresa.corporate_name,
      cnpj: empresa.cnpj,
      trade_name: empresa.trade_name || '',
      type: empresa.type,
      phone_number: empresa.phone_number || '',
      email: empresa.email || '',
      address_line: empresa.address_line || '',
      city: empresa.city || '',
      complement: empresa.complement || '',
      state: empresa.state || '',
      zipcode: empresa.zipcode || '',
      country: empresa.country || 'BR'
    });
    setModalAberto(true);
  };
  
  const openNewModal = () => {
    setEmpresaEditando(null);
    setFormData(initialFormData);
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
        
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button onClick={openNewModal}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                {empresaEditando ? 'Editar Empresa' : 'Nova Empresa'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex-grow overflow-hidden flex flex-col">
              <div className="overflow-y-auto space-y-4 pr-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border scrollbar-thumb-rounded-md hover:scrollbar-thumb-accent"> 
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor="corporate_name" className='pl-1'>Razão Social</Label>
                    <Input id="corporate_name" value={formData.corporate_name} onChange={(e) => setFormData({...formData, corporate_name: e.target.value})} required />
                  </div>
                  <div>
                    <Label htmlFor="cnpj" className='pl-1'>CNPJ</Label>
                    <Input id="cnpj" value={formData.cnpj} onChange={(e) => setFormData({...formData, cnpj: e.target.value})} placeholder="Apenas números" required />
                  </div>
                  <div>
                    <Label htmlFor="trade_name" className='pl-1'>Nome Fantasia</Label>
                    <Input id="trade_name" value={formData.trade_name || ''} onChange={(e) => setFormData({...formData, trade_name: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="email" className='pl-1'>Email</Label>
                    <Input id="email" type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="phone_number" className='pl-1'>Telefone</Label>
                    <Input id="phone_number" value={formData.phone_number || ''} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} placeholder="Apenas números" />
                  </div>
                  <div>
                    <Label htmlFor="zipcode" className='pl-1'>CEP</Label>
                    <Input id="zipcode" value={formData.zipcode || ''} onChange={(e) => setFormData({...formData, zipcode: e.target.value})} />
                  </div>
                  <div className='md:col-span-2'>
                    <Label htmlFor="address_line" className='pl-1'>Endereço</Label>
                    <Input id="address_line" value={formData.address_line || ''} onChange={(e) => setFormData({...formData, address_line: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="complement" className='pl-1'>Complemento</Label>
                    <Input id="complement" value={formData.complement || ''} onChange={(e) => setFormData({...formData, complement: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="city" className='pl-1'>Cidade</Label>
                    <Input id="city" value={formData.city || ''} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="state" className='pl-1'>Estado (UF)</Label>
                    <Input id="state" value={formData.state || ''} onChange={(e) => setFormData({...formData, state: e.target.value})} maxLength={2} />
                  </div>
                  <div>
                    <Label htmlFor="type" className='pl-1'>Tipo</Label>
                    <select id="type" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md">
                      <option value="matriz">Matriz</option>
                      <option value="filial">Filial</option>
                    </select>
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-4 mt-auto">
                <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>Cancelar</Button>
                <Button type="submit">{empresaEditando ? 'Atualizar' : 'Cadastrar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por razão social, CNPJ ou nome fantasia..." value={busca} onChange={(e) => setBusca(e.target.value)} className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão Social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Nome Fantasia</TableHead>
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
                  <TableCell>{empresa.type}</TableCell>
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