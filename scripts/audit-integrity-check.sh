#!/bin/bash
#
# Audit Log Integrity Verification Script
# Verifies cryptographic hash chain to detect tampering
# HIPAA 45 CFR § 164.312(c)(1) - Integrity controls
#

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-telecheck}"
DB_USER="${DB_USER:-postgres}"
LOG_FILE="/var/log/telecheck/audit-integrity-$(date +%Y%m%d).log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

echo "=================================================="
echo "Audit Log Integrity Verification"
echo "HIPAA Compliance - 45 CFR § 164.312(c)(1)"
echo "=================================================="
echo ""

log "Starting integrity verification..."

# Function to verify full integrity
verify_full_integrity() {
    log "Running full integrity check..."

    RESULT=$(PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -t -c "SELECT * FROM verify_audit_integrity()")

    # Parse result
    IS_VALID=$(echo "$RESULT" | awk -F'|' '{print $1}' | tr -d ' ()')
    TOTAL_EVENTS=$(echo "$RESULT" | awk -F'|' '{print $2}' | tr -d ' ')
    INVALID_EVENTS=$(echo "$RESULT" | awk -F'|' '{print $3}' | tr -d ' ')
    FIRST_INVALID=$(echo "$RESULT" | awk -F'|' '{print $4}' | tr -d ' ')

    echo ""
    echo "Integrity Check Results:"
    echo "========================"
    echo "Total events checked: $TOTAL_EVENTS"
    echo "Invalid events found: $INVALID_EVENTS"

    if [ "$IS_VALID" == "t" ]; then
        echo -e "${GREEN}✓ INTEGRITY VERIFIED - No tampering detected${NC}"
        log "SUCCESS: Integrity verified for $TOTAL_EVENTS events"
        return 0
    else
        echo -e "${RED}✗ INTEGRITY FAILURE - Tampering detected!${NC}"
        echo -e "${RED}First invalid event number: $FIRST_INVALID${NC}"
        log "CRITICAL: Integrity check FAILED - $INVALID_EVENTS invalid events detected"
        log "CRITICAL: First invalid event at: $FIRST_INVALID"

        # Send alert (implement based on your alerting system)
        send_alert "CRITICAL: Audit log tampering detected!"

        return 1
    fi
}

# Function to verify recent events (last 24 hours)
verify_recent() {
    log "Verifying recent events (last 24 hours)..."

    # Get event numbers from last 24 hours
    START_EVENT=$(PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -t -c "SELECT MIN(event_number) FROM audit_events WHERE timestamp > NOW() - INTERVAL '24 hours'" | tr -d ' ')

    END_EVENT=$(PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -t -c "SELECT MAX(event_number) FROM audit_events WHERE timestamp > NOW() - INTERVAL '24 hours'" | tr -d ' ')

    if [ -z "$START_EVENT" ] || [ "$START_EVENT" == "" ]; then
        echo -e "${YELLOW}⚠ No events in last 24 hours${NC}"
        log "WARNING: No events found in last 24 hours"
        return 0
    fi

    RESULT=$(PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -t -c "SELECT * FROM verify_audit_integrity($START_EVENT, $END_EVENT)")

    IS_VALID=$(echo "$RESULT" | awk -F'|' '{print $1}' | tr -d ' ()')
    TOTAL_EVENTS=$(echo "$RESULT" | awk -F'|' '{print $2}' | tr -d ' ')

    echo ""
    echo "Recent Events Check:"
    echo "===================="
    echo "Events verified: $TOTAL_EVENTS"

    if [ "$IS_VALID" == "t" ]; then
        echo -e "${GREEN}✓ Recent events integrity verified${NC}"
        log "SUCCESS: Recent events verified ($TOTAL_EVENTS events)"
        return 0
    else
        echo -e "${RED}✗ Recent events integrity FAILED${NC}"
        log "CRITICAL: Recent events integrity check FAILED"
        return 1
    fi
}

# Function to send alerts (customize based on your infrastructure)
send_alert() {
    local message=$1

    # Log to system log
    logger -t "audit-integrity" -p user.crit "$message"

    # TODO: Implement your alerting mechanism:
    # - Send email to security team
    # - Post to Slack/Teams channel
    # - Trigger PagerDuty/OpsGenie incident
    # - Write to security SIEM

    echo -e "${RED}ALERT: $message${NC}"
}

# Get statistics
get_statistics() {
    log "Gathering audit log statistics..."

    echo ""
    echo "Audit Log Statistics:"
    echo "====================="

    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -c "
        SELECT
            COUNT(*) as total_events,
            COUNT(DISTINCT user_id) as unique_users,
            COUNT(*) FILTER (WHERE phi_accessed = TRUE) as phi_access_count,
            MIN(timestamp) as oldest_event,
            MAX(timestamp) as newest_event,
            COUNT(*) FILTER (WHERE timestamp > NOW() - INTERVAL '24 hours') as events_last_24h,
            COUNT(*) FILTER (WHERE action IN ('LOGIN_FAILED', 'MFA_FAILED')) as security_events,
            pg_size_pretty(pg_total_relation_size('audit_events')) as total_size
        FROM audit_events;
    "

    echo ""
}

# Check for suspicious patterns
check_suspicious_patterns() {
    log "Checking for suspicious patterns..."

    echo ""
    echo "Suspicious Activity Check:"
    echo "=========================="

    # Check for excessive failed logins from single IP
    echo ""
    echo "Failed logins by IP (last 24 hours):"
    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -c "
        SELECT
            ip_address,
            COUNT(*) as failed_attempts,
            MIN(timestamp) as first_attempt,
            MAX(timestamp) as last_attempt
        FROM audit_events
        WHERE action = 'LOGIN_FAILED'
          AND timestamp > NOW() - INTERVAL '24 hours'
        GROUP BY ip_address
        HAVING COUNT(*) >= 5
        ORDER BY failed_attempts DESC
        LIMIT 10;
    "

    # Check for unusual PHI access patterns
    echo ""
    echo "High-volume PHI access (last 24 hours):"
    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -c "
        SELECT
            user_id,
            user_email,
            COUNT(*) as phi_access_count,
            COUNT(DISTINCT resource_id) as unique_records_accessed
        FROM audit_events
        WHERE phi_accessed = TRUE
          AND timestamp > NOW() - INTERVAL '24 hours'
        GROUP BY user_id, user_email
        HAVING COUNT(*) > 100
        ORDER BY phi_access_count DESC
        LIMIT 10;
    "

    # Check for after-hours access
    echo ""
    echo "After-hours PHI access (10pm-6am):"
    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -c "
        SELECT
            user_id,
            user_email,
            resource_type,
            COUNT(*) as access_count
        FROM audit_events
        WHERE phi_accessed = TRUE
          AND timestamp > NOW() - INTERVAL '7 days'
          AND EXTRACT(HOUR FROM timestamp) NOT BETWEEN 6 AND 22
        GROUP BY user_id, user_email, resource_type
        ORDER BY access_count DESC
        LIMIT 10;
    "
}

# Main execution
main() {
    local mode=${1:-full}

    case "$mode" in
        full)
            get_statistics
            verify_full_integrity
            check_suspicious_patterns
            ;;
        recent)
            verify_recent
            ;;
        stats)
            get_statistics
            ;;
        suspicious)
            check_suspicious_patterns
            ;;
        *)
            echo "Usage: $0 {full|recent|stats|suspicious}"
            echo ""
            echo "  full       - Complete integrity check + statistics + suspicious activity"
            echo "  recent     - Quick check of last 24 hours"
            echo "  stats      - Display statistics only"
            echo "  suspicious - Check for suspicious patterns"
            exit 1
            ;;
    esac

    local exit_code=$?

    echo ""
    echo "=================================================="
    log "Integrity check completed"
    echo "Log file: $LOG_FILE"
    echo "=================================================="

    exit $exit_code
}

# Run main function
main "$@"
