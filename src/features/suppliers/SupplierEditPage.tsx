import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Building } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getSupplierById } from '@/lib/services/finance/suppliers.service'
import { SupplierGeneralForm } from './components/SupplierGeneralForm'
import { SupplierDataForm } from './components/SupplierDataForm'
import { SupplierAddressForm } from './components/SupplierAddressForm'
import { SupplierBankForm } from './components/SupplierBankForm'
import { SupplierExpensesList } from './components/SupplierExpensesList'

export function SupplierEditPage() {
  const { id } = useParams<{ id: string }>();

  const { data: supplier, isLoading } = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => getSupplierById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="text-center">
        <p className="text-lg text-muted-foreground">Fornecedor não encontrado.</p>
        <Button asChild variant="link"><Link to="/suppliers">Voltar para a lista</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link to="/suppliers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="p-3 bg-muted rounded-full">
          <Building className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Fornecedor</h1>
          <p className="text-muted-foreground">Editando dados de: {supplier?.fantasy_name}</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <div className="overflow-x-auto scrollbar-hide">
          <TabsList className="grid w-full grid-cols-[repeat(5,minmax(180px,1fr))] md:grid-cols-5">
            <TabsTrigger value="general">Dados Gerais</TabsTrigger>
            <TabsTrigger value="data">Dados Fiscais</TabsTrigger>
            <TabsTrigger value="address">Endereço</TabsTrigger>
            <TabsTrigger value="bank">Dados Bancários</TabsTrigger>
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general">
          <SupplierGeneralForm supplier={supplier} />
        </TabsContent>
        <TabsContent value="data">
          <SupplierDataForm data={supplier.data} />
        </TabsContent>
        <TabsContent value="address">
          <SupplierAddressForm address={supplier.address} />
        </TabsContent>
        <TabsContent value="bank">
          <SupplierBankForm bank={supplier.bank} />
        </TabsContent>
        <TabsContent value="expenses">
          <SupplierExpensesList supplier={supplier} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
