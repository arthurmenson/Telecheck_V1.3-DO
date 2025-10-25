#!/bin/bash

# =============================================================================
# Database Migration Runner for Telecheck V2.0
# =============================================================================
# Purpose: Run all PostgreSQL migrations in order with validation
# Features:
#   - Automatic backup before running migrations
#   - Runs all 10 migrations in sequence
#   - Validates each migration success
#   - Rollback on failure
#   - Comprehensive logging
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$PROJECT_ROOT/server/database/migrations"
LOG_FILE="$PROJECT_ROOT/logs/migrations/migration_$(date +%Y%m%d_%H%M%S).log"
BACKUP_DIR="$PROJECT_ROOT/backups/pre-migration"

# Database connection (from environment or .env.production)
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-telecheck_prod}"
DB_USER="${DB_USER:-telecheck_admin}"
DB_PASSWORD="${DB_PASSWORD}"

# Migration files in order
MIGRATIONS=(
    "001_mfa_schema.sql"
    "002_enable_encryption.sql"
    "003_encrypt_phi_columns.sql"
    "004_audit_logging.sql"
    "005_audit_triggers.sql"
    "006_rbac_tables.sql"
    "007_smart_consent.sql"
    "008_password_policy.sql"
    "009_brute_force_protection.sql"
    "010_kms_integration.sql"
)

# =============================================================================
# Logging Functions
# =============================================================================
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*" | tee -a "$LOG_FILE"
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

    # Check if database is reachable
    if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" &> /dev/null; then
        log_error "Cannot connect to database at $DB_HOST:$DB_PORT"
        exit 1
    fi

    # Check if migrations directory exists
    if [ ! -d "$MIGRATIONS_DIR" ]; then
        log_error "Migrations directory not found: $MIGRATIONS_DIR"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

create_backup() {
    log_info "Creating backup before running migrations..."

    # Create backup directory
    mkdir -p "$BACKUP_DIR"

    # Backup filename
    local backup_file="$BACKUP_DIR/pre_migration_$(date +%Y%m%d_%H%M%S).sql"

    # Create backup
    if PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F p -f "$backup_file"; then
        log_success "Backup created: $backup_file"
        echo "$backup_file" > "$BACKUP_DIR/latest_backup.txt"
    else
        log_error "Failed to create backup"
        exit 1
    fi
}

create_migration_tracking_table() {
    log_info "Creating migration tracking table..."

    local sql="
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id SERIAL PRIMARY KEY,
            migration_name VARCHAR(255) NOT NULL UNIQUE,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            execution_time_ms INTEGER,
            success BOOLEAN DEFAULT TRUE,
            error_message TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at
        ON schema_migrations(applied_at);

        CREATE INDEX IF NOT EXISTS idx_schema_migrations_name
        ON schema_migrations(migration_name);
    "

    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$sql" &>> "$LOG_FILE"; then
        log_success "Migration tracking table ready"
    else
        log_error "Failed to create migration tracking table"
        exit 1
    fi
}

is_migration_applied() {
    local migration_name="$1"
    local result=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM schema_migrations WHERE migration_name = '$migration_name' AND success = TRUE;" 2>/dev/null | xargs)

    if [ "$result" = "1" ]; then
        return 0  # Migration already applied
    else
        return 1  # Migration not applied
    fi
}

run_migration() {
    local migration_file="$1"
    local migration_path="$MIGRATIONS_DIR/$migration_file"

    log_info "Running migration: $migration_file"

    # Check if migration file exists
    if [ ! -f "$migration_path" ]; then
        log_error "Migration file not found: $migration_path"
        return 1
    fi

    # Check if already applied
    if is_migration_applied "$migration_file"; then
        log_warning "Migration $migration_file already applied, skipping..."
        return 0
    fi

    # Record start time
    local start_time=$(date +%s%3N)

    # Run migration
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration_path" &>> "$LOG_FILE"; then
        # Calculate execution time
        local end_time=$(date +%s%3N)
        local execution_time=$((end_time - start_time))

        # Record success in tracking table
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
            "INSERT INTO schema_migrations (migration_name, execution_time_ms, success) VALUES ('$migration_file', $execution_time, TRUE);" &>> "$LOG_FILE"

        log_success "Migration $migration_file completed in ${execution_time}ms"
        return 0
    else
        # Record failure in tracking table
        local error_msg="Migration failed - check logs for details"
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
            "INSERT INTO schema_migrations (migration_name, success, error_message) VALUES ('$migration_file', FALSE, '$error_msg');" &>> "$LOG_FILE" || true

        log_error "Migration $migration_file failed"
        return 1
    fi
}

rollback_to_backup() {
    log_warning "Rolling back to backup..."

    local backup_file=$(cat "$BACKUP_DIR/latest_backup.txt" 2>/dev/null)

    if [ -z "$backup_file" ] || [ ! -f "$backup_file" ]; then
        log_error "No backup file found for rollback"
        return 1
    fi

    log_info "Restoring from: $backup_file"

    # Drop and recreate database (use with caution)
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME}_backup;" &>> "$LOG_FILE" && \
       PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE ${DB_NAME}_backup;" &>> "$LOG_FILE" && \
       PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "${DB_NAME}_backup" -f "$backup_file" &>> "$LOG_FILE"; then
        log_success "Rollback successful. Database restored to ${DB_NAME}_backup"
        log_warning "Please verify the backup database and manually switch if needed"
        return 0
    else
        log_error "Rollback failed"
        return 1
    fi
}

run_all_migrations() {
    log_info "Starting migration process..."
    local failed=0

    for migration in "${MIGRATIONS[@]}"; do
        if ! run_migration "$migration"; then
            log_error "Migration process stopped due to failure: $migration"
            failed=1
            break
        fi
    done

    if [ $failed -eq 1 ]; then
        log_error "Migration process failed. Attempting rollback..."
        rollback_to_backup
        return 1
    fi

    log_success "All migrations completed successfully!"
    return 0
}

verify_migrations() {
    log_info "Verifying applied migrations..."

    local applied_count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM schema_migrations WHERE success = TRUE;" | xargs)

    log_info "Applied migrations: $applied_count / ${#MIGRATIONS[@]}"

    # List applied migrations
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT migration_name, applied_at, execution_time_ms FROM schema_migrations WHERE success = TRUE ORDER BY applied_at;" | tee -a "$LOG_FILE"
}

# =============================================================================
# Main Execution
# =============================================================================
main() {
    echo "======================================================================="
    echo "  Telecheck V2.0 Database Migration Runner"
    echo "======================================================================="
    echo ""

    # Create log directory
    mkdir -p "$(dirname "$LOG_FILE")"

    log_info "Starting migration process at $(date)"
    log_info "Database: $DB_HOST:$DB_PORT/$DB_NAME"
    log_info "User: $DB_USER"
    log_info "Migrations directory: $MIGRATIONS_DIR"
    log_info "Log file: $LOG_FILE"

    # Run migration steps
    check_prerequisites
    create_migration_tracking_table
    create_backup

    if run_all_migrations; then
        verify_migrations
        log_success "Migration process completed successfully!"
        echo ""
        echo "======================================================================="
        echo "  Migration Summary"
        echo "======================================================================="
        echo "  Status: SUCCESS"
        echo "  Total Migrations: ${#MIGRATIONS[@]}"
        echo "  Log File: $LOG_FILE"
        echo "======================================================================="
        exit 0
    else
        log_error "Migration process failed!"
        echo ""
        echo "======================================================================="
        echo "  Migration Summary"
        echo "======================================================================="
        echo "  Status: FAILED"
        echo "  Log File: $LOG_FILE"
        echo "  Please review the logs and restore from backup if needed"
        echo "======================================================================="
        exit 1
    fi
}

# Run main function
main "$@"
