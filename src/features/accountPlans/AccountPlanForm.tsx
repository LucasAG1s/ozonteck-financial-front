import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AccountPlan, CreateAccountPlanPayload } from '@/lib/services/finance/account-plan.service';
import { useMemo, useEffect } from 'react';

const accountPlanSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  type: z.coerce.number().min(1, 'O tipo é obrigatório.'),
  description: z.string().optional(),
  parent_id: z.coerce.number().nullable(),
});

type AccountPlanFormData = z.infer<typeof accountPlanSchema>;

interface AccountPlanFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: CreateAccountPlanPayload) => void;
  isLoading: boolean;
  allPlans: AccountPlan[];
  initialData?: AccountPlan | null;
}

export function AccountPlanForm({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading,
  allPlans,
  initialData,
}: AccountPlanFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<AccountPlanFormData>({
    resolver: zodResolver(accountPlanSchema),
    defaultValues: {
      name: '',
      type: undefined,
      description: '',
      parent_id: null,
    },
  });

  useEffect(() => {
    // Popula o formulário para edição ou limpa para criação.
    // O `reset` é chamado aqui para garantir que os valores sejam definidos antes da primeira renderização do formulário.
    if (isOpen) {
      if (initialData) {
        reset(initialData);
      } else {
        reset({ name: '', type: undefined, description: '', parent_id: null });
      }
    }
  }, [isOpen, initialData, reset]);

  const selectedType = watch('type');

  const parentPlans = useMemo(() => {
    if (!selectedType) return [];
    return allPlans.filter(plan => plan.type === selectedType);
  }, [selectedType, allPlans]);

  const handleFormSubmit = (data: AccountPlanFormData) => {
    onSubmit(data as CreateAccountPlanPayload);
  };

  const handleOpenChange = (open: boolean) => {
    // A limpeza do formulário agora é controlada pelo useEffect para evitar o loop.
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Plano de Conta' : 'Novo Plano de Conta'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Altere as informações do plano de conta.' : 'Preencha as informações para cadastrar um novo plano.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value || '')}>
                  <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Receita</SelectItem>
                    <SelectItem value="2">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
          </div>
          <div>
            <Label htmlFor="parent_id">Plano Pai (Opcional)</Label>
            <Controller
              name="parent_id"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(value === 'null' ? null : Number(value))}
                  value={String(field.value ?? '')}
                  disabled={!selectedType}
                >
                  <SelectTrigger><SelectValue placeholder={selectedType ? "Selecione um plano pai" : "Selecione um tipo primeiro"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Nenhum (Plano Raiz)</SelectItem>
                    {parentPlans.map(plan => (
                      <SelectItem key={plan.id} value={String(plan.id)}>
                        {plan.id} - {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea id="description" {...register('description')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar Plano')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}