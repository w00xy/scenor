import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CREDENTIALS_ENCRYPTION_KEY: z.string().length(64, 'CREDENTIALS_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOSTNAME: z.string().default('127.0.0.1'),
  NODE_ENV: z.string().optional(),
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email').default('admin@scenor.local'),
  ADMIN_USERNAME: z.string().min(3, 'ADMIN_USERNAME must be at least 3 characters').default('admin'),
  ADMIN_PASSWORD: z.string().min(6, 'ADMIN_PASSWORD must be at least 6 characters').default('admin123'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function getEnvFilePaths(): string[] {
  const explicitFile = process.env.ENV_FILE?.trim();
  if (explicitFile) {
    return [explicitFile];
  }

  const nodeEnv = process.env.NODE_ENV?.trim();
  const files: string[] = [];

  if (nodeEnv) {
    if (nodeEnv === 'prod' || nodeEnv === 'production') {
      files.push('.env.prod');
    }
    files.push(`.env.${nodeEnv}`);
  }

  files.push('.env');
  return [...new Set(files)];
}

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Environment validation failed: ${issues}`);
  }

  return parsed.data;
}
