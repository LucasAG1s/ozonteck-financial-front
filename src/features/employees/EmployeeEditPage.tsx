import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getEmployeeById } from '@/lib/services/hr/employees.service';

export function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployeeById(Number(id)),
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
          <Link to="/employees"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Colaborador</h1>
          <p className="text-muted-foreground">Editando dados de: {employee?.name}</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Dados Gerais</TabsTrigger>
          <TabsTrigger value="address">Endereço</TabsTrigger>
          <TabsTrigger value="bank">Dados Bancários</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="additional_data">Dados Adicionais</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card><CardHeader><CardTitle>Dados Gerais</CardTitle><CardDescription>Informações principais do colaborador, como nome, CPF, cargo e salário.</CardDescription></CardHeader><CardContent><p>Formulário de Dados Gerais aqui...</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="address">
          <Card><CardHeader><CardTitle>Endereço</CardTitle><CardDescription>Informações de localização do colaborador.</CardDescription></CardHeader><CardContent><p>Formulário de endereço aqui...</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="bank">
          <Card><CardHeader><CardTitle>Dados Bancários</CardTitle><CardDescription>Informações da conta bancária para pagamentos.</CardDescription></CardHeader><CardContent><p>Formulário de Dados Bancários aqui...</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="contracts">
          <Card><CardHeader><CardTitle>Contratos</CardTitle><CardDescription>Histórico e detalhes dos contratos de trabalho.</CardDescription></CardHeader><CardContent><p>Formulário de Contratos aqui...</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="payments">
          <Card><CardHeader><CardTitle>Pagamentos</CardTitle><CardDescription>Histórico de pagamentos realizados ao colaborador.</CardDescription></CardHeader><CardContent><p>Tabela de Pagamentos aqui...</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="additional_data">
          <Card><CardHeader><CardTitle>Dados Adicionais</CardTitle><CardDescription>Outras informações relevantes sobre o colaborador.</CardDescription></CardHeader><CardContent><p>Formulário de Dados Adicionais aqui...</p></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}