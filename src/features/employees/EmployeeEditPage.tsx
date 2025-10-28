import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getEmployeeById } from '@/lib/services/hr/employees.service';
import { AvatarWithTemporaryUrl } from '@/components/ui/AvatarWithTemporaryUrl';
import { EmployeeGeneralForm } from './components/EmployeeGeneralForm';
import { EmployeeAdditionalDataForm } from './components/EmployeeAdditionalDataForm';
import { EmployeeAddressForm } from './components/EmployeeAddressForm';
import { EmployeeBankForm } from './components/EmployeeBankForm';
import { EmployeeContractsList } from './components/EmployeeContractsList';
import { EmployeePaymentsList } from './components/EmployeePaymentsList';
import { EmployeeFilesList } from './components/EmployeeFilesList';
import { EmployeeObservationsList } from './components/EmployeeObservationsForm';


export function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployeeById(Number(id!)),
    enabled: !!id && !isNaN(Number(id)),
  });


  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center">
        <p className="text-lg text-muted-foreground">Colaborador não encontrado.</p>
        <Button asChild variant="link"><Link to="/employees">Voltar para a lista</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link to="/employees"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <AvatarWithTemporaryUrl
          path={employee.data?.avatar}
          fallback={employee.name.charAt(0).toUpperCase()}
        />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Colaborador</h1>
          <p className="text-muted-foreground">Editando dados de: {employee?.name}</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <div className="mb-4">
          <TabsList className="h-auto flex flex-wrap justify-start md:grid md:grid-cols-8 md:h-10 md:divide-x md:divide-gray-200 dark:md:divide-gray-700">
            <TabsTrigger value="general">Dados Gerais</TabsTrigger>
            <TabsTrigger value="additional-data">Dados Adicionais</TabsTrigger>
            <TabsTrigger value="address">Endereço</TabsTrigger>
            <TabsTrigger value="bank">Dados Bancários</TabsTrigger>
            <TabsTrigger value="contracts">Contratos</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value='files'>Arquivos</TabsTrigger>
            <TabsTrigger value='observations'>Observações</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general">
          <EmployeeGeneralForm employee={employee} />
        </TabsContent>
        <TabsContent value="additional-data">
          <EmployeeAdditionalDataForm data={employee.data} />
        </TabsContent>
        <TabsContent value="address">
          <EmployeeAddressForm address={employee.address} />
        </TabsContent>
        <TabsContent value="bank">
          <EmployeeBankForm bank={employee.bank} />
        </TabsContent>
        <TabsContent value="contracts">
          <EmployeeContractsList employee={employee} />
        </TabsContent>
        <TabsContent value="payments">
          <EmployeePaymentsList employee={employee} />
        </TabsContent>
        <TabsContent value="files">
          <EmployeeFilesList employee={employee} />
        </TabsContent>
        <TabsContent value="observations">
          <EmployeeObservationsList employee={employee}/>
        </TabsContent>
      </Tabs>
    </div>
  );
}