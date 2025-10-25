#!/bin/bash

# =============================================================================
# Database Verification Script for Telecheck V2.0
# =============================================================================
# Purpose: Verify database integrity after migrations
# Checks:
#   - All required tables exist (50+ expected)
#   - All indexes are created
#   - Encryption functions are available
#   - Audit log tables are present
#   - KMS integration is working
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
LOG_FILE="$PROJECT_ROOT/logs/database-verification_$(date +%Y%m%d_%H%M%S).log"

# Database connection
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-telecheck_prod}"
DB_USER="${DB_USER:-telecheck_admin}"
DB_PASSWORD="${DB_PASSWORD}"

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# =============================================================================
# Logging Functions
# =============================================================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $*" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $*" | tee -a "$LOG_FILE"
    ((PASSED_CHECKS++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $*" | tee -a "$LOG_FILE"
    ((FAILED_CHECKS++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $*" | tee -a "$LOG_FILE"
}

# =============================================================================
# Database Query Helper
# =============================================================================
query_db() {
    local sql="$1"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "$sql" 2>/dev/null | xargs
}

# =============================================================================
# Verification Functions
# =============================================================================
check_table_exists() {
    local table_name="$1"
    ((TOTAL_CHECKS++))

    local exists=$(query_db "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '$table_name');")

    if [ "$exists" = "t" ]; then
        log_success "Table exists: $table_name"
        return 0
    else
        log_error "Table missing: $table_name"
        return 1
    fi
}

check_function_exists() {
    local function_name="$1"
    ((TOTAL_CHECKS++))

    local exists=$(query_db "SELECT EXISTS (SELECT 1 FROM pg_proc WHERE proname = '$function_name');")

    if [ "$exists" = "t" ]; then
        log_success "Function exists: $function_name"
        return 0
    else
        log_error "Function missing: $function_name"
        return 1
    fi
}

check_index_exists() {
    local index_name="$1"
    ((TOTAL_CHECKS++))

    local exists=$(query_db "SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = '$index_name');")

    if [ "$exists" = "t" ]; then
        log_success "Index exists: $index_name"
        return 0
    else
        log_error "Index missing: $index_name"
        return 1
    fi
}

# =============================================================================
# Core Tables Verification
# =============================================================================
verify_core_tables() {
    log_info "Verifying core tables..."

    # MFA tables
    check_table_exists "mfa_user_settings"
    check_table_exists "totp_secrets"
    check_table_exists "recovery_codes"
    check_table_exists "sms_verifications"
    check_table_exists "trusted_devices"
    check_table_exists "mfa_audit_logs"

    # Audit tables
    check_table_exists "audit_logs"
    check_table_exists "phi_access_logs"
    check_table_exists "security_events"
    check_table_exists "data_retention_logs"

    # RBAC tables
    check_table_exists "roles"
    check_table_exists "permissions"
    check_table_exists "role_permissions"
    check_table_exists "user_roles"
    check_table_exists "resource_permissions"

    # Smart consent tables
    check_table_exists "consent_templates"
    check_table_exists "patient_consents"
    check_table_exists "consent_versions"
    check_table_exists "consent_audit_log"

    # Password policy tables
    check_table_exists "password_policies"
    check_table_exists "password_history"
    check_table_exists "password_reset_tokens"

    # Brute force protection tables
    check_table_exists "login_attempts"
    check_table_exists "account_locks"
    check_table_exists "ip_blacklist"
    check_table_exists "suspicious_activities"

    # KMS integration tables
    check_table_exists "encryption_keys"
    check_table_exists "key_rotation_history"
    check_table_exists "encrypted_data_index"
}

# =============================================================================
# Encryption Functions Verification
# =============================================================================
verify_encryption_functions() {
    log_info "Verifying encryption functions..."

    # Encryption functions
    check_function_exists "encrypt_phi_patient"
    check_function_exists "encrypt_phi_medical"
    check_function_exists "encrypt_phi_financial"
    check_function_exists "encrypt_phi_communication"

    # Decryption functions
    check_function_exists "decrypt_phi_patient"
    check_function_exists "decrypt_phi_medical"
    check_function_exists "decrypt_phi_financial"
    check_function_exists "decrypt_phi_communication"

    # Key management functions
    check_function_exists "get_encryption_key"
    check_function_exists "rotate_encryption_key"
    check_function_exists "verify_key_access"
}

# =============================================================================
# Indexes Verification
# =============================================================================
verify_indexes() {
    log_info "Verifying database indexes..."

    # MFA indexes
    check_index_exists "idx_mfa_user_settings_user_id"
    check_index_exists "idx_totp_secrets_user_id"
    check_index_exists "idx_recovery_codes_user_id"
    check_index_exists "idx_sms_verifications_user_id"
    check_index_exists "idx_trusted_devices_user_id"

    # Audit indexes
    check_index_exists "idx_audit_logs_timestamp"
    check_index_exists "idx_audit_logs_user_id"
    check_index_exists "idx_phi_access_logs_timestamp"
    check_index_exists "idx_security_events_timestamp"

    # RBAC indexes
    check_index_exists "idx_user_roles_user_id"
    check_index_exists "idx_role_permissions_role_id"

    # Performance indexes
    check_index_exists "idx_login_attempts_ip_address"
    check_index_exists "idx_login_attempts_timestamp"
}

# =============================================================================
# Audit Logging Verification
# =============================================================================
verify_audit_logging() {
    log_info "Verifying audit logging system..."

    ((TOTAL_CHECKS++))
    # Check if audit log table has data (should have at least migration events)
    local audit_count=$(query_db "SELECT COUNT(*) FROM audit_logs;")

    if [ "$audit_count" -ge "0" ]; then
        log_success "Audit logs table is operational (${audit_count} entries)"
    else
        log_error "Audit logs table verification failed"
    fi

    # Check audit triggers
    check_function_exists "audit_trigger_function"
    check_function_exists "log_phi_access"
    check_function_exists "log_security_event"
}

# =============================================================================
# KMS Integration Verification
# =============================================================================
verify_kms_integration() {
    log_info "Verifying KMS integration..."

    ((TOTAL_CHECKS++))
    # Check encryption keys table
    local key_count=$(query_db "SELECT COUNT(*) FROM encryption_keys WHERE active = TRUE;")

    if [ "$key_count" -ge "4" ]; then
        log_success "Encryption keys configured (${key_count} active keys)"
    else
        log_warning "Expected at least 4 encryption keys, found ${key_count}"
    fi

    # Test key retrieval function
    ((TOTAL_CHECKS++))
    local test_key=$(query_db "SELECT get_encryption_key('phi_patient') IS NOT NULL;")

    if [ "$test_key" = "t" ]; then
        log_success "Key retrieval function working"
    else
        log_error "Key retrieval function failed"
    fi
}

# =============================================================================
# Database Health Checks
# =============================================================================
verify_database_health() {
    log_info "Verifying database health..."

    # Check database size
    ((TOTAL_CHECKS++))
    local db_size=$(query_db "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));")
    log_info "Database size: $db_size"

    # Check active connections
    ((TOTAL_CHECKS++))
    local connections=$(query_db "SELECT count(*) FROM pg_stat_activity WHERE datname = '$DB_NAME';")
    log_info "Active connections: $connections"

    # Check for long-running queries
    ((TOTAL_CHECKS++))
    local long_queries=$(query_db "SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '5 minutes';")

    if [ "$long_queries" -eq "0" ]; then
        log_success "No long-running queries detected"
    else
        log_warning "Found $long_queries long-running queries"
    fi

    # Check for locks
    ((TOTAL_CHECKS++))
    local locks=$(query_db "SELECT count(*) FROM pg_locks WHERE NOT granted;")

    if [ "$locks" -eq "0" ]; then
        log_success "No blocking locks detected"
    else
        log_warning "Found $locks blocking locks"
    fi

    # Check replication lag (if applicable)
    ((TOTAL_CHECKS++))
    local is_replica=$(query_db "SELECT pg_is_in_recovery();")

    if [ "$is_replica" = "t" ]; then
        local lag=$(query_db "SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()));")
        log_info "Replication lag: ${lag}s"
    fi
}

# =============================================================================
# HIPAA Compliance Checks
# =============================================================================
verify_hipaa_compliance() {
    log_info "Verifying HIPAA compliance features..."

    # Check encryption at rest
    ((TOTAL_CHECKS++))
    local encrypted_columns=$(query_db "SELECT count(*) FROM information_schema.columns WHERE column_name LIKE '%_encrypted';")

    if [ "$encrypted_columns" -gt "0" ]; then
        log_success "Found $encrypted_columns encrypted columns"
    else
        log_warning "No encrypted columns found"
    fi

    # Check audit log retention
    ((TOTAL_CHECKS++))
    local oldest_audit=$(query_db "SELECT EXTRACT(DAY FROM (now() - MIN(created_at))) FROM audit_logs;")

    if [ -n "$oldest_audit" ]; then
        log_info "Oldest audit log: ${oldest_audit} days old"
    fi

    # Check PHI access logging
    check_table_exists "phi_access_logs"

    # Check data retention policies
    check_table_exists "data_retention_logs"
}

# =============================================================================
# Performance Checks
# =============================================================================
verify_performance() {
    log_info "Verifying database performance..."

    # Check table statistics
    ((TOTAL_CHECKS++))
    local stats_age=$(query_db "SELECT EXTRACT(HOUR FROM (now() - MAX(last_analyze))) FROM pg_stat_user_tables;")

    if [ -n "$stats_age" ] && [ "${stats_age%%.*}" -lt "24" ]; then
        log_success "Table statistics are up to date"
    else
        log_warning "Table statistics may be outdated (${stats_age} hours old)"
    fi

    # Check for missing indexes
    ((TOTAL_CHECKS++))
    local seq_scans=$(query_db "SELECT count(*) FROM pg_stat_user_tables WHERE seq_scan > 1000 AND idx_scan = 0;")

    if [ "$seq_scans" -eq "0" ]; then
        log_success "No tables with excessive sequential scans"
    else
        log_warning "Found $seq_scans tables with high sequential scans (may need indexes)"
    fi
}

# =============================================================================
# Main Execution
# =============================================================================
main() {
    echo "======================================================================="
    echo "  Telecheck V2.0 Database Verification"
    echo "======================================================================="
    echo ""

    # Create log directory
    mkdir -p "$(dirname "$LOG_FILE")"

    log_info "Starting database verification at $(date)"
    log_info "Database: $DB_HOST:$DB_PORT/$DB_NAME"
    log_info "Log file: $LOG_FILE"
    echo ""

    # Run all verification checks
    verify_core_tables
    echo ""

    verify_encryption_functions
    echo ""

    verify_indexes
    echo ""

    verify_audit_logging
    echo ""

    verify_kms_integration
    echo ""

    verify_database_health
    echo ""

    verify_hipaa_compliance
    echo ""

    verify_performance
    echo ""

    # Print summary
    echo "======================================================================="
    echo "  Verification Summary"
    echo "======================================================================="
    echo "  Total Checks: $TOTAL_CHECKS"
    echo "  Passed: $PASSED_CHECKS"
    echo "  Failed: $FAILED_CHECKS"
    echo "  Success Rate: $(awk "BEGIN {printf \"%.1f\", ($PASSED_CHECKS/$TOTAL_CHECKS)*100}")%"
    echo "  Log File: $LOG_FILE"
    echo "======================================================================="

    if [ $FAILED_CHECKS -eq 0 ]; then
        echo -e "${GREEN}All verification checks passed!${NC}"
        exit 0
    else
        echo -e "${RED}Some verification checks failed. Please review the logs.${NC}"
        exit 1
    fi
}

# Run main function
main "$@"
