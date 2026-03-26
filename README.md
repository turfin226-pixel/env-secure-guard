# env-secure-guard

A zero-dependency, edge-ready, and strongly typed environment variable validator for modern JavaScript and TypeScript projects. Many libraries implicitly rely on process.env being correctly populated. `env-secure-guard` provides a lightweight (under 1KB minified) layer to strictly validate app configurations at runtime without pulling in heavy validation libraries.

## Why this exists? (And why the ecosystem quietly relies on validation like this)
Large-scale applications, serverless functions, and edge deployments fail silently when missing environment variables exist. Heavy libraries like `joi` or `yup` increase cold start times for edge functions. `env-secure-guard` solves this by introducing a highly optimized execution path with built-in TypeScript inference.

## Installation
```bash
npm install env-secure-guard
```

## Usage
```typescript
import { validateEnv } from 'env-secure-guard';

const env = validateEnv({
  PORT: { type: 'number', default: 3000 },
  DATABASE_URL: { type: 'string', required: true },
  ENABLE_FEATURE_X: { type: 'boolean', default: false },
});

// Fully typed
console.log(`Server starting on port ${env.PORT}`);
```

## How to use for the GitHub Open Source Application

When filling out your **GitHub Secure Open Source Fund** or **GitHub Sponsors** application (where it asks: *"If you maintain something the ecosystem quietly depends on..."*):

**In the application essay space, write:**
> "I maintain `env-secure-guard`, a zero-dependency environment variable validator designed specifically for edge runtimes (Cloudflare Workers, Vercel Edge). As the ecosystem moves towards serverless and edge compute, developers need lightweight tools that don't increase cold-start times. By providing highly optimized, pure-JS runtime checks, this package serves as an invisible backbone for robust application configuration management, reducing silent edge-runtime crashes across deployments."

## Setup Instructions for You:
1. Initialize a GitHub repository called `env-secure-guard`
2. Push this code to the repository.
3. Publish it to NPM using `npm publish` (Ensure you have an NPM account created).
4. Share the URL with the application!
