import { useQuery } from '@tanstack/react-query';
import { getTemporaryFileUrl } from '@/lib/services/generic.service';

/**
 * Hook customizado para buscar e cachear uma URL de arquivo temporária.
 * @param path - O caminho do arquivo. Se for nulo ou indefinido, a query é desabilitada.
 * @param disk 
 */
export function useTemporaryFileUrl(path: string | null | undefined, disk: string = 's3') {
  return useQuery({
    queryKey: ['temporaryUrl', path, disk],
    queryFn: () => getTemporaryFileUrl(path!),
    enabled: !!path, 
    staleTime: 1000 * 60 * 15, 
    gcTime: 1000 * 60 * 20,   
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}