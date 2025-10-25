#!/bin/bash

# =============================================================================
# HashiCorp Vault Initialization Script for Telecheck V2.0
# =============================================================================
# Purpose: Initialize Vault and store all encryption keys
# Features:
#   - Initialize Vault (generate unseal keys and root token)
#   - Unseal Vault
#   - Enable secrets engines (KV v2, Transit)
#   - Store PHI encryption keys
#   - Create policies for application access
#   - Enable audit logging
# IMPORTANT: Save unseal keys and root token in a secure location!
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VAULT_ADDR="${VAULT_ADDR:-http://localhost:8200}"
VAULT_KEYS_FILE="$PROJECT_ROOT/.vault-keys.json"
LOG_FILE="$PROJECT_ROOT/logs/vault-init_$(date +%Y%m%d_%H%M%S).log"

# =============================================================================
# Logging Functions
# =============================================================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $*" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*" | tee -a "$LOG_FILE"
}

# =============================================================================
# Utility Functions
# =============================================================================
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if vault CLI is installed
    if ! command -v vault &> /dev/null; then
        log_error "vault command not found. Please install HashiCorp Vault CLI."
        exit 1
    fi

    # Check if Vault server is reachable
    if ! curl -s "$VAULT_ADDR/v1/sys/health" &> /dev/null; then
        log_error "Cannot reach Vault server at $VAULT_ADDR"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

generate_encryption_key() {
    # Generate a 256-bit (32-byte) encryption key in hex format
    openssl rand -hex 32
}

# =============================================================================
# Vault Initialization
# =============================================================================
initialize_vault() {
    log_info "Initializing Vault..."

    # Check if Vault is already initialized
    local init_status=$(vault status -format=json 2>/dev/null | jq -r '.initialized' || echo "false")

    if [ "$init_status" = "true" ]; then
        log_warning "Vault is already initialized"

        if [ -f "$VAULT_KEYS_FILE" ]; then
            log_info "Loading existing Vault keys from $VAULT_KEYS_FILE"
            export VAULT_TOKEN=$(jq -r '.root_token' "$VAULT_KEYS_FILE")
            return 0
        else
            log_error "Vault is initialized but keys file not found!"
            log_error "Please provide the root token manually or restore from backup"
            exit 1
        fi
    fi

    # Initialize Vault with 5 key shares and 3 key threshold
    log_info "Initializing Vault with Shamir secret sharing (5 shares, threshold 3)..."

    local init_output=$(vault operator init -format=json -key-shares=5 -key-threshold=3)

    # Save keys and root token to file
    echo "$init_output" > "$VAULT_KEYS_FILE"
    chmod 600 "$VAULT_KEYS_FILE"

    log_success "Vault initialized successfully"
    log_warning "IMPORTANT: Unseal keys and root token saved to $VAULT_KEYS_FILE"
    log_warning "IMPORTANT: Backup this file securely and distribute unseal keys to key holders"

    # Extract root token
    export VAULT_TOKEN=$(echo "$init_output" | jq -r '.root_token')

    # Display unseal keys (they should be distributed securely)
    echo ""
    echo "======================================================================="
    echo "  VAULT UNSEAL KEYS (Save these securely!)"
    echo "======================================================================="
    echo "$init_output" | jq -r '.unseal_keys_b64[]' | nl
    echo "======================================================================="
    echo ""
}

unseal_vault() {
    log_info "Unsealing Vault..."

    # Check if Vault is sealed
    local sealed=$(vault status -format=json 2>/dev/null | jq -r '.sealed' || echo "true")

    if [ "$sealed" = "false" ]; then
        log_success "Vault is already unsealed"
        return 0
    fi

    # Load unseal keys from file
    if [ ! -f "$VAULT_KEYS_FILE" ]; then
        log_error "Vault keys file not found: $VAULT_KEYS_FILE"
        exit 1
    fi

    # Unseal with first 3 keys (threshold)
    log_info "Unsealing Vault with threshold keys..."

    for i in {0..2}; do
        local unseal_key=$(jq -r ".unseal_keys_b64[$i]" "$VAULT_KEYS_FILE")
        vault operator unseal "$unseal_key" &>> "$LOG_FILE"
    done

    # Verify unsealed
    sealed=$(vault status -format=json | jq -r '.sealed')

    if [ "$sealed" = "false" ]; then
        log_success "Vault unsealed successfully"
    else
        log_error "Failed to unseal Vault"
        exit 1
    fi
}

# =============================================================================
# Enable Secrets Engines
# =============================================================================
enable_secrets_engines() {
    log_info "Enabling secrets engines..."

    # Enable KV v2 for static secrets
    if vault secrets list | grep -q "secret/"; then
        log_info "KV v2 secrets engine already enabled at secret/"
    else
        vault secrets enable -version=2 -path=secret kv
        log_success "KV v2 secrets engine enabled at secret/"
    fi

    # Enable Transit for encryption as a service
    if vault secrets list | grep -q "transit/"; then
        log_info "Transit secrets engine already enabled"
    else
        vault secrets enable transit
        log_success "Transit secrets engine enabled"
    fi

    # Create encryption key in Transit
    if vault list transit/keys | grep -q "telecheck-phi"; then
        log_info "Transit encryption key already exists"
    else
        vault write -f transit/keys/telecheck-phi
        log_success "Transit encryption key created: telecheck-phi"
    fi
}

# =============================================================================
# Store Encryption Keys in Vault
# =============================================================================
store_encryption_keys() {
    log_info "Generating and storing PHI encryption keys..."

    # Generate encryption keys
    local PHI_PATIENT_KEY=$(generate_encryption_key)
    local PHI_MEDICAL_KEY=$(generate_encryption_key)
    local PHI_FINANCIAL_KEY=$(generate_encryption_key)
    local PHI_COMMUNICATION_KEY=$(generate_encryption_key)
    local BACKUP_ENCRYPTION_KEY=$(generate_encryption_key)
    local JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

    # Store PHI encryption keys
    vault kv put secret/telecheck/phi \
        patient_key="$PHI_PATIENT_KEY" \
        medical_key="$PHI_MEDICAL_KEY" \
        financial_key="$PHI_FINANCIAL_KEY" \
        communication_key="$PHI_COMMUNICATION_KEY" \
        created_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        rotation_due="$(date -u -d '+90 days' +%Y-%m-%dT%H:%M:%SZ)" &>> "$LOG_FILE"

    log_success "PHI encryption keys stored in Vault"

    # Store backup encryption key
    vault kv put secret/telecheck/backup \
        encryption_key="$BACKUP_ENCRYPTION_KEY" \
        created_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)" &>> "$LOG_FILE"

    log_success "Backup encryption key stored in Vault"

    # Store JWT secret
    vault kv put secret/telecheck/jwt \
        secret="$JWT_SECRET" \
        created_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)" &>> "$LOG_FILE"

    log_success "JWT secret stored in Vault"

    # Create .env snippet for easy integration
    cat > "$PROJECT_ROOT/.vault-env-snippet" <<EOF
# Vault Configuration (add to .env.production)
VAULT_ADDR=$VAULT_ADDR
VAULT_TOKEN=$VAULT_TOKEN
VAULT_ENABLED=true

# Encryption keys will be retrieved from Vault at runtime
# PHI_PATIENT_KEY - stored in secret/telecheck/phi
# PHI_MEDICAL_KEY - stored in secret/telecheck/phi
# PHI_FINANCIAL_KEY - stored in secret/telecheck/phi
# PHI_COMMUNICATION_KEY - stored in secret/telecheck/phi
# BACKUP_ENCRYPTION_KEY - stored in secret/telecheck/backup
# JWT_SECRET - stored in secret/telecheck/jwt
EOF

    log_success "Environment snippet created: $PROJECT_ROOT/.vault-env-snippet"
}

# =============================================================================
# Create Vault Policies
# =============================================================================
create_policies() {
    log_info "Creating Vault policies..."

    # API policy (read-only access to secrets)
    vault policy write telecheck-api - <<EOF
# Read access to PHI encryption keys
path "secret/data/telecheck/phi" {
  capabilities = ["read"]
}

# Read access to JWT secret
path "secret/data/telecheck/jwt" {
  capabilities = ["read"]
}

# Use transit encryption
path "transit/encrypt/telecheck-phi" {
  capabilities = ["update"]
}

path "transit/decrypt/telecheck-phi" {
  capabilities = ["update"]
}
EOF

    log_success "Created policy: telecheck-api"

    # Admin policy (full access for key rotation)
    vault policy write telecheck-admin - <<EOF
# Full access to all secrets
path "secret/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Full access to transit
path "transit/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Key rotation
path "transit/keys/*/rotate" {
  capabilities = ["update"]
}
EOF

    log_success "Created policy: telecheck-admin"

    # Backup policy (read access for backups)
    vault policy write telecheck-backup - <<EOF
# Read access to backup encryption key
path "secret/data/telecheck/backup" {
  capabilities = ["read"]
}
EOF

    log_success "Created policy: telecheck-backup"
}

# =============================================================================
# Enable Authentication Methods
# =============================================================================
enable_auth_methods() {
    log_info "Enabling authentication methods..."

    # Enable AppRole for application authentication
    if vault auth list | grep -q "approle/"; then
        log_info "AppRole auth method already enabled"
    else
        vault auth enable approle
        log_success "AppRole auth method enabled"
    fi

    # Create AppRole for Telecheck API
    vault write auth/approle/role/telecheck-api \
        token_policies="telecheck-api" \
        token_ttl=1h \
        token_max_ttl=4h \
        secret_id_ttl=0 &>> "$LOG_FILE"

    # Get Role ID and Secret ID
    local ROLE_ID=$(vault read -format=json auth/approle/role/telecheck-api/role-id | jq -r '.data.role_id')
    local SECRET_ID=$(vault write -format=json -f auth/approle/role/telecheck-api/secret-id | jq -r '.data.secret_id')

    # Save to file
    cat > "$PROJECT_ROOT/.vault-approle-creds" <<EOF
# AppRole Credentials for Telecheck API
VAULT_ROLE_ID=$ROLE_ID
VAULT_SECRET_ID=$SECRET_ID
EOF

    chmod 600 "$PROJECT_ROOT/.vault-approle-creds"

    log_success "AppRole created for telecheck-api"
    log_info "AppRole credentials saved to: $PROJECT_ROOT/.vault-approle-creds"
}

# =============================================================================
# Enable Audit Logging
# =============================================================================
enable_audit_logging() {
    log_info "Enabling audit logging..."

    # Create audit log directory
    mkdir -p "$PROJECT_ROOT/logs/vault"

    # Enable file audit backend
    if vault audit list | grep -q "file/"; then
        log_info "File audit device already enabled"
    else
        vault audit enable file file_path="$PROJECT_ROOT/logs/vault/audit.log"
        log_success "File audit device enabled"
    fi
}

# =============================================================================
# Main Execution
# =============================================================================
main() {
    echo "======================================================================="
    echo "  HashiCorp Vault Initialization for Telecheck V2.0"
    echo "======================================================================="
    echo ""

    # Create log directory
    mkdir -p "$(dirname "$LOG_FILE")"

    log_info "Starting Vault initialization at $(date)"
    log_info "Vault Address: $VAULT_ADDR"
    log_info "Log file: $LOG_FILE"
    echo ""

    # Run initialization steps
    check_prerequisites
    initialize_vault
    unseal_vault
    enable_secrets_engines
    store_encryption_keys
    create_policies
    enable_auth_methods
    enable_audit_logging

    echo ""
    echo "======================================================================="
    echo "  Vault Initialization Complete!"
    echo "======================================================================="
    echo "  Vault Address: $VAULT_ADDR"
    echo "  Root Token: $VAULT_TOKEN"
    echo "  Keys File: $VAULT_KEYS_FILE"
    echo "  AppRole Creds: $PROJECT_ROOT/.vault-approle-creds"
    echo "  Env Snippet: $PROJECT_ROOT/.vault-env-snippet"
    echo "======================================================================="
    echo ""
    log_warning "IMPORTANT SECURITY NOTES:"
    log_warning "1. Backup $VAULT_KEYS_FILE securely (contains unseal keys and root token)"
    log_warning "2. Distribute unseal keys to 5 different key holders"
    log_warning "3. Store root token in a password manager"
    log_warning "4. Rotate root token after initial setup"
    log_warning "5. Set up auto-unseal for production"
    log_warning "6. Enable MFA for Vault access"
    log_warning "7. Review and test disaster recovery procedures"
    echo ""

    log_success "Vault is ready for production use!"
}

# Run main function
main "$@"
