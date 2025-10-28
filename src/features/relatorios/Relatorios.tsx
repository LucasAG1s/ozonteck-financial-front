import {Wrench} from 'lucide-react';


export function Reports() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <Wrench className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Página em Construção</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          A funcionalidade de integrações está sendo desenvolvida e estará disponível em breve para automatizar seus processos.
        </p>
      </div>
    )
}