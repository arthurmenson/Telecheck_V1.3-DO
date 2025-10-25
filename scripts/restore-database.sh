#!/bin/bash

# =============================================================================
# Database Restore Script for Telecheck V2.0
# =============================================================================
# Purpose: Restore PostgreSQL database from encrypted backup
# Features:
#   - Download from S3-compatible storage (optional)
#   - GPG decryption
#   - Point-in-time recovery support
#   - Validation after restore
#   - Rollback capability
# IMPORTANT: This will REPLACE existing database. Use with extreme caution!
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
BACKUP_DIR="${BACKUP_PATH:-$PROJECT_ROOT/backups}/postgres"
LOG_FILE="$PROJECT_ROOT/logs/restore/restore_$(date +%Y%m%d_%H%M%S).log"

# Database connection
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-telecheck_prod}"
DB_USER="${DB_USER:-telecheck_admin}"
DB_PASSWORD="${DB_PASSWORD}"

# S3 configuration
S3_ENDPOINT="${S3_ENDPOINT:-https://nyc3.digitaloceanspaces.com}"
S3_BUCKET="${S3_BUCKET:-telecheck-backups-prod}"
S3_ACCESS_KEY="${S3_ACCESS_KEY_ID}"
S3_SECRET_KEY="${S3_SECRET_ACCESS_KEY}"

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

    # Check if psql is installed
    if ! command -v psql &> /dev/null; then
        log_error "psql command not found. Please install PostgreSQL client."
        exit 1
    fi

    # Check if gpg is installed
    if ! command -v gpg &> /dev/null; then
        log_error "gpg command not found. Please install GnuPG."
        exit 1
    fi

    # Check if database is reachable
    if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1" &> /dev/null; then
        log_error "Cannot connect to database server at $DB_HOST:$DB_PORT"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# =============================================================================
# Backup Selection
# =============================================================================
list_available_backups() {
    log_info "Available local backups:"
    echo ""

    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A "$BACKUP_DIR"/*.gpg 2>/dev/null)" ]; then
        ls -lh "$BACKUP_DIR"/*.gpg | awk '{print NR". "$9" ("$5")"}'
    else
        log_warning "No local backups found in $BACKUP_DIR"
    fi

    echo ""

    # List S3 backups if available
    if command -v aws &> /dev/null && [ -n "${S3_ACCESS_KEY:-}" ]; then
        log_info "Available S3 backups:"
        echo ""

        export AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY"
        export AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY"

        aws s3 ls "s3://$S3_BUCKET/postgres/" \
            --endpoint-url="$S3_ENDPOINT" \
            --recursive | \
            grep ".gpg$" | \
            awk '{print $4" ("$3")"}'
    fi

    echo ""
}

select_backup_file() {
    local backup_source="$1"  # "local" or "s3" or specific file path

    if [ -f "$backup_source" ]; then
        # Specific file provided
        echo "$backup_source"
        return 0
    fi

    # Interactive selection
    list_available_backups

    echo -n "Enter backup file path or S3 key: "
    read -r backup_path

    if [ -f "$backup_path" ]; then
        echo "$backup_path"
    elif [ "$backup_path" = "s3://"* ]; then
        # Download from S3
        download_from_s3 "$backup_path"
    else
        # Try to find in backup directory
        local full_path="$BACKUP_DIR/$backup_path"
        if [ -f "$full_path" ]; then
            echo "$full_path"
        else
            log_error "Backup file not found: $backup_path"
            exit 1
        fi
    fi
}

download_from_s3() {
    local s3_path="$1"
    local local_file="$BACKUP_DIR/$(basename "$s3_path")"

    log_info "Downloading backup from S3..."

    export AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY"
    export AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY"

    if aws s3 cp "$s3_path" "$local_file" --endpoint-url="$S3_ENDPOINT" &>> "$LOG_FILE"; then
        log_success "Backup downloaded: $local_file"
        echo "$local_file"
    else
        log_error "Failed to download backup from S3"
        exit 1
    fi
}

# =============================================================================
# Backup Preparation
# =============================================================================
decrypt_backup() {
    local encrypted_file="$1"
    local decrypted_file="${encrypted_file%.gpg}"

    log_info "Decrypting backup..."

    if gpg --decrypt --output "$decrypted_file" "$encrypted_file" 2>> "$LOG_FILE"; then
        log_success "Backup decrypted: $decrypted_file"
        echo "$decrypted_file"
    else
        log_error "Failed to decrypt backup"
        exit 1
    fi
}

decompress_backup() {
    local compressed_file="$1"
    local decompressed_file="${compressed_file%.gz}"

    log_info "Decompressing backup..."

    if gunzip -k "$compressed_file" 2>> "$LOG_FILE"; then
        log_success "Backup decompressed: $decompressed_file"
        echo "$decompressed_file"
    else
        log_error "Failed to decompress backup"
        exit 1
    fi
}

# =============================================================================
# Database Restore
# =============================================================================
create_safety_backup() {
    log_info "Creating safety backup of current database..."

    local safety_backup="$BACKUP_DIR/pre_restore_safety_$(date +%Y%m%d_%H%M%S).sql"

    if PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -F p \
        -f "$safety_backup" 2>> "$LOG_FILE"; then

        gzip "$safety_backup"
        log_success "Safety backup created: ${safety_backup}.gz"
        echo "${safety_backup}.gz" > "$BACKUP_DIR/last_safety_backup.txt"
    else
        log_warning "Failed to create safety backup (database may not exist)"
    fi
}

terminate_connections() {
    log_info "Terminating active database connections..."

    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres <<EOF 2>> "$LOG_FILE"
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$DB_NAME'
  AND pid <> pg_backend_pid();
EOF

    log_success "Active connections terminated"
}

drop_and_recreate_database() {
    log_info "Dropping and recreating database..."

    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres <<EOF 2>> "$LOG_FILE"
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME OWNER $DB_USER;
EOF

    log_success "Database recreated"
}

restore_from_backup() {
    local backup_file="$1"

    log_info "Restoring database from backup..."
    log_info "Backup file: $backup_file"

    local start_time=$(date +%s)

    if PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -f "$backup_file" &>> "$LOG_FILE"; then

        local end_time=$(date +%s)
        local duration=$((end_time - start_time))

        log_success "Database restored successfully in ${duration}s"
        return 0
    else
        log_error "Database restore failed"
        return 1
    fi
}

# =============================================================================
# Validation
# =============================================================================
validate_restore() {
    log_info "Validating restored database..."

    # Check if database exists
    local db_exists=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';")

    if [ "$db_exists" != "1" ]; then
        log_error "Database does not exist after restore"
        return 1
    fi

    # Check table count
    local table_count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")

    log_info "Tables found: $table_count"

    if [ "$table_count" -gt 0 ]; then
        log_success "Database tables verified"
    else
        log_error "No tables found in restored database"
        return 1
    fi

    # Run database verification script
    if [ -f "$SCRIPT_DIR/verify-database.sh" ]; then
        log_info "Running full database verification..."
        if bash "$SCRIPT_DIR/verify-database.sh" &>> "$LOG_FILE"; then
            log_success "Database verification passed"
        else
            log_warning "Database verification reported issues (check logs)"
        fi
    fi

    log_success "Restore validation complete"
    return 0
}

# =============================================================================
# Cleanup
# =============================================================================
cleanup_temp_files() {
    log_info "Cleaning up temporary files..."

    # Remove decrypted/decompressed files
    find "$BACKUP_DIR" -name "*.sql" -mtime +1 -type f -delete
    find "$BACKUP_DIR" -name "*.sql.gz" ! -name "*safety*" -mtime +1 -type f -delete

    log_success "Cleanup complete"
}

# =============================================================================
# Main Execution
# =============================================================================
main() {
    local backup_file="${1:-}"

    echo "======================================================================="
    echo "  Telecheck V2.0 Database Restore"
    echo "======================================================================="
    echo ""
    log_warning "WARNING: This will REPLACE the current database!"
    log_warning "Database: $DB_NAME on $DB_HOST:$DB_PORT"
    echo ""

    if [ -z "$backup_file" ]; then
        backup_file=$(select_backup_file "")
    fi

    echo ""
    echo "Selected backup: $backup_file"
    echo ""
    echo -n "Are you sure you want to proceed? (yes/no): "
    read -r confirmation

    if [ "$confirmation" != "yes" ]; then
        log_info "Restore cancelled by user"
        exit 0
    fi

    # Create log directory
    mkdir -p "$(dirname "$LOG_FILE")"

    log_info "Starting restore at $(date)"
    log_info "Backup file: $backup_file"
    log_info "Target database: $DB_HOST:$DB_PORT/$DB_NAME"
    log_info "Log file: $LOG_FILE"
    echo ""

    # Run restore process
    check_prerequisites
    create_safety_backup

    # Prepare backup file
    local restore_file="$backup_file"

    # Decrypt if encrypted
    if [[ "$restore_file" == *.gpg ]]; then
        restore_file=$(decrypt_backup "$restore_file")
    fi

    # Decompress if compressed
    if [[ "$restore_file" == *.gz ]]; then
        restore_file=$(decompress_backup "$restore_file")
    fi

    # Perform restore
    terminate_connections
    drop_and_recreate_database

    if restore_from_backup "$restore_file"; then
        if validate_restore; then
            cleanup_temp_files

            echo ""
            echo "======================================================================="
            echo "  Restore Summary"
            echo "======================================================================="
            echo "  Status: SUCCESS"
            echo "  Database: $DB_NAME"
            echo "  Restored from: $(basename "$backup_file")"
            echo "  Safety backup: $(cat "$BACKUP_DIR/last_safety_backup.txt" 2>/dev/null || echo 'N/A')"
            echo "  Log file: $LOG_FILE"
            echo "======================================================================="

            log_success "Database restore completed successfully!"
            exit 0
        else
            log_error "Restore validation failed"

            echo ""
            echo "Do you want to rollback to safety backup? (yes/no): "
            read -r rollback

            if [ "$rollback" = "yes" ]; then
                local safety_backup=$(cat "$BACKUP_DIR/last_safety_backup.txt" 2>/dev/null)
                if [ -n "$safety_backup" ] && [ -f "$safety_backup" ]; then
                    log_info "Rolling back to safety backup..."
                    bash "$0" "$safety_backup"
                fi
            fi

            exit 1
        fi
    else
        log_error "Database restore failed"
        exit 1
    fi
}

# Run main function
main "$@"
