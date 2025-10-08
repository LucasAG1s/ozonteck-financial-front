import { useState, useMemo } from "react";
import { AccountPlan, getAccountPlans, createAccountPlan, CreateAccountPlanPayload, deleteAccountPlan, updateAccountPlan, UpdateAccountPlanPayload } from "@/lib/services/finance/account-plan.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "react-toastify";
import { GenericForm, FormFieldConfig } from '@/components/forms/GenericForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

// Schema de validação para o formulário de planos de conta
const accountPlanSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  type: z.coerce.number().min(1, 'O tipo é obrigatório.'),
  description: z.string().optional(),
  parent_id: z.coerce.number().nullable(),
});
type AccountPlanNode = AccountPlan & { children: AccountPlanNode[] };


function buildTree(items: AccountPlan[]): AccountPlanNode[] {
  const tree: AccountPlanNode[] = [];
  const childrenOf: { [key: number]: AccountPlanNode[] } = {};
  const itemMap: { [key: number]: AccountPlanNode } = {};

  items.forEach(item => {
    const node: AccountPlanNode = { ...item, children: [] };
    itemMap[item.id] = node;
    if (item.parent_id === null) {
      tree.push(node);
    } else {
      if (!childrenOf[item.parent_id]) {
        childrenOf[item.parent_id] = [];
      }
      childrenOf[item.parent_id].push(node);
    }
  });

  Object.keys(childrenOf).forEach(parentId => {
    const parentIdNum = parseInt(parentId, 10);
    if (itemMap[parentIdNum]) {
      itemMap[parentIdNum].children = childrenOf[parentIdNum];
    }
  });

  return tree;
}

interface AccountPlanRowProps {
  plan: AccountPlanNode;
  level: number;
  expanded: Set<number>;
  onToggle: (id: number) => void;
  onEdit: (plan: AccountPlan) => void;
  onDelete: (id: number) => void;
}
function AccountPlanRow({ plan, level, expanded, onToggle, onEdit, onDelete }: AccountPlanRowProps) {
  const isExpanded = expanded.has(plan.id);
  const hasChildren = plan.children.length > 0;

  return (
    <>
      <TableRow>
        <TableCell style={{ paddingLeft: `${level * 24 + 12}px` }}>
          <div className="flex items-center gap-2">
            {hasChildren && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onToggle(plan.id)}>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
            {!hasChildren && <span className="w-6" />} {/* Espaçador para alinhar */}
            {plan.name}
          </div>
        </TableCell>
        <TableCell>{plan.id}</TableCell>
        <TableCell>{plan.type === 1 ? 'Receita' : 'Despesa'}</TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(plan)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(plan.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && hasChildren && plan.children.map(child => (
        <AccountPlanRow key={child.id} plan={child} level={level + 1} expanded={expanded} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </>
  );
}

export function AccountPlans() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<AccountPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<number | null>(null);

  const { data: plans = [], isLoading, isError, error } = useQuery<AccountPlan[]>({
    queryKey: ['accountPlans'],
    queryFn: getAccountPlans,
  });

  const { mutate: createPlanMutation, isPending: isCreating } = useMutation({
    mutationFn: createAccountPlan,
    onSuccess: () => {
      toast.success("Plano de conta criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['accountPlans'] });
      setIsModalOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar plano: ${error.message}`);
    }
  });

  const { mutate: updatePlanMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, payload }: { id: number, payload: UpdateAccountPlanPayload }) => updateAccountPlan(id, payload),
    onSuccess: () => {
      toast.success("Plano de conta atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['accountPlans'] });
      setIsModalOpen(false);
      setPlanToEdit(null);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar plano: ${error.message}`);
    }
  });

  const { mutate: deletePlanMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteAccountPlan,
    onSuccess: () => {
      toast.success("Plano de conta excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['accountPlans'] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir plano: ${error.message}`);
    }
  });

  const handleSubmit = (data: CreateAccountPlanPayload | UpdateAccountPlanPayload) => {
    if (planToEdit) {
      updatePlanMutation({ id: planToEdit.id, payload: data });
    } else {
      createPlanMutation(data as CreateAccountPlanPayload);
    }
  };

  const handleEditClick = (plan: AccountPlan) => {
    setPlanToEdit(plan);
    setIsModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setPlanToEdit(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setPlanToDelete(id);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (planToDelete !== null) {
      deletePlanMutation(planToDelete);
      setIsAlertOpen(false);
      setPlanToDelete(null);
    }
  };

  const planTree = useMemo(() => buildTree(plans), [plans]);

  const handleToggle = (id: number) => {
    setExpanded(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Configuração dos campos para o GenericForm
  const formFields: FormFieldConfig[] = [
    { name: 'name', label: 'Nome', type: 'text', placeholder: 'Nome do plano de conta', gridCols: 2 },
    {
      name: 'type',
      label: 'Tipo',
      type: 'select',
      placeholder: 'Selecione o tipo',
      options: [
        { value: 1, label: 'Receita' },
        { value: 2, label: 'Despesa' },
      ],
      gridCols: 1,
    },
    {
      name: 'parent_id',
      label: 'Plano Pai (Opcional)',
      type: 'select',
      placeholder: 'Nenhum (Plano Raiz)',
      // ATENÇÃO: O GenericForm atual não suporta filtragem dinâmica de opções
      // baseada em outros campos do formulário (ex: tipo).
      // Todas as opções de planos de conta serão exibidas aqui.
      options: [{ value: 'null', label: 'Nenhum (Plano Raiz)' }, ...plans.map(plan => ({
        value: plan.id,
        label: `${plan.name} (${plan.type === 1 ? 'Receita' : 'Despesa'})`
      }))],
      gridCols: 1,
    },
    { name: 'description', label: 'Descrição (Opcional)', type: 'textarea', placeholder: 'Descrição detalhada do plano', gridCols: 2 },
  ];


  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError) return <p className="text-destructive">Ocorreu um erro: {error instanceof Error ? error.message : 'Erro desconhecido'}</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Plano de Contas</h1>
        <Button onClick={handleOpenNewModal}><Plus className="h-4 w-4 mr-2" /> Novo Plano</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Estrutura de Contas</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Nome</TableHead><TableHead>Código</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Ações</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {planTree.map(plan => <AccountPlanRow key={plan.id} plan={plan} level={0} expanded={expanded} onToggle={handleToggle} onEdit={handleEditClick} onDelete={handleDeleteClick} />)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <GenericForm
        isOpen={isModalOpen}
        onOpenChange={(isOpen) => { if (!isOpen) setPlanToEdit(null); setIsModalOpen(isOpen); }}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        fields={formFields}
        schema={accountPlanSchema}
        title={planToEdit ? 'Editar Plano de Conta' : 'Novo Plano de Conta'}
        description={planToEdit ? 'Altere as informações do plano de conta.' : 'Preencha as informações para cadastrar um novo plano.'}
        initialData={planToEdit}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá excluir permanentemente o
              plano de conta. Planos de conta que possuem filhos não podem ser excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlanToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >{isDeleting ? "Excluindo..." : "Confirmar Exclusão"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
export default AccountPlans;
