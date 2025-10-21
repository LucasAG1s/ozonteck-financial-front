import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Frown } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12 text-center ">
      <Frown className="h-24 w-24 text-primary mb-6" />
      <h1 className="text-5xl font-bold text-foreground mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-muted-foreground mb-8">Página Não Encontrada</h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-md">
        Parece que a página que você está procurando não existe!
      </p>
      <Button asChild>
        <Link to="/">
          Voltar para a Página Inicial
        </Link>
      </Button>
    </div>
  );
}
