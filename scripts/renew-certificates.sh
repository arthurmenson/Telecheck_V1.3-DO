#!/bin/bash

###############################################################################
# Certificate Renewal Script for Telecheck V2.0
# Manually renew Let's Encrypt certificates and reload services
# Can be run as a cron job or manually
###############################################################################

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
INFRASTRUCTURE_DIR="$PROJECT_ROOT/infrastructure"
LOG_FILE="/var/log/certbot-renewal.log"

# Options
FORCE=false
DRY_RUN=false
VERBOSE=false

# Print colored message
print_message() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

log_message() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $@" | tee -a "$LOG_FILE"
}

# Print usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Renew Let's Encrypt SSL/TLS certificates for Telecheck

OPTIONS:
    -f, --force                 Force renewal even if not near expiry
    -n, --dry-run               Perform a dry run without making changes
    -v, --verbose               Enable verbose output
    -h, --help                  Show this help message

EXAMPLES:
    # Standard renewal (only renews if near expiry)
    $0

    # Force renewal
    $0 --force

    # Dry run
    $0 --dry-run

EOF
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--force)
            FORCE=true
            shift
            ;;
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            print_message "$RED" "Unknown option: $1"
            usage
            ;;
    esac
done

# Print header
print_message "$BLUE" "==================================================="
print_message "$BLUE" "Certificate Renewal for Telecheck V2.0"
print_message "$BLUE" "==================================================="
echo ""

log_message "Starting certificate renewal process"

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    print_message "$RED" "Error: Docker is not installed"
    log_message "ERROR: Docker is not installed"
    exit 1
fi

# Check for existing certificates
CERT_DIR="$INFRASTRUCTURE_DIR/certbot/conf/live"
if [[ ! -d "$CERT_DIR" ]]; then
    print_message "$RED" "Error: No certificates found. Run setup-letsencrypt.sh first."
    log_message "ERROR: No certificates found"
    exit 1
fi

# Get list of domains
DOMAINS=$(ls -1 "$CERT_DIR" 2>/dev/null || true)
if [[ -z "$DOMAINS" ]]; then
    print_message "$RED" "Error: No domain certificates found"
    log_message "ERROR: No domain certificates found"
    exit 1
fi

print_message "$GREEN" "Found certificates for domains:"
for domain in $DOMAINS; do
    echo "  - $domain"

    # Check certificate expiry
    CERT_FILE="$CERT_DIR/$domain/cert.pem"
    if [[ -f "$CERT_FILE" ]]; then
        EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
        EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$EXPIRY" +%s 2>/dev/null)
        NOW_EPOCH=$(date +%s)
        DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

        if [[ $DAYS_LEFT -lt 30 ]]; then
            print_message "$YELLOW" "    ⚠ Expires in $DAYS_LEFT days (renewal recommended)"
        elif [[ $DAYS_LEFT -lt 7 ]]; then
            print_message "$RED" "    ⚠ CRITICAL: Expires in $DAYS_LEFT days!"
        else
            print_message "$GREEN" "    ✓ Valid for $DAYS_LEFT days"
        fi
    fi
done
echo ""

# Prepare certbot command
CERTBOT_CMD="docker run --rm \
    -v $INFRASTRUCTURE_DIR/certbot/conf:/etc/letsencrypt \
    -v $INFRASTRUCTURE_DIR/certbot/www:/var/www/certbot \
    -v $INFRASTRUCTURE_DIR/certbot/logs:/var/log/letsencrypt \
    certbot/certbot renew"

if [[ "$FORCE" == true ]]; then
    CERTBOT_CMD="$CERTBOT_CMD --force-renewal"
fi

if [[ "$DRY_RUN" == true ]]; then
    CERTBOT_CMD="$CERTBOT_CMD --dry-run"
fi

if [[ "$VERBOSE" == true ]]; then
    CERTBOT_CMD="$CERTBOT_CMD --verbose"
else
    CERTBOT_CMD="$CERTBOT_CMD --quiet"
fi

# Run certbot renewal
print_message "$YELLOW" "Running certificate renewal..."
log_message "Running certbot: $CERTBOT_CMD"

if eval $CERTBOT_CMD; then
    print_message "$GREEN" "✓ Certificate renewal completed"
    log_message "SUCCESS: Certificate renewal completed"
    RENEWAL_SUCCESS=true
else
    print_message "$RED" "✗ Certificate renewal failed"
    log_message "ERROR: Certificate renewal failed"
    RENEWAL_SUCCESS=false
fi

# Reload NGINX if renewal was successful
if [[ "$RENEWAL_SUCCESS" == true && "$DRY_RUN" == false ]]; then
    print_message "$YELLOW" "Reloading NGINX..."

    if docker exec telecheck_nginx nginx -t 2>&1 | tee -a "$LOG_FILE"; then
        print_message "$GREEN" "✓ NGINX configuration is valid"

        if docker exec telecheck_nginx nginx -s reload 2>&1 | tee -a "$LOG_FILE"; then
            print_message "$GREEN" "✓ NGINX reloaded successfully"
            log_message "SUCCESS: NGINX reloaded"
        else
            print_message "$RED" "✗ Failed to reload NGINX"
            log_message "ERROR: Failed to reload NGINX"
        fi
    else
        print_message "$RED" "✗ NGINX configuration test failed"
        log_message "ERROR: NGINX configuration test failed"
    fi
fi

# Verify certificates after renewal
if [[ "$RENEWAL_SUCCESS" == true && "$DRY_RUN" == false ]]; then
    print_message "$YELLOW" "Verifying renewed certificates..."

    for domain in $DOMAINS; do
        CERT_FILE="$CERT_DIR/$domain/cert.pem"
        if [[ -f "$CERT_FILE" ]]; then
            if openssl x509 -checkend 2592000 -noout -in "$CERT_FILE"; then
                print_message "$GREEN" "  ✓ $domain: Certificate valid for at least 30 days"
                log_message "VERIFIED: $domain certificate valid"
            else
                print_message "$YELLOW" "  ⚠ $domain: Certificate expires within 30 days"
                log_message "WARNING: $domain certificate expires soon"
            fi
        fi
    done
fi

# Send notification (optional)
send_notification() {
    local status=$1
    local message=$2

    # Slack notification
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-Type: application/json' \
            -d "{\"text\":\"Certificate Renewal: $status - $message\"}" \
            2>&1 | tee -a "$LOG_FILE"
    fi

    # Email notification
    if [[ -n "${ALERT_EMAIL:-}" ]]; then
        echo "$message" | mail -s "Certificate Renewal: $status" "$ALERT_EMAIL" 2>&1 | tee -a "$LOG_FILE"
    fi
}

# Final status
echo ""
print_message "$BLUE" "==================================================="
if [[ "$RENEWAL_SUCCESS" == true ]]; then
    print_message "$GREEN" "Certificate renewal completed successfully!"
    log_message "Certificate renewal process completed successfully"

    if [[ "$DRY_RUN" == false ]]; then
        send_notification "SUCCESS" "All certificates renewed successfully"
    fi
else
    print_message "$RED" "Certificate renewal failed!"
    log_message "Certificate renewal process failed"

    if [[ "$DRY_RUN" == false ]]; then
        send_notification "FAILURE" "Certificate renewal failed - manual intervention required"
    fi
    exit 1
fi
print_message "$BLUE" "==================================================="
echo ""

if [[ "$DRY_RUN" == true ]]; then
    print_message "$YELLOW" "Note: This was a dry run. No actual changes were made."
fi

log_message "Certificate renewal script completed"
