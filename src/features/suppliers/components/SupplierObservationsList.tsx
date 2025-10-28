import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, User } from 'lucide-react';
import { ISupplierEdit, ISupplierObservation } from '@/interfaces/finance/SuppliersInterface';
import { createSupplierObservation } from '@/lib/services/finance/suppliers.service';
import { GenericForm, FormFieldConfig } from '@/components/forms/GenericForm';
import { formatDate } from '@/lib/utils';

interface SupplierObservationsProps {
  supplier: ISupplierEdit;
}

const observationSchema = z.object({
  observation: z.string().min(1, 'A observação é obrigatória.'),
});

export function SupplierObservationsList({ supplier }: SupplierObservationsProps) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: createObservationMutation, isPending: isCreating } = useMutation({
    mutationFn: ({ supplier_id, payload }: { supplier_id: number, payload: z.infer<typeof observationSchema> }) => createSupplierObservation(supplier_id, payload),
    onSuccess: () => {
      toast.success("Observação adicionada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['supplier', String(supplier.id)] });
      setIsModalOpen(false);
    },
    onError: (error: Error) => toast.error(`Erro ao adicionar observação: ${error.message}`),
  });

  const handleFormSubmit = (data: z.infer<typeof observationSchema>) => {
    createObservationMutation({ supplier_id: supplier.id, payload: data });
  };

  const formFields: FormFieldConfig<typeof observationSchema>[] = [
    { name: 'observation', label: 'Observação', type: 'textarea', placeholder: 'Descreva a observação...', gridCols: 2 },
  ];

  const observations = supplier.observations || [];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 space-x-2 pb-2">
          <CardTitle>Observações</CardTitle>
          <Button size="sm" className="h-8" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-3 w-3 mr-2" /> Adicionar Observação
          </Button>
        </CardHeader>
        <CardDescription className="px-6">Registre observações importantes sobre o fornecedor.</CardDescription>
        <CardContent className="pt-4 space-y-4">
          {observations.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border scrollbar-thumb-rounded-md">
              {observations.map((obs: ISupplierObservation) => (
                <div key={obs.id} className="border rounded-md p-4 bg-muted/50">
                  <p className="text-sm mb-2">{obs.observation}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{obs.operator?.name || 'Desconhecido'}</span>
                    </div>
                    <span>{formatDate(new Date(obs.created_at))}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhuma observação registrada para este fornecedor.</p>
          )}
        </CardContent>
      </Card>

      <GenericForm
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleFormSubmit}
        isLoading={isCreating}
        fields={formFields}
        schema={observationSchema}
        title="Adicionar Nova Observação"
        description="Registre uma nova observação para o fornecedor."
      />
    </>
  );
}