import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getEmployeeById } from '@/lib/services/hr/employees.service'; // Assumindo que esta função será criada

export function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();


  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      console.log(`Buscando colaborador com ID: ${id}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id, name: 'Nome do Colaborador' }; // Dado mocados
    },
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

      <Tabs defaultValue="address" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="address">Endereço</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="affiliates">Filiados</TabsTrigger>
          <TabsTrigger value="other">Outros Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="address">
          <Card><CardHeader><CardTitle>Endereço</CardTitle><CardDescription>Informações de localização do colaborador.</CardDescription></CardHeader><CardContent><p>Formulário de endereço aqui...</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card><CardHeader><CardTitle>Documentos</CardTitle><CardDescription>Documentos pessoais e profissionais.</CardDescription></CardHeader><CardContent><p>Formulário de documentos aqui...</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="affiliates">
          <Card><CardHeader><CardTitle>Filiados</CardTitle><CardDescription>Informações sobre dependentes ou filiados.</CardDescription></CardHeader><CardContent><p>Formulário de filiados aqui...</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="other">
          <Card><CardHeader><CardTitle>Outros Dados</CardTitle><CardDescription>Informações adicionais e complementares.</CardDescription></CardHeader><CardContent><p>Outros formulários aqui...</p></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}