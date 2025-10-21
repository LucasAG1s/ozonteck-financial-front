import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IEmployee as Employee } from '@/interfaces/HR/EmployeeInterface';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

interface EmployeePaymentsListProps {
  employee: Employee;
}

export function EmployeePaymentsList({ employee }: EmployeePaymentsListProps) {
  const payments = employee.payments || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Pagamentos</CardTitle>
      </CardHeader>
      <CardDescription className="px-6">Histórico de pagamentos realizados ao colaborador.</CardDescription>
      <CardContent className="pt-4">
        {payments.length === 0 ? (
          <p className="text-muted-foreground">Nenhum pagamento registrado para este colaborador.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Mês Referência</TableHead>
                  <TableHead>Data Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.type}</TableCell>
                    <TableCell>{formatCurrency(Number(payment.amount))}</TableCell>
                    <TableCell>{new Date(payment.reference_month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</TableCell>
                    <TableCell>{new Date(payment.paid_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Ver Detalhes</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}