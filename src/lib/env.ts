import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().optional().default('https://financial.ozonteck.cloud'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse({
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    });
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment variables. Check your .env file.');
  }
}

export const env = validateEnv();
