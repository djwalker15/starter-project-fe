# React + TypeScript + Vite + Vitest + GCP Cloud Run (GitHub Actions)

A reusable starter you can clone for any project. It includes:

- ⚛️ React + TypeScript + Vite
- 🧪 Vitest + React Testing Library
- 🧹 ESLint + Prettier
- 🐳 Dockerfile (Nginx) for static SPA
- 🚀 GitHub Actions CI (lint + test + build) and CD to **Google Cloud Run**
- 🔐 Auth via **Workload Identity Federation** (no long‑lived keys)

---

## Quick start

```bash
# dev
npm install
npm run dev

# tests
npm test

# build
npm run build

# preview
npm run preview
```

## Project layout

```
react-ts-gcp-starter/
├─ src/
│  ├─ components/Hello.tsx
│  ├─ __tests__/App.test.tsx
│  ├─ App.tsx
│  └─ main.tsx
├─ Dockerfile
├─ nginx.conf
├─ .github/workflows/ci-cd.yml
└─ ...
```

## CI/CD with Google Cloud Run

This repo deploys on **push to `main`**.

### 1) One‑time GCP setup

```bash
# Set these for convenience
PROJECT_ID=your-gcp-project-id
REGION=us-central1
SERVICE=react-ts-starter
REPO=docker

gcloud auth login
gcloud auth application-default login
gcloud config set project $PROJECT_ID

# Enable APIs
gcloud services enable run.googleapis.com artifactregistry.googleapis.com iamcredentials.googleapis.com

# Create Artifact Registry (if you want a custom repo name/region, change it)
gcloud artifacts repositories create $REPO --repository-format=docker --location=$REGION --description="Docker repo"

# Create a deployer service account
SA_NAME=gh-actions-deployer
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
gcloud iam service-accounts create $SA_NAME --display-name="GitHub Actions Deployer"

# Grant minimum roles
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/run.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/iam.serviceAccountUser"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/artifactregistry.writer"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/viewer"
```

### 2) Configure Workload Identity Federation (no JSON keys)

Replace `ORG/REPO` with your GitHub org and repo.

```bash
POOL_ID=github-pool
PROVIDER_ID=github-provider

# Create pool
gcloud iam workload-identity-pools create $POOL_ID   --project=$PROJECT_ID   --location=global   --display-name="GitHub OIDC Pool"

# Create provider for GitHub
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_ID   --project=$PROJECT_ID   --location=global   --workload-identity-pool=$POOL_ID   --display-name="GitHub Provider"   --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.actor=assertion.actor,attribute.ref=assertion.ref"   --issuer-uri="https://token.actions.githubusercontent.com"

# Allow repo to impersonate the SA (main branch pushes)
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL   --project=$PROJECT_ID   --role="roles/iam.workloadIdentityUser"   --member="principalSet://iam.googleapis.com/projects/$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')/locations/global/workloadIdentityPools/$POOL_ID/attribute.repository/ORG/REPO"
```

### 3) Configure GitHub repository variables

In your repo Settings → **Secrets and variables → Actions → Variables**, add:

- `GCP_PROJECT_ID` = your project id
- `GCP_REGION` = (e.g.) `us-central1`
- `CLOUD_RUN_SERVICE` = (e.g.) `react-ts-starter`
- `ARTIFACT_REPO` = (e.g.) `docker`
- `GCP_WIF_PROVIDER` = `projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/<POOL_ID>/providers/<PROVIDER_ID>`
- `GCP_SERVICE_ACCOUNT` = `<SA_NAME>@<PROJECT_ID>.iam.gserviceaccount.com`

> Note: These are **Variables** (not Secrets) since they’re not sensitive. Keep service account email public, but lock down the Workload Identity policy to your specific repo as above.

### 4) First deployment

Push to `main`. The workflow will:
1. Lint, test, build
2. Build Docker image
3. Push to Artifact Registry
4. Deploy to Cloud Run (public URL output in job logs)

You can also deploy locally:

```bash
docker build -t local/react-ts-starter .
docker run -p 8080:8080 local/react-ts-starter
```

---

## Customizing

- Update `SERVICE` or `REGION` via GitHub Actions Variables (no YAML edits).
- Add more checks in CI (typecheck, e2e, etc.).
- For Firebase Hosting or Cloud Storage + Cloud CDN, swap the deploy step.

## Troubleshooting

- **`PERMISSION_DENIED: iam.serviceAccounts.getAccessToken`**  
  Ensure your GitHub repo is authorized in the Workload Identity Pool and the SA has `roles/iam.workloadIdentityUser` binding for that principalSet.

- **`denied: Permission denied for "artifactregistry"`**  
  Grant `roles/artifactregistry.writer` to the deployer SA and run `gcloud auth configure-docker <region>-docker.pkg.dev` in the workflow.

- **`Cloud Run service not found`**  
  First deploy will create it. Ensure `run.googleapis.com` API is enabled and region is supported by Cloud Run.

---

MIT © You
