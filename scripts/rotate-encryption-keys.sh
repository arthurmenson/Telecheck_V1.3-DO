#!/bin/bash

###############################################################################
# Encryption Key Rotation Script
# Automates the rotation of PHI encryption keys per HIPAA compliance (90-day policy)
#
# Usage:
#   ./rotate-encryption-keys.sh [--category <phi_patient|phi_medical|phi_financial|phi_communication>] [--dry-run]
#
# Created: 2025-10-25
###############################################################################

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="${PROJECT_ROOT}/logs/encryption"
LOG_FILE="${LOG_DIR}/key-rotation-$(date +%Y%m%d-%H%M%S).log"
BACKUP_DIR="${PROJECT_ROOT}/backups/encryption-keys"

# Default values
DRY_RUN=false
CATEGORY=""
FORCE=false

# Create necessary directories
mkdir -p "$LOG_DIR"
mkdir -p "$BACKUP_DIR"

###############################################################################
# Logging functions
###############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

###############################################################################
# Parse command line arguments
###############################################################################

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --category)
                CATEGORY="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

show_help() {
    cat << EOF
Encryption Key Rotation Script

Usage: $0 [OPTIONS]

OPTIONS:
    --category <cat>    Rotate keys for specific category (phi_patient, phi_medical, phi_financial, phi_communication)
                        If not specified, checks all categories and rotates those needing rotation
    --dry-run           Show what would be rotated without actually rotating
    --force             Force rotation even if not due yet
    --help              Show this help message

EXAMPLES:
    # Check and rotate all keys that need rotation
    $0

    # Rotate specific category
    $0 --category phi_patient

    # Dry run to see what would be rotated
    $0 --dry-run

    # Force rotation of all keys
    $0 --force

ENVIRONMENT VARIABLES:
    DATABASE_URL or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD - Database connection
    PHI_PATIENT_KEY     - Patient PHI encryption key
    PHI_MEDICAL_KEY     - Medical PHI encryption key
    PHI_FINANCIAL_KEY   - Financial PHI encryption key
    PHI_COMMUNICATION_KEY - Communication PHI encryption key

EOF
}

###############################################################################
# Database connection helpers
###############################################################################

check_database_connection() {
    log_info "Checking database connection..."

    if [ -z "${DATABASE_URL:-}" ] && [ -z "${DB_HOST:-}" ]; then
        log_error "Database connection not configured. Set DATABASE_URL or DB_* variables."
        exit 1
    fi

    # Test connection using psql
    if command -v psql &> /dev/null; then
        if [ -n "${DATABASE_URL:-}" ]; then
            if ! psql "$DATABASE_URL" -c "SELECT 1" &> /dev/null; then
                log_error "Cannot connect to database using DATABASE_URL"
                exit 1
            fi
        else
            if ! PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT:-5432}" -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT 1" &> /dev/null; then
                log_error "Cannot connect to database using DB_* variables"
                exit 1
            fi
        fi
    else
        log_warning "psql not found, skipping connection test"
    fi

    log_success "Database connection OK"
}

run_sql() {
    local sql="$1"

    if [ -n "${DATABASE_URL:-}" ]; then
        psql "$DATABASE_URL" -t -c "$sql"
    else
        PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT:-5432}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "$sql"
    fi
}

###############################################################################
# Key management functions
###############################################################################

check_encryption_keys() {
    log_info "Checking encryption key environment variables..."

    local missing_keys=()

    for key_var in PHI_PATIENT_KEY PHI_MEDICAL_KEY PHI_FINANCIAL_KEY PHI_COMMUNICATION_KEY; do
        if [ -z "${!key_var:-}" ]; then
            missing_keys+=("$key_var")
        fi
    done

    if [ ${#missing_keys[@]} -gt 0 ]; then
        log_error "Missing encryption key environment variables: ${missing_keys[*]}"
        log_error "All encryption keys must be set before rotation"
        exit 1
    fi

    log_success "All encryption keys are set"
}

generate_new_key() {
    # Generate a cryptographically secure 256-bit key (64 hex characters)
    openssl rand -hex 32
}

backup_current_key() {
    local category="$1"
    local key_var="${category^^}_KEY"
    local backup_file="${BACKUP_DIR}/${category}_$(date +%Y%m%d-%H%M%S).key.enc"

    log_info "Backing up current key for $category..."

    # Encrypt the current key using a master backup key
    if [ -n "${BACKUP_ENCRYPTION_KEY:-}" ]; then
        echo "${!key_var}" | openssl enc -aes-256-cbc -salt -pbkdf2 -pass "pass:${BACKUP_ENCRYPTION_KEY}" -out "$backup_file"
        log_success "Key backed up to $backup_file"
    else
        log_warning "BACKUP_ENCRYPTION_KEY not set, skipping encrypted backup"
        echo "${!key_var}" > "$backup_file"
        chmod 600 "$backup_file"
        log_success "Key backed up (unencrypted) to $backup_file"
    fi
}

get_key_rotation_status() {
    local category="$1"
    local key_name="${category}_key"

    log_info "Checking rotation status for $category..."

    local result=$(run_sql "
        SELECT
            key_name,
            COALESCE(EXTRACT(DAYS FROM (CURRENT_TIMESTAMP - COALESCE(rotated_at, created_at)))::INTEGER, 0) as days_since_rotation,
            key_version
        FROM encryption_keys
        WHERE key_name LIKE '${key_name}%'
        AND is_active = TRUE
        ORDER BY key_version DESC
        LIMIT 1
    ")

    if [ -z "$result" ]; then
        log_warning "No active key found for $category"
        echo "0|0|0"
        return
    fi

    echo "$result" | tr -s ' ' | tr ' ' '|'
}

needs_rotation() {
    local days_since_rotation="$1"
    local rotation_threshold=90

    if [ "$FORCE" = true ]; then
        return 0
    fi

    if [ "$days_since_rotation" -ge "$rotation_threshold" ]; then
        return 0
    fi

    return 1
}

rotate_key_in_database() {
    local category="$1"
    local key_name="${category}_key"

    log_info "Rotating key in database for $category..."

    if [ "$DRY_RUN" = true ]; then
        log_info "DRY RUN: Would rotate key $key_name"
        return 0
    fi

    local result=$(run_sql "SELECT rotate_encryption_key('${key_name}_v1')")
    local new_version=$(echo "$result" | tr -d ' ')

    if [ -n "$new_version" ] && [ "$new_version" -gt 0 ]; then
        log_success "Key rotated in database, new version: $new_version"
        return 0
    else
        log_error "Failed to rotate key in database"
        return 1
    fi
}

update_key_in_environment() {
    local category="$1"
    local new_key="$2"
    local key_var="${category^^}_KEY"

    log_info "Updating key in environment for $category..."

    if [ "$DRY_RUN" = true ]; then
        log_info "DRY RUN: Would update $key_var"
        return 0
    fi

    # Update .env file if it exists
    local env_files=(".env" ".env.production")

    for env_file in "${env_files[@]}"; do
        local env_path="${PROJECT_ROOT}/${env_file}"

        if [ -f "$env_path" ]; then
            log_info "Updating $env_file..."

            # Create backup
            cp "$env_path" "${env_path}.backup-$(date +%Y%m%d-%H%M%S)"

            # Update or add key
            if grep -q "^${key_var}=" "$env_path"; then
                sed -i.bak "s|^${key_var}=.*|${key_var}=${new_key}|" "$env_path"
            else
                echo "${key_var}=${new_key}" >> "$env_path"
            fi

            log_success "Updated $env_file"
        fi
    done

    log_warning "IMPORTANT: New key generated for $key_var"
    log_warning "New key (store securely): $new_key"
    log_warning "Update this key in your deployment environment (Kubernetes secrets, env vars, etc.)"
}

reencrypt_data() {
    local category="$1"

    log_info "Re-encrypting data for $category..."

    if [ "$DRY_RUN" = true ]; then
        log_info "DRY RUN: Would re-encrypt data for $category"
        return 0
    fi

    log_warning "Data re-encryption not yet implemented in this script"
    log_warning "Use the application's migration tools to re-encrypt existing data"
    log_warning "Or run: npm run migrate:reencrypt -- --category $category"

    return 0
}

rotate_category() {
    local category="$1"

    log_info "=========================================="
    log_info "Processing category: $category"
    log_info "=========================================="

    # Get current status
    local status=$(get_key_rotation_status "$category")
    IFS='|' read -r key_name days_since_rotation version <<< "$status"

    days_since_rotation=$(echo "$days_since_rotation" | tr -d ' ')

    log_info "Current status: Key version $version, $days_since_rotation days since last rotation"

    # Check if rotation is needed
    if needs_rotation "$days_since_rotation"; then
        log_warning "Key rotation needed (${days_since_rotation} days since last rotation)"

        # Backup current key
        backup_current_key "$category"

        # Generate new key
        local new_key=$(generate_new_key)
        log_success "Generated new encryption key"

        # Rotate in database
        if rotate_key_in_database "$category"; then
            # Update environment
            update_key_in_environment "$category" "$new_key"

            # Re-encrypt existing data
            reencrypt_data "$category"

            log_success "Key rotation completed for $category"
            return 0
        else
            log_error "Key rotation failed for $category"
            return 1
        fi
    else
        local days_remaining=$((90 - days_since_rotation))
        log_info "Key rotation not needed ($days_remaining days remaining)"
        return 0
    fi
}

###############################################################################
# Main execution
###############################################################################

main() {
    log_info "=========================================="
    log_info "Encryption Key Rotation Script"
    log_info "Started at: $(date)"
    log_info "=========================================="

    # Parse arguments
    parse_args "$@"

    # Pre-flight checks
    check_database_connection
    check_encryption_keys

    # Determine which categories to process
    local categories=()

    if [ -n "$CATEGORY" ]; then
        categories=("$CATEGORY")
        log_info "Processing single category: $CATEGORY"
    else
        categories=("phi_patient" "phi_medical" "phi_financial" "phi_communication")
        log_info "Processing all categories"
    fi

    # Process each category
    local success_count=0
    local failure_count=0

    for cat in "${categories[@]}"; do
        if rotate_category "$cat"; then
            ((success_count++))
        else
            ((failure_count++))
        fi
    done

    # Summary
    log_info "=========================================="
    log_info "Key Rotation Summary"
    log_info "=========================================="
    log_success "Successful rotations: $success_count"

    if [ $failure_count -gt 0 ]; then
        log_error "Failed rotations: $failure_count"
    else
        log_info "Failed rotations: $failure_count"
    fi

    log_info "Log file: $LOG_FILE"
    log_info "Completed at: $(date)"

    if [ $failure_count -gt 0 ]; then
        exit 1
    fi

    exit 0
}

# Run main function
main "$@"
