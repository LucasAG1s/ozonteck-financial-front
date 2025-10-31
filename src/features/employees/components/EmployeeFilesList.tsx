import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download, Trash2, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { IEmployee, IEmployeeFiles } from '@/interfaces/HR/EmployeeInterface';
import { createFile, deleteFile } from '@/lib/services/hr/employees.service';
import { getTemporaryFileUrl } from '@/lib/services/generic.service';
import { GenericForm, FormFieldConfig } from '@/components/forms/GenericForm';
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog';
import { formatBytes } from '@/lib/utils';

const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const fileSchema = z.object({
  type: z.string().min(1, 'O tipo do arquivo é obrigatório.'),
  name: z.string().min(3, 'O nome/descrição é obrigatório.'),
  file: z.any()
    .refine((files) => files instanceof FileList && files.length > 0, 'O arquivo é obrigatório.')
    .transform((files) => files[0])
    .refine(
      (file) => file.size <= MAX_FILE_SIZE_BYTES,
      `O tamanho máximo do arquivo é de ${MAX_FILE_SIZE_MB}MB.`
    ),
});

interface EmployeeFilesListProps {
  employee: IEmployee;
}

function FilePreviewCard({ file, onDeleteClick, onDownloadClick, isDownloading }: { file: IEmployeeFiles, onDeleteClick: (id: number) => void, onDownloadClick: (path: string) => void, isDownloading: boolean }) {
  const isImage = file.mime_type.startsWith('image/'); 
  const isPdf = file.mime_type === 'application/pdf'; 
  const isViewableInBrowser = isImage || isPdf; 

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { mutate: getPreviewUrlMutation, isPending: isGettingPreview } = useMutation({
    mutationFn: () => getTemporaryFileUrl(file.path, 's3'),
    onSuccess: (data) => setPreviewUrl(data.url),
    onError: () => { },
  });

  if (isViewableInBrowser && !previewUrl && !isGettingPreview) {
    getPreviewUrlMutation();
  }

  const renderPreviewContent = () => {
    if (isViewableInBrowser && previewUrl) {
      if (isImage) {
        return <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />;
      } else if (isPdf) {
        return <embed src={previewUrl} type="application/pdf" className="w-full h-full" />;
      }
    } else if (isViewableInBrowser && isGettingPreview) {
      return <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />;
    } else if (isImage) { 
      return <ImageIcon className="h-10 w-10 text-muted-foreground" />;
    } else if (isPdf) {
      return <FileText className="h-10 w-10 text-muted-foreground" />;
    }

    return <FileText className="h-10 w-10 text-muted-foreground" />;
  };

  return (
    <div className="relative flex-shrink-0 w-48 h-56 rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden group">
      <div className="flex items-center justify-center h-3/5 bg-muted/50">
        {renderPreviewContent()}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-sm font-semibold leading-none truncate" title={file.name}>{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
      </div>
      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onDownloadClick(file.path)} disabled={isDownloading} title="Baixar">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => onDeleteClick(file.id)} title="Excluir">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function EmployeeFilesList({ employee }: EmployeeFilesListProps) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<number | null>(null);

  const { mutate: createFileMutation, isPending: isCreating } = useMutation({
    mutationFn: ({ employee_id, payload }: { employee_id: number, payload: z.infer<typeof fileSchema> }) => createFile(employee_id, payload),
    onSuccess: () => {
      toast.success("Arquivo adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['employee', String(employee.id)] });
      setIsModalOpen(false);
    },
    onError: (error: Error) => toast.error(`Erro ao adicionar arquivo: ${error.message}`),
  });

  const { mutate: deleteFileMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      toast.success("Arquivo excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['employee', String(employee.id)] });
      setIsAlertOpen(false);
    },
    onError: (error: Error) => toast.error(`Erro ao excluir arquivo: ${error.message}`),
  });

  const { mutate: getFileUrlMutation, isPending: isGettingUrl } = useMutation({
    mutationFn: (path: string) => getTemporaryFileUrl(path, 's3'),
    onSuccess: (data) => window.open(data.url, '_blank'),
    onError: (error: Error) => toast.error(`Não foi possível acessar o anexo: ${error.message}`),
  });

  const handleFormSubmit = (data: z.infer<typeof fileSchema>) => {
    createFileMutation({ employee_id: employee.id, payload: data });
  };

  const handleDeleteClick = (id: number) => {
    setFileToDelete(id);
    setIsAlertOpen(true);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      deleteFileMutation(fileToDelete);
    }
  };

  const groupedFiles = useMemo(() => {
    return (employee.files || []).reduce((acc, file) => {
      const type = file.type || 'Outros';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(file);
      return acc;
    }, {} as Record<string, IEmployeeFiles[]>);
  }, [employee.files]);

  const formFields: FormFieldConfig<typeof fileSchema>[] = [
    { name: 'type', label: 'Tipo do Arquivo', type: 'select', options: [{ value: 'documents', label: 'Documento' }, { value: 'certificates', label: 'Certificado' },{value: 'others', label: 'Outros'},], gridCols: 1 },
    { name: 'name', label: 'Nome / Descrição', type: 'text', placeholder: 'Ex: CNH, Certificado de Conclusão', gridCols: 1 },
    { name: 'file', label: 'Arquivo', type: 'file', accept: '.pdf,.png,.jpg,.jpeg,.webp', gridCols: 2 },
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 space-x-1 pb-2">
          <CardTitle>Documentos e Arquivos</CardTitle>
          <Button size="sm" className="h-8" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar Arquivo
          </Button>
        </CardHeader>
        <CardDescription className="px-6">Gerencie os documentos e certificados do colaborador.</CardDescription>
        <CardContent className="pt-4 space-y-8">
          {Object.keys(groupedFiles).length > 0 ? (
            Object.entries(groupedFiles).map(([type, files]) => (
              <div key={type}>
                <h3 className="text-lg font-semibold mb-3 capitalize">{ type == 'documents' ? 'Documentos' : type == 'certificates' ? 'Certificados' : 'Outros'}</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-custom">
                  {files.map(file => (
                    <FilePreviewCard
                      key={file.id}
                      file={file}
                      onDeleteClick={handleDeleteClick}
                      onDownloadClick={(path) => getFileUrlMutation(path)}
                      isDownloading={isGettingUrl}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhum arquivo cadastrado para este colaborador.</p>
          )}
        </CardContent>
      </Card>

      <GenericForm
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleFormSubmit}
        isLoading={isCreating}
        fields={formFields}
        schema={fileSchema}
        title="Adicionar Novo Arquivo"
        description="Selecione o tipo e envie o arquivo correspondente."
      />

      <DeleteConfirmationDialog
        isOpen={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Excluir Arquivo?"
        description="Essa ação não pode ser desfeita. O arquivo será removido permanentemente."
      />
    </>
  );
}