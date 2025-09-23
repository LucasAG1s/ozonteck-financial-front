import api from '@/lib/axios'

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

type RequestOptions<TBody = unknown, TQuery = Record<string, any>> = {
  url: string
  method?: HttpMethod
  data?: TBody
  params?: TQuery
  headers?: Record<string, string>
  timeoutMs?: number
}

export async function baseRequest<TResponse = unknown, TBody = unknown, TQuery = Record<string, any>>(
  options: RequestOptions<TBody, TQuery>
): Promise<TResponse> {
  const { url, method = 'get', data, params, headers, timeoutMs } = options

  const response = await api.request<TResponse>({
    url,
    method,
    data,
    params,
    headers,
    timeout: timeoutMs ?? api.defaults.timeout,
  })

  return response.data as TResponse
}

export const http = {
  get: <T = unknown, Q = Record<string, any>>(url: string, params?: Q, headers?: Record<string, string>) =>
    baseRequest<T, never, Q>({ url, method: 'get', params, headers }),
  post: <T = unknown, B = unknown>(url: string, data?: B, headers?: Record<string, string>) =>
    baseRequest<T, B>({ url, method: 'post', data, headers }),
  put: <T = unknown, B = unknown>(url: string, data?: B, headers?: Record<string, string>) =>
    baseRequest<T, B>({ url, method: 'put', data, headers }),
  patch: <T = unknown, B = unknown>(url: string, data?: B, headers?: Record<string, string>) =>
    baseRequest<T, B>({ url, method: 'patch', data, headers }),
  delete: <T = unknown, Q = Record<string, any>>(url: string, params?: Q, headers?: Record<string, string>) =>
    baseRequest<T, never, Q>({ url, method: 'delete', params, headers }),
}


