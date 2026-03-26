export type TypeOption = 'string' | 'number' | 'boolean';

export interface EnvSchema {
  [key: string]: {
    type: TypeOption;
    required?: boolean;
    default?: any;
    validate?: (val: any) => boolean;
  };
}

export function validateEnv<T extends Record<string, any>>(schema: EnvSchema, env: Record<string, string | undefined> = process.env): T {
  const result: any = {};
  const errors: string[] = [];

  for (const [key, rules] of Object.entries(schema)) {
    let value: any = env[key];

    if (value === undefined || value === '') {
      if (rules.default !== undefined) {
        value = rules.default;
      } else if (rules.required) {
        errors.push(`Missing required environment variable: ${key}`);
        continue;
      } else {
        continue;
      }
    } else {
      // Parse value based on type
      if (rules.type === 'number') {
        value = Number(value);
        if (isNaN(value)) {
          errors.push(`Environment variable ${key} must be a valid number.`);
        }
      } else if (rules.type === 'boolean') {
        value = value === 'true' || value === '1';
      }
    }

    if (rules.validate && !rules.validate(value)) {
      errors.push(`Environment variable ${key} failed custom validation.`);
    }

    result[key] = value;
  }

  if (errors.length > 0) {
    throw new Error(`Environment Validation Error:\n${errors.join('\n')}`);
  }

  return result as T;
}
