import { useState } from "react";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { useCompanies } from "@/hooks/useCompanies"
import { getBanksAccount, createBankAccount, updateBankAccount, deleteBankAccount, UpdateBankAccountPayload } from "@/lib/services/finance/banks-account.service";
import { getBanks } from "@/lib/services/universal/banks.service";
import { IBankAccount, IBank } from "@/interfaces/finance/BankAccountInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2 } from "lucide-react";
import { GenericForm, FormFieldConfig } from "@/components/forms/GenericForm";
import { DeleteConfirmationDialog } from "@/components/ui/DeleteConfirmationDialog";
import { formatBankAccount } from "@/lib/utils";

const bankAccountSchema = z.object({
    bank_id: z.coerce.number().min(1, 'O banco é obrigatório.'),
    agency: z.string().min(1, 'A agência é obrigatória.'),
    account: z.string().min(1, 'O número da conta é obrigatório.'),
    account_type: z.string().min(1, 'O tipo da conta é obrigatório.'),
    description: z.string().nullable(),
    pix_key: z.string().optional().nullable(),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

export function BankAccounts(){
    const queryClient = useQueryClient();
    const { selectedCompany } = useCompanies();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [accountToEdit, setAccountToEdit] = useState<IBankAccount | null>(null);
    const [accountToDelete, setAccountToDelete] = useState<number | null>(null);

    const { data: bankAccounts = [], isLoading: isLoadingAccounts } = useQuery({
        queryKey: ['bankAccounts', selectedCompany?.id],
        queryFn: () => getBanksAccount(selectedCompany!.id),
        enabled: !!selectedCompany,
        staleTime: 1000 * 60,
    });

    const { data: banks = [], isLoading: isLoadingBanks } = useQuery<IBank[]>({
        queryKey: ['banks'],
        queryFn: getBanks,
        staleTime: Infinity, 
    });

    const { mutate: createAccountMutation, isPending: isCreating } = useMutation({
        mutationFn: createBankAccount,
        onSuccess: () => {
            toast.success("Conta bancária criada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['bankAccounts', selectedCompany?.id] });
            setIsModalOpen(false);
        },
        onError: (error: Error) => toast.error(`Erro ao criar conta: ${error.message}`),
    });

    const { mutate: updateAccountMutation, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateBankAccountPayload }) => updateBankAccount({ id, payload }),
        onSuccess: () => {
            toast.success("Conta bancária atualizada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['bankAccounts', selectedCompany?.id] });
            setIsModalOpen(false);
        },
        onError: (error: Error) => toast.error(`Erro ao atualizar conta: ${error.message}`),
    });

    const { mutate: deleteAccountMutation, isPending: isDeleting } = useMutation({
        mutationFn: deleteBankAccount,
        onSuccess: () => {
            toast.success("Conta bancária excluída com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['bankAccounts', selectedCompany?.id] });
            setIsAlertOpen(false);
        },
        onError: (error: Error) => toast.error(`Erro ao excluir conta: ${error.message}`),
    });

    const handleFormSubmit = (data: BankAccountFormData) => {
        const payload = { ...data, company_id: selectedCompany!.id };
        if (accountToEdit) {
            updateAccountMutation({ id: accountToEdit.id, payload });
        } else {
            createAccountMutation(payload);
        }
    };

    const handleEditClick = (account: IBankAccount) => {
        setAccountToEdit(account);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setAccountToDelete(id);
        setIsAlertOpen(true);
    };

    const formFields: FormFieldConfig<typeof bankAccountSchema>[] = [
        { name: 'bank_id', label: 'Banco', type: 'select', options: banks.map(b => ({ value: b.id, label: `${b.code} - ${b.name}` })), placeholder: 'Selecione um banco', gridCols: 2, disabled: isLoadingBanks },
        { name: 'agency', label: 'Agência', type: 'text', placeholder: 'Ex: 0001', gridCols: 1 },
        { name: 'account', label: 'Conta com dígito', type: 'text', placeholder: 'Ex: 12345-6', gridCols: 1 },
        { name: 'account_type', label: 'Tipo da Conta', type: 'select', options: [{ value: 'corrente', label: 'Conta Corrente' }, { value: 'poupanca', label: 'Conta Poupança' }, {value:'digital',label:'Digital'}], gridCols: 1 },
        { name: 'description', label: 'Descrição (Opcional)', type: 'text', placeholder: 'Ex: Conta Principal', gridCols: 1 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Contas Bancárias</h1>
                    <p className="text-muted-foreground">Gerencie as contas bancárias da empresa selecionada.</p>
                </div>
                <Button onClick={() => { setAccountToEdit(null); setIsModalOpen(true); }} disabled={!selectedCompany}>
                    <Plus className="h-4 w-4 mr-2" /> Nova Conta
                </Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Lista de Contas</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Banco</TableHead>
                                <TableHead>Agência</TableHead>
                                <TableHead>Conta</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="text-right w-[100px]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingAccounts ? (
                                Array.from({ length: 3 }).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>)
                            ) : bankAccounts.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma conta cadastrada.</TableCell></TableRow>
                            ) : (
                                bankAccounts.map(account => (
                                    <TableRow key={account.id}>
                                        <TableCell className="font-medium">{account.banks.name}</TableCell>
                                        <TableCell>{account.agency}</TableCell>
                                        <TableCell>{formatBankAccount(account.account)}</TableCell>
                                        <TableCell>{account.description || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(account)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(account.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <GenericForm
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSubmit={handleFormSubmit}
                isLoading={isCreating || isUpdating}
                initialData={accountToEdit}
                fields={formFields}
                schema={bankAccountSchema}
                title={accountToEdit ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
                description="Preencha as informações da conta."
            />

            <DeleteConfirmationDialog
                isOpen={isAlertOpen}
                onOpenChange={setIsAlertOpen}
                onConfirm={() => accountToDelete && deleteAccountMutation(accountToDelete)}
                isDeleting={isDeleting}
                title="Excluir Conta?"
                description="Essa ação não pode ser desfeita. A conta será removida permanentemente."
            />
        </div>
    )
}
