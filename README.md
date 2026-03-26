# env-secure-guard

A zero-dependency, edge-ready, and strongly typed environment variable validator designed specifically for edge runtimes (Cloudflare Workers, Vercel Edge).

[![npm version](https://badge.fury.io/js/env-secure-guard.svg)](https://badge.fury.io/js/env-secure-guard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why this exists?
Large-scale applications and serverless edge functions fail silently when necessary environment variables are missing. However, importing heavy validation libraries like `zod` or `joi` just to validate a few environment variables increases bundle sizes and drastically impacts cold-start times. 

`env-secure-guard` solves this by providing a highly optimized execution path with built-in TypeScript inference without a single external dependency.

## Installation
```bash
npm install env-secure-guard
```

## Usage
```typescript
import { validateEnv } from 'env-secure-guard';

// Pass your schema and the env source (e.g. process.env or ctx.env)
const env = validateEnv({
  PORT: { type: 'number', default: 3000 },
  DATABASE_URL: { type: 'string', required: true },
  ENABLE_FEATURE_X: { type: 'boolean' }, // Optional
}, process.env);

console.log(`Server starting on port ${env.PORT}`);
```

## 🔋 Tested Runtimes
Edge behavior can be surprisingly inconsistent, especially when identifying the point at which environment variables become available (build time vs run time). `env-secure-guard` is purely runtime and expects the environment variables object to be explicitly passed during the execution phase.

**We have explicitly tested and support the following environments:**
*   **Node.js** (v18+)
*   **Vercel Edge** (Next.js Edge API routes and Middleware)
*   **Cloudflare Workers** (using `ctx.env`)
*   **Deno / Bun**

## 🛑 Error Messaging
Debugging silent deployment failures at midnight is no fun. `env-secure-guard` is designed to throw explicit, actionable error messages instead of generic type errors.

For example, if `DATABASE_URL` is omitted, the console output will clearly instruct you:
`Error: Environment Validation Error: Missing required environment variable: DATABASE_URL`

## Handling Optionals and Defaults
Defaults and optionals are handled cleanly without complex, bloated prototype chaining.
*   **Required:** Add `required: true`. It will throw an explicit error if missing.
*   **Defaults:** Provide `default: value`. No error will be thrown, and it will safely fallback.
*   **Optional:** Omit both `required` and `default`. It handles undefined keys gracefully.

## Custom Validation
You can also supply your own custom validation functions to extend the logic natively:
```typescript
const env = validateEnv({
  ORG_ID: { 
    type: 'string', 
    required: true, 
    validate: (val) => val.startsWith('org_') 
  }
});
```

---
*If your edge functions depend on lightweight, fast configuration layers, drop a ⭐!*
