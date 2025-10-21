import axios from 'axios';

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

/**
 * Busca um endereço a partir de um CEP na API do ViaCEP.
 * @param cep - O CEP a ser consultado (apenas números).
 */
export async function getAddressByCEP(cep: string): Promise<ViaCEPResponse> {
  try {
    const response = await axios.get<ViaCEPResponse>(`https://viacep.com.br/ws/${cep}/json/`);
    if (response.data.erro) {
      throw new Error('CEP não encontrado.');
    }

    console.log(response.data)
    return response.data;
  } catch (error) {
    // Re-throw a more specific error message
    throw new Error('Não foi possível buscar o CEP. Verifique o valor e sua conexão.');
  }
}