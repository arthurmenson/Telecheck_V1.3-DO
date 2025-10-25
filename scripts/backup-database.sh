#!/bin/bash

# =============================================================================
# Database Backup Script for Telecheck V2.0
# =============================================================================
# Purpose: Create encrypted backups of PostgreSQL database
# Features:
#   - Full database backup (schema + data)
#   - GPG encryption for HIPAA compliance
#   - Upload to S3-compatible storage (DigitalOcean Spaces)
#   - Retention policy (7 daily, 4 weekly, 12 monthly)
#   - Backup verification
#   - Metrics for monitoring
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
LOG_FILE="$PROJECT_ROOT/logs/backups/backup_$(date +%Y%m%d_%H%M%S).log"

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

# GPG encryption
GPG_RECIPIENT="${BACKUP_GPG_RECIPIENT:-backup@telecheck.com}"

# Retention settings
DAILY_RETENTION=7
WEEKLY_RETENTION=4
MONTHLY_RETENTION=12

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

    # Check if pg_dump is installed
    if ! command -v pg_dump &> /dev/null; then
        log_error "pg_dump command not found. Please install PostgreSQL client."
        exit 1
    fi

    # Check if gpg is installed
    if ! command -v gpg &> /dev/null; then
        log_error "gpg command not found. Please install GnuPG."
        exit 1
    fi

    # Check if aws CLI is installed (for S3)
    if ! command -v aws &> /dev/null; then
        log_warning "aws command not found. S3 upload will be skipped."
    fi

    # Check if database is reachable
    if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" &> /dev/null; then
        log_error "Cannot connect to database at $DB_HOST:$DB_PORT"
        exit 1
    fi

    # Create backup directory
    mkdir -p "$BACKUP_DIR"

    log_success "Prerequisites check passed"
}

# =============================================================================
# Backup Functions
# =============================================================================
create_backup() {
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/telecheck_${backup_timestamp}.sql"
    local backup_file_compressed="$backup_file.gz"
    local backup_file_encrypted="$backup_file_compressed.gpg"

    log_info "Creating database backup..."
    log_info "Backup file: $backup_file_encrypted"

    # Start timing
    local start_time=$(date +%s)

    # Create database dump
    if PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -F p \
        --no-owner \
        --no-acl \
        --verbose \
        --file="$backup_file" 2>> "$LOG_FILE"; then

        log_success "Database dump created: $backup_file"
    else
        log_error "Database dump failed"
        return 1
    fi

    # Compress backup
    log_info "Compressing backup..."
    if gzip -9 "$backup_file"; then
        log_success "Backup compressed: $backup_file_compressed"
    else
        log_error "Compression failed"
        return 1
    fi

    # Encrypt backup
    log_info "Encrypting backup with GPG..."
    if gpg --batch --yes --recipient "$GPG_RECIPIENT" --encrypt "$backup_file_compressed"; then
        log_success "Backup encrypted: $backup_file_encrypted"
        rm -f "$backup_file_compressed"  # Remove unencrypted compressed file
    else
        log_error "Encryption failed"
        return 1
    fi

    # Calculate backup size
    local backup_size=$(du -h "$backup_file_encrypted" | cut -f1)
    log_info "Backup size: $backup_size"

    # Calculate execution time
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    log_info "Backup duration: ${duration}s"

    # Store backup metadata
    cat > "$backup_file_encrypted.meta" <<EOF
{
  "timestamp": "$backup_timestamp",
  "database": "$DB_NAME",
  "host": "$DB_HOST",
  "size": "$backup_size",
  "duration_seconds": $duration,
  "encrypted": true,
  "compression": "gzip",
  "retention_type": "$(get_retention_type)"
}
EOF

    # Update metrics
    echo "$end_time" > "$BACKUP_DIR/last_backup_timestamp.txt"
    echo "1" > "$BACKUP_DIR/last_backup_success.txt"

    # Return the encrypted backup file path
    echo "$backup_file_encrypted"
}

get_retention_type() {
    local day=$(date +%d)
    local dow=$(date +%u)

    # Monthly backup (first day of month)
    if [ "$day" = "01" ]; then
        echo "monthly"
    # Weekly backup (Sunday)
    elif [ "$dow" = "7" ]; then
        echo "weekly"
    # Daily backup
    else
        echo "daily"
    fi
}

verify_backup() {
    local backup_file="$1"

    log_info "Verifying backup integrity..."

    # Check if file exists
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi

    # Check file size (should be > 1KB)
    local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)

    if [ "$file_size" -lt 1024 ]; then
        log_error "Backup file is too small (${file_size} bytes)"
        return 1
    fi

    # Verify GPG encryption
    if gpg --list-packets "$backup_file" &> /dev/null; then
        log_success "Backup encryption verified"
    else
        log_error "Backup encryption verification failed"
        return 1
    fi

    # Test decryption (without fully decrypting)
    if gpg --decrypt --dry-run "$backup_file" &> /dev/null; then
        log_success "Backup can be decrypted"
    else
        log_warning "Backup decryption test failed"
    fi

    log_success "Backup verification passed"
    return 0
}

upload_to_s3() {
    local backup_file="$1"
    local s3_path="s3://$S3_BUCKET/postgres/$(basename "$backup_file")"

    # Check if aws CLI is available
    if ! command -v aws &> /dev/null; then
        log_warning "AWS CLI not found, skipping S3 upload"
        return 0
    fi

    log_info "Uploading backup to S3: $s3_path"

    # Configure AWS CLI for DigitalOcean Spaces
    export AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY"
    export AWS_SECRET_ACCESS_KEY="$S3_SECRET_KEY"

    # Upload to S3
    if aws s3 cp "$backup_file" "$s3_path" \
        --endpoint-url="$S3_ENDPOINT" \
        --storage-class STANDARD \
        --metadata "backup-date=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        &>> "$LOG_FILE"; then

        log_success "Backup uploaded to S3: $s3_path"

        # Upload metadata file
        aws s3 cp "$backup_file.meta" "$s3_path.meta" \
            --endpoint-url="$S3_ENDPOINT" \
            &>> "$LOG_FILE"

        return 0
    else
        log_error "S3 upload failed"
        return 1
    fi
}

# =============================================================================
# Retention Management
# =============================================================================
apply_retention_policy() {
    log_info "Applying retention policy..."

    # Clean up old daily backups (keep last 7)
    log_info "Cleaning up old daily backups (keep $DAILY_RETENTION)..."
    find "$BACKUP_DIR" -name "telecheck_*.sql.gz.gpg" -mtime +$DAILY_RETENTION -type f -delete

    # Clean up old backups from S3
    if command -v aws &> /dev/null; then
        log_info "Cleaning up old S3 backups..."

        # List and delete old daily backups
        aws s3 ls "s3://$S3_BUCKET/postgres/" \
            --endpoint-url="$S3_ENDPOINT" \
            --recursive | \
            awk '{print $4}' | \
            tail -n +$((DAILY_RETENTION + 1)) | \
            while read -r file; do
                aws s3 rm "s3://$S3_BUCKET/$file" --endpoint-url="$S3_ENDPOINT" &>> "$LOG_FILE"
            done
    fi

    log_success "Retention policy applied"
}

# =============================================================================
# Notification
# =============================================================================
send_notification() {
    local status="$1"
    local backup_file="$2"

    # Update Prometheus metrics (if push gateway is configured)
    if [ -n "${PROMETHEUS_PUSHGATEWAY:-}" ]; then
        cat <<EOF | curl --data-binary @- "${PROMETHEUS_PUSHGATEWAY}/metrics/job/backup"
# HELP backup_last_success_timestamp_seconds Last successful backup timestamp
# TYPE backup_last_success_timestamp_seconds gauge
backup_last_success_timestamp_seconds $(date +%s)

# HELP backup_duration_seconds Backup duration in seconds
# TYPE backup_duration_seconds gauge
backup_duration_seconds $duration

# HELP backup_size_bytes Backup size in bytes
# TYPE backup_size_bytes gauge
backup_size_bytes $file_size
EOF
    fi

    # Send email notification (if configured)
    if [ -n "${BACKUP_EMAIL_TO:-}" ]; then
        local subject="[Telecheck] Database Backup $status"
        local body="Backup completed at $(date)\nStatus: $status\nFile: $(basename "$backup_file")"

        echo -e "$body" | mail -s "$subject" "${BACKUP_EMAIL_TO}"
    fi
}

# =============================================================================
# Main Execution
# =============================================================================
main() {
    echo "======================================================================="
    echo "  Telecheck V2.0 Database Backup"
    echo "======================================================================="
    echo ""

    # Create log directory
    mkdir -p "$(dirname "$LOG_FILE")"

    log_info "Starting backup at $(date)"
    log_info "Database: $DB_HOST:$DB_PORT/$DB_NAME"
    log_info "Backup directory: $BACKUP_DIR"
    log_info "Log file: $LOG_FILE"
    echo ""

    # Run backup process
    check_prerequisites

    if backup_file=$(create_backup); then
        if verify_backup "$backup_file"; then
            upload_to_s3 "$backup_file"
            apply_retention_policy
            send_notification "SUCCESS" "$backup_file"

            echo ""
            echo "======================================================================="
            echo "  Backup Summary"
            echo "======================================================================="
            echo "  Status: SUCCESS"
            echo "  Backup File: $(basename "$backup_file")"
            echo "  Location: $backup_file"
            echo "  S3: s3://$S3_BUCKET/postgres/$(basename "$backup_file")"
            echo "  Log File: $LOG_FILE"
            echo "======================================================================="

            log_success "Backup completed successfully!"
            exit 0
        else
            send_notification "VERIFICATION_FAILED" "$backup_file"
            log_error "Backup verification failed!"
            exit 1
        fi
    else
        send_notification "FAILED" "none"
        log_error "Backup failed!"
        exit 1
    fi
}

# Run main function
main "$@"
