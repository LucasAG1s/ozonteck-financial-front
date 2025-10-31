import { z } from 'zod'

export const loginSchema = z.object({
  login: z
    .string()
    .min(1, 'Email/Login é obrigatório'),
    password: z
    .string()
    .min(1, 'Senha é obrigatória')
})

export type LoginFormData = z.infer<typeof loginSchema>