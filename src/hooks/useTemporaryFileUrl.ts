import { useQuery } from '@tanstack/react-query';
import { getTemporaryFileUrl } from '@/lib/services/generic.service';

/**
 * Hook customizado para buscar e cachear uma URL de arquivo temporária.
 * @param path - O caminho do arquivo. Se for nulo ou indefinido, a query é desabilitada.
 * @param disk - O disco de armazenamento (padrão: 's3').
 */
export function useTemporaryFileUrl(path: string | null | undefined, disk: string = 's3') {
  return useQuery({
    queryKey: ['temporaryUrl', path, disk],
    queryFn: () => getTemporaryFileUrl(path!),
    enabled: !!path, // A query só é executada se o 'path' existir.
    staleTime: 1000 * 60 * 15, // 15 minutos. A URL é "fresca" por 15 min.
    gcTime: 1000 * 60 * 20,    // 20 minutos. O cache é limpo após 20 min.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}