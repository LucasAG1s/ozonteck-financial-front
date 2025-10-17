import api, { handleApiError } from "@/lib/axios";

interface TemporaryUrlResponse {
  url: string;
}

/**
 * @param path 
 * @param disk 
 */
export async function getTemporaryFileUrl(path: string, disk: string = 's3'): Promise<TemporaryUrlResponse> {
  try {
    const response = await api.get<string>(`/api/generic/temporary-file-url/${disk}`,{
        params: {
          path,
        },
    });
    return { url: response.data };
  } catch (error) {
    throw handleApiError(error, 'Ocorreu um erro ao gerar a URL do arquivo.');
  }
}