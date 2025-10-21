import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ISupplierEdit } from '@/interfaces/finance/SuppliersInterface';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SupplierExpensesListProps {
  supplier: ISupplierEdit;
}

export function SupplierExpensesList({ supplier }: SupplierExpensesListProps) {
  const expenses = supplier.expenses || [];
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = expenses.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Despesas</CardTitle>
        <CardDescription>Despesas registradas para este fornecedor.</CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma despesa registrada para este fornecedor.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Plano de Contas</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDate(new Date(expense.expense_date))}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.account_plan?.name || 'N/A'}</TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {formatCurrency(Number(expense.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} variant="outline">
              Anterior
            </Button>
            <Button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} variant="outline">
              Próximo
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}