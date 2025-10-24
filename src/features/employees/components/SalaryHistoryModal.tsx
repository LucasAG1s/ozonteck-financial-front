import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IEmployeeContract, IEmployeeSalaryHistory } from '@/interfaces/HR/EmployeeInterface';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SalaryHistoryModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contract: IEmployeeContract | null;
}

export function SalaryHistoryModal({ isOpen, onOpenChange, contract }: SalaryHistoryModalProps) {
  if (!contract) return null;

  const sortedSalaries = [...(contract.salaries || [])].sort(
    (a, b) => new Date(b.effective_date).getTime() - new Date(a.effective_date).getTime()
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Histórico Salarial</DialogTitle>
          <DialogDescription>
            Visualize registros de salário para o contrato.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-60 overflow-y-auto my-4 pr-2 scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Salário</TableHead>
                <TableHead>Data de Vigência</TableHead>
                <TableHead>Mês de Referência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSalaries.length > 0 ? (
                sortedSalaries.map((s: IEmployeeSalaryHistory) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{formatCurrency(Number(s.salary))}</TableCell>
                    <TableCell>{formatDate(new Date(s.effective_date))}</TableCell>
                    <TableCell>{s.reference_month}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Nenhum histórico de salário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}