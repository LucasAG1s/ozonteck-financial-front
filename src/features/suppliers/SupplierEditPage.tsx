import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getSupplierById } from '@/lib/services/finance/suppliers.service';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link to="/suppliers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Fornecedor</h1>
          <p className="text-muted-foreground">Editando dados de: {supplier?.name}</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Dados Gerais</TabsTrigger>
          <TabsTrigger value="address">Endereço</TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card><CardHeader><CardTitle>Dados Gerais</CardTitle><CardDescription>Informações principais do fornecedor.</CardDescription></CardHeader><CardContent><p>Formulário de dados gerais aqui...</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="address">
          <Card><CardHeader><CardTitle>Endereço</CardTitle><CardDescription>Informações de localização.</CardDescription></CardHeader><CardContent><p>Formulário de endereço aqui...</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="contacts">
          <Card><CardHeader><CardTitle>Contatos</CardTitle><CardDescription>Lista de contatos associados.</CardDescription></CardHeader><CardContent><p>Formulário de contatos aqui...</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="financial">
          <Card><CardHeader><CardTitle>Dados Financeiros</CardTitle><CardDescription>Informações bancárias e de pagamento.</CardDescription></CardHeader><CardContent><p>Formulário financeiro aqui...</p></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}