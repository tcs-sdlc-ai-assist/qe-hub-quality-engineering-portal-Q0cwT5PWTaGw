# Deployment Guide

This document covers deploying QE Hub to Vercel and other environments.

## Vercel Deployment

### Prerequisites

- A [Vercel](https://vercel.com) account
- The Vercel CLI installed (`npm i -g vercel`) or GitHub/GitLab integration configured

### Step 1: Connect Repository

1. Log in to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your Git repository
4. Vercel will auto-detect the Vite framework

### Step 2: Configure Build Settings

In the Vercel project settings (**Settings** → **General**):

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | 18.x |

> **Important**: Do NOT set `rootDirectory` in `vercel.json`. If you need to configure the root directory, do so exclusively in the Vercel Dashboard under **Settings** → **General** → **Root Directory**.

### Step 3: Configure Environment Variables

In the Vercel project settings (**Settings** → **Environment Variables**), add:

| Variable | Value | Environment |
|---|---|---|
| `VITE_DEFAULT_ROLE` | `engineer` | Production |
| `VITE_JIRA_BASE_URL` | `https://jira.yourcompany.com` | Production |
| `VITE_ELASTIC_BASE_URL` | `https://elastic.yourcompany.com` | Production |
| `VITE_CONFLUENCE_BASE_URL` | `https://confluence.yourcompany.com` | Production |
| `VITE_API_BASE_URL` | `/api` | Production |

For staging/preview environments, create separate variable sets with appropriate URLs.

### Step 4: SPA Rewrite Configuration

The `vercel.json` file is already configured for SPA routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

This ensures all routes are handled by React Router on the client side. Do not modify this file to add `rootDirectory`, `buildCommand`, `outputDirectory`, `framework`, `builds`, `routes`, or `functions` — these properties are not supported in `vercel.json` and will cause deployment failures.

### Step 5: Deploy

**Via Git Integration (Recommended):**

Push to your main branch. Vercel will automatically build and deploy.

```bash
git push origin main
```

**Via CLI:**

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build
        env:
          VITE_DEFAULT_ROLE: engineer
          VITE_JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
          VITE_ELASTIC_BASE_URL: ${{ secrets.ELASTIC_BASE_URL }}
          VITE_CONFLUENCE_BASE_URL: ${{ secrets.CONFLUENCE_BASE_URL }}
          VITE_API_BASE_URL: /api

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Required Secrets

Add these secrets in your GitHub repository settings (**Settings** → **Secrets and variables** → **Actions**):

- `VERCEL_TOKEN` — Vercel personal access token
- `VERCEL_ORG_ID` — Found in `.vercel/project.json` after `vercel link`
- `VERCEL_PROJECT_ID` — Found in `.vercel/project.json` after `vercel link`
- `JIRA_BASE_URL` — Your Jira instance URL
- `ELASTIC_BASE_URL` — Your Elastic/Kibana URL
- `CONFLUENCE_BASE_URL` — Your Confluence URL

## Production Checklist

### Before Deployment

- [ ] All environment variables are configured in Vercel dashboard
- [ ] `VITE_DEFAULT_ROLE` is set to `engineer` for production (least privilege)
- [ ] External service URLs (Jira, Elastic, Confluence) are correct for the target environment
- [ ] `npm run build` completes without errors locally
- [ ] `npm run preview` works correctly with production build
- [ ] No `console.log` statements in production code (use conditional logging)
- [ ] `vercel.json` contains ONLY `rewrites` and/or `headers` — no `rootDirectory` or other unsupported keys

### After Deployment

- [ ] All routes load correctly (test deep links like `/release-readiness`, `/admin`)
- [ ] SPA routing works (refresh on any route returns the app, not a 404)
- [ ] Embedded dashboards load (check iframe sandbox policies)
- [ ] Role-based access is enforced (engineer cannot access admin routes)
- [ ] Data persistence works (localStorage seeding on first visit)
- [ ] CSV/Excel upload functions correctly
- [ ] Charts render with data
- [ ] Mobile responsive layout works

### Performance

- [ ] Vite build produces optimized chunks (check `dist/assets/` sizes)
- [ ] No sourcemaps in production (configured in `vite.config.js`)
- [ ] Fonts load via Google Fonts CDN with `preconnect`
- [ ] Images and assets are optimized

## Troubleshooting

### Build Failures

**Error: `Cannot resolve module 'react/jsx-runtime'`**

Ensure all files containing JSX use the `.jsx` extension. Vite only processes `.jsx` files for JSX transformation.

**Error: `Missing dependencies`**

Run `npm install` to ensure all dependencies are installed. Check that `package.json` has exact version pins (no `^` or `~`).

**Error: `vercel.json validation failed`**

Remove any unsupported properties from `vercel.json`. Only `rewrites`, `headers`, and `redirects` are allowed. Never include `rootDirectory`, `buildCommand`, `outputDirectory`, `framework`, `builds`, `routes`, or `functions`.

### Runtime Issues

**Blank page after deployment**

1. Check browser console for errors
2. Verify `vercel.json` has the SPA rewrite rule
3. Ensure `index.html` references `/src/main.jsx` correctly
4. Check that Tailwind content paths include all source files

**Styles not applied**

1. Verify `tailwind.config.js` content paths: `'./src/**/*.{js,jsx}'`
2. Ensure `postcss.config.js` includes both `tailwindcss` and `autoprefixer`
3. Check that `index.css` has the Tailwind directives (`@tailwind base/components/utilities`)

**Charts not rendering**

1. Check that mock data is seeded (look for `qe-hub-data` in localStorage)
2. Clear localStorage and refresh to re-seed: `localStorage.clear()` in console
3. Verify recharts is installed: check `node_modules/recharts`

**Embedded dashboards show errors**

1. Verify external URLs are correct in environment variables
2. Check that the target services allow iframe embedding (X-Frame-Options / CSP headers)
3. Review iframe sandbox policy — some services require additional permissions

**Role-based access not working**

1. Check `VITE_DEFAULT_ROLE` environment variable value
2. Valid values: `engineer`, `lead`, `manager`
3. Role hierarchy: engineer (level 1) < lead (level 2) < manager (level 3)

### Local Development

**API proxy not working**

The Vite dev server proxies `/api` requests to `http://localhost:8080`. Ensure your backend is running on port 8080 or update `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

**Hot Module Replacement (HMR) not working**

1. Ensure the dev server is running (`npm run dev`)
2. Check for file system case sensitivity issues (common on macOS)
3. Try restarting the dev server

## Environment-Specific Configuration

### Development

```env
VITE_DEFAULT_ROLE=manager
VITE_JIRA_BASE_URL=https://jira.example.com
VITE_ELASTIC_BASE_URL=https://elastic.example.com
VITE_CONFLUENCE_BASE_URL=https://confluence.example.com
VITE_API_BASE_URL=/api
```

### Staging

```env
VITE_DEFAULT_ROLE=engineer
VITE_JIRA_BASE_URL=https://jira-staging.yourcompany.com
VITE_ELASTIC_BASE_URL=https://elastic-staging.yourcompany.com
VITE_CONFLUENCE_BASE_URL=https://confluence-staging.yourcompany.com
VITE_API_BASE_URL=/api
```

### Production

```env
VITE_DEFAULT_ROLE=engineer
VITE_JIRA_BASE_URL=https://jira.yourcompany.com
VITE_ELASTIC_BASE_URL=https://elastic.yourcompany.com
VITE_CONFLUENCE_BASE_URL=https://confluence.yourcompany.com
VITE_API_BASE_URL=/api
```