# DigitalOcean Database and Environment Setup Script (PowerShell)
# Automates complete whale-app database configuration

param(
    [string]$Environment = "dev"  # dev or prod
)

$ErrorActionPreference = "Stop"

# Configuration
$APP_NAME = "whale-app"
$REGION = "nyc3"
$PG_CLUSTER_NAME = "telecheck-postgres-cluster"
$REDIS_CLUSTER_NAME = "telecheck-redis-cluster"
$DATABASE_NAME = "telecheck"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "Telecheck DigitalOcean Setup Script" -ForegroundColor Blue
Write-Host "Environment: $Environment" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Step 1: Check doctl
Write-Host "[1/9] Checking doctl..." -ForegroundColor Yellow
try {
    $null = doctl version
    Write-Host "✓ doctl found" -ForegroundColor Green
} catch {
    Write-Host "Error: doctl not found" -ForegroundColor Red
    Write-Host "Install from: https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
}
Write-Host ""

# Step 2: Get whale-app ID
Write-Host "[2/9] Finding whale-app..." -ForegroundColor Yellow
$apps = doctl apps list --format ID,Spec.Name --no-header | Out-String
$appLine = $apps -split "`n" | Where-Object { $_ -match $APP_NAME } | Select-Object -First 1
if (-not $appLine) {
    Write-Host "Error: whale-app not found" -ForegroundColor Red
    doctl apps list
    exit 1
}
$APP_ID = ($appLine -split '\s+')[0]
Write-Host "✓ Found whale-app: $APP_ID" -ForegroundColor Green
Write-Host ""

# Step 3: Check PostgreSQL cluster
Write-Host "[3/9] Checking PostgreSQL cluster..." -ForegroundColor Yellow
$dbs = doctl databases list --format ID,Name --no-header | Out-String
$pgLine = $dbs -split "`n" | Where-Object { $_ -match $PG_CLUSTER_NAME } | Select-Object -First 1

if (-not $pgLine) {
    Write-Host "PostgreSQL cluster not found. Creating..." -ForegroundColor Yellow

    if ($Environment -eq "prod") {
        $PG_SIZE = "db-s-4vcpu-8gb"  # Production
        $PG_NODES = 2
    } else {
        $PG_SIZE = "db-s-1vcpu-1gb"  # Dev
        $PG_NODES = 1
    }

    Write-Host "Creating PostgreSQL 15 cluster:"
    Write-Host "  Name: $PG_CLUSTER_NAME"
    Write-Host "  Size: $PG_SIZE"
    Write-Host "  Region: $REGION"
    Write-Host "  Nodes: $PG_NODES"

    doctl databases create $PG_CLUSTER_NAME `
        --engine pg `
        --version 15 `
        --region $REGION `
        --size $PG_SIZE `
        --num-nodes $PG_NODES

    Write-Host "Waiting for PostgreSQL cluster (5-10 minutes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60

    for ($i = 1; $i -le 30; $i++) {
        $dbs = doctl databases list --format ID,Name,Status --no-header | Out-String
        $pgLine = $dbs -split "`n" | Where-Object { $_ -match $PG_CLUSTER_NAME } | Select-Object -First 1
        $status = ($pgLine -split '\s+')[2]

        if ($status -eq "online") {
            Write-Host "✓ PostgreSQL cluster is online" -ForegroundColor Green
            break
        }
        Write-Host "Waiting... ($i/30) Status: $status"
        Start-Sleep -Seconds 20
    }
} else {
    Write-Host "✓ PostgreSQL cluster exists" -ForegroundColor Green
}

$dbs = doctl databases list --format ID,Name --no-header | Out-String
$pgLine = $dbs -split "`n" | Where-Object { $_ -match $PG_CLUSTER_NAME } | Select-Object -First 1
$PG_CLUSTER_ID = ($pgLine -split '\s+')[0]
Write-Host ""

# Step 4: Check Redis cluster
Write-Host "[4/9] Checking Redis cluster..." -ForegroundColor Yellow
$dbs = doctl databases list --format ID,Name --no-header | Out-String
$redisLine = $dbs -split "`n" | Where-Object { $_ -match $REDIS_CLUSTER_NAME } | Select-Object -First 1

if (-not $redisLine) {
    Write-Host "Redis cluster not found. Creating..." -ForegroundColor Yellow

    if ($Environment -eq "prod") {
        $REDIS_SIZE = "db-s-2vcpu-2gb"  # Production
        $REDIS_NODES = 2
    } else {
        $REDIS_SIZE = "db-s-1vcpu-1gb"  # Dev
        $REDIS_NODES = 1
    }

    Write-Host "Creating Redis 7 cluster:"
    Write-Host "  Name: $REDIS_CLUSTER_NAME"
    Write-Host "  Size: $REDIS_SIZE"
    Write-Host "  Region: $REGION"
    Write-Host "  Nodes: $REDIS_NODES"

    doctl databases create $REDIS_CLUSTER_NAME `
        --engine redis `
        --version 7 `
        --region $REGION `
        --size $REDIS_SIZE `
        --num-nodes $REDIS_NODES

    Write-Host "Waiting for Redis cluster (5-10 minutes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60

    for ($i = 1; $i -le 30; $i++) {
        $dbs = doctl databases list --format ID,Name,Status --no-header | Out-String
        $redisLine = $dbs -split "`n" | Where-Object { $_ -match $REDIS_CLUSTER_NAME } | Select-Object -First 1
        $status = ($redisLine -split '\s+')[2]

        if ($status -eq "online") {
            Write-Host "✓ Redis cluster is online" -ForegroundColor Green
            break
        }
        Write-Host "Waiting... ($i/30) Status: $status"
        Start-Sleep -Seconds 20
    }
} else {
    Write-Host "✓ Redis cluster exists" -ForegroundColor Green
}

$dbs = doctl databases list --format ID,Name --no-header | Out-String
$redisLine = $dbs -split "`n" | Where-Object { $_ -match $REDIS_CLUSTER_NAME } | Select-Object -First 1
$REDIS_CLUSTER_ID = ($redisLine -split '\s+')[0]
Write-Host ""

# Step 5: Create telecheck database
Write-Host "[5/9] Creating 'telecheck' database..." -ForegroundColor Yellow
try {
    doctl databases db create $PG_CLUSTER_ID $DATABASE_NAME
} catch {
    Write-Host "Database may already exist (OK)"
}
Write-Host "✓ Database configured" -ForegroundColor Green
Write-Host ""

# Step 6: Get connection strings
Write-Host "[6/9] Getting database connection strings..." -ForegroundColor Yellow

$PG_HOST = (doctl databases get $PG_CLUSTER_ID --format PrivateHost --no-header).Trim()
$PG_PORT = (doctl databases get $PG_CLUSTER_ID --format Port --no-header).Trim()
$PG_USER = (doctl databases get $PG_CLUSTER_ID --format User --no-header).Trim()
$PG_PASSWORD = (doctl databases get $PG_CLUSTER_ID --format Password --no-header).Trim()

$DATABASE_URL = "postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${DATABASE_NAME}?sslmode=require"

$REDIS_HOST = (doctl databases get $REDIS_CLUSTER_ID --format PrivateHost --no-header).Trim()
$REDIS_PORT = (doctl databases get $REDIS_CLUSTER_ID --format Port --no-header).Trim()
$REDIS_PASSWORD = (doctl databases get $REDIS_CLUSTER_ID --format Password --no-header).Trim()

$REDIS_URL = "rediss://default:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}"

Write-Host "✓ Connection strings retrieved" -ForegroundColor Green
Write-Host ""

# Step 7: Generate secrets
Write-Host "[7/9] Generating application secrets..." -ForegroundColor Yellow

function Get-RandomHex {
    param([int]$Length)
    $bytes = New-Object byte[] ($Length / 2)
    [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
    return [BitConverter]::ToString($bytes).Replace("-", "").ToLower()
}

function Get-RandomBase64 {
    param([int]$Length)
    $bytes = New-Object byte[] $Length
    [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

$JWT_SECRET = Get-RandomHex -Length 64
$PHI_PATIENT_KEY = Get-RandomBase64 -Length 32
$PHI_MEDICAL_KEY = Get-RandomBase64 -Length 32
$PHI_FINANCIAL_KEY = Get-RandomBase64 -Length 32
$PHI_COMMUNICATION_KEY = Get-RandomBase64 -Length 32

Write-Host "✓ Secrets generated" -ForegroundColor Green
Write-Host ""

# Step 8: Create environment file
Write-Host "[8/9] Creating environment variables file..." -ForegroundColor Yellow

$ENV_FILE = ".env.whale-app-$Environment"
$date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$envContent = @"
# DigitalOcean whale-app Environment Variables
# Generated: $date
# Environment: $Environment

# Database
DATABASE_URL=$DATABASE_URL

# Redis
REDIS_URL=$REDIS_URL

# JWT
JWT_SECRET=$JWT_SECRET

# PHI Encryption Keys
PHI_PATIENT_KEY=$PHI_PATIENT_KEY
PHI_MEDICAL_KEY=$PHI_MEDICAL_KEY
PHI_FINANCIAL_KEY=$PHI_FINANCIAL_KEY
PHI_COMMUNICATION_KEY=$PHI_COMMUNICATION_KEY

# Application
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Optional: Keycloak (configure if using SSO)
# KEYCLOAK_URL=
# KEYCLOAK_REALM=telecheck
# KEYCLOAK_CLIENT_ID=
# KEYCLOAK_CLIENT_SECRET=

# Optional: Vault (configure if using HashiCorp Vault)
# VAULT_ADDR=
# VAULT_TOKEN=
"@

$envContent | Out-File -FilePath $ENV_FILE -Encoding UTF8

Write-Host "✓ Environment file created: $ENV_FILE" -ForegroundColor Green
Write-Host ""

# Step 9: Summary
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Database Clusters Created:" -ForegroundColor Blue
Write-Host "  PostgreSQL: $PG_CLUSTER_ID"
Write-Host "  Redis:      $REDIS_CLUSTER_ID"
Write-Host ""
Write-Host "Environment Variables:" -ForegroundColor Blue
Write-Host "  File: $ENV_FILE"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Set environment variables in DigitalOcean console:"
Write-Host "   https://cloud.digitalocean.com/apps/$APP_ID/settings/whale-app"
Write-Host ""
Write-Host "2. Copy variables from: $ENV_FILE"
Write-Host ""
Write-Host "3. In the DigitalOcean console:"
Write-Host "   - Go to Apps → whale-app → Settings"
Write-Host "   - Scroll to 'App-Level Environment Variables'"
Write-Host "   - Click 'Edit'"
Write-Host "   - Add each variable from $ENV_FILE"
Write-Host "   - Mark sensitive vars as encrypted"
Write-Host ""
Write-Host "4. Save and redeploy whale-app"
Write-Host ""
Write-Host "Cost Estimate ($Environment):" -ForegroundColor Blue
if ($Environment -eq "prod") {
    Write-Host "  PostgreSQL: ~`$120/month (4GB RAM)"
    Write-Host "  Redis:      ~`$60/month (2GB RAM)"
    Write-Host "  Total DBs:  ~`$180/month"
} else {
    Write-Host "  PostgreSQL: ~`$15/month (1GB RAM)"
    Write-Host "  Redis:      ~`$15/month (1GB RAM)"
    Write-Host "  Total DBs:  ~`$30/month"
}
Write-Host ""
Write-Host "All database resources are ready!" -ForegroundColor Green
Write-Host ""
