#!/bin/bash

###############################################################################
# Let's Encrypt Setup Script for Telecheck V2.0
# Initializes SSL/TLS certificates using Certbot
# Supports both staging and production environments
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

# Default values
DOMAIN=""
EMAIL=""
STAGING=false
DRY_RUN=false

# Print colored message
print_message() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

# Print usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Initialize Let's Encrypt SSL/TLS certificates for Telecheck

OPTIONS:
    -d, --domain DOMAIN         Domain name (required)
    -e, --email EMAIL           Email for certificate notifications (required)
    -s, --staging               Use Let's Encrypt staging environment (for testing)
    -n, --dry-run               Perform a dry run without making changes
    -h, --help                  Show this help message

EXAMPLES:
    # Production certificate
    $0 -d telecheck.example.com -e admin@example.com

    # Test with staging environment
    $0 -d telecheck.example.com -e admin@example.com --staging

    # Dry run
    $0 -d telecheck.example.com -e admin@example.com --dry-run

EOF
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -e|--email)
            EMAIL="$2"
            shift 2
            ;;
        -s|--staging)
            STAGING=true
            shift
            ;;
        -n|--dry-run)
            DRY_RUN=true
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

# Validate required parameters
if [[ -z "$DOMAIN" ]]; then
    print_message "$RED" "Error: Domain is required"
    usage
fi

if [[ -z "$EMAIL" ]]; then
    print_message "$RED" "Error: Email is required"
    usage
fi

# Validate email format
if ! [[ "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    print_message "$RED" "Error: Invalid email format"
    exit 1
fi

# Print configuration
print_message "$BLUE" "==================================================="
print_message "$BLUE" "Let's Encrypt Setup for Telecheck V2.0"
print_message "$BLUE" "==================================================="
echo ""
print_message "$GREEN" "Configuration:"
echo "  Domain:        $DOMAIN"
echo "  Email:         $EMAIL"
echo "  Staging:       $STAGING"
echo "  Dry Run:       $DRY_RUN"
echo ""

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    print_message "$RED" "Error: Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_message "$RED" "Error: Docker Compose is not installed"
    exit 1
fi

# Create necessary directories
print_message "$YELLOW" "Creating directories..."
mkdir -p "$INFRASTRUCTURE_DIR/nginx/ssl"
mkdir -p "$INFRASTRUCTURE_DIR/certbot/www"
mkdir -p "$INFRASTRUCTURE_DIR/certbot/conf"
mkdir -p "$INFRASTRUCTURE_DIR/certbot/logs"

# Generate DH parameters if not exists
if [[ ! -f "$INFRASTRUCTURE_DIR/nginx/dhparam.pem" ]]; then
    print_message "$YELLOW" "Generating DH parameters (this may take a while)..."
    if [[ "$DRY_RUN" == false ]]; then
        openssl dhparam -out "$INFRASTRUCTURE_DIR/nginx/dhparam.pem" 4096
        print_message "$GREEN" "✓ DH parameters generated"
    else
        print_message "$BLUE" "[DRY RUN] Would generate DH parameters"
    fi
else
    print_message "$GREEN" "✓ DH parameters already exist"
fi

# Generate self-signed certificate for initial setup
if [[ ! -f "$INFRASTRUCTURE_DIR/nginx/ssl/default-cert.pem" ]]; then
    print_message "$YELLOW" "Generating self-signed certificate for initial setup..."
    if [[ "$DRY_RUN" == false ]]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$INFRASTRUCTURE_DIR/nginx/ssl/default-key.pem" \
            -out "$INFRASTRUCTURE_DIR/nginx/ssl/default-cert.pem" \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"
        print_message "$GREEN" "✓ Self-signed certificate generated"
    else
        print_message "$BLUE" "[DRY RUN] Would generate self-signed certificate"
    fi
else
    print_message "$GREEN" "✓ Self-signed certificate already exists"
fi

# Prepare certbot command
CERTBOT_CMD="docker run -it --rm \
    -v $INFRASTRUCTURE_DIR/certbot/conf:/etc/letsencrypt \
    -v $INFRASTRUCTURE_DIR/certbot/www:/var/www/certbot \
    -v $INFRASTRUCTURE_DIR/certbot/logs:/var/log/letsencrypt \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email"

if [[ "$STAGING" == true ]]; then
    CERTBOT_CMD="$CERTBOT_CMD --staging"
fi

if [[ "$DRY_RUN" == true ]]; then
    CERTBOT_CMD="$CERTBOT_CMD --dry-run"
fi

CERTBOT_CMD="$CERTBOT_CMD -d $DOMAIN -d www.$DOMAIN"

# Start NGINX temporarily for ACME challenge
print_message "$YELLOW" "Starting NGINX for ACME challenge..."
if [[ "$DRY_RUN" == false ]]; then
    cd "$INFRASTRUCTURE_DIR"
    docker-compose -f docker-compose.production.yml up -d nginx
    sleep 5
    print_message "$GREEN" "✓ NGINX started"
else
    print_message "$BLUE" "[DRY RUN] Would start NGINX"
fi

# Run certbot
print_message "$YELLOW" "Running certbot..."
echo ""
print_message "$BLUE" "Command: $CERTBOT_CMD"
echo ""

if [[ "$DRY_RUN" == false ]]; then
    eval $CERTBOT_CMD

    if [[ $? -eq 0 ]]; then
        print_message "$GREEN" "✓ Certificate obtained successfully"
    else
        print_message "$RED" "✗ Failed to obtain certificate"
        exit 1
    fi
else
    print_message "$BLUE" "[DRY RUN] Would run certbot"
fi

# Create symlinks for NGINX
if [[ "$DRY_RUN" == false && "$STAGING" == false ]]; then
    print_message "$YELLOW" "Creating certificate symlinks..."
    ln -sf "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$INFRASTRUCTURE_DIR/nginx/ssl/cert.pem"
    ln -sf "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$INFRASTRUCTURE_DIR/nginx/ssl/key.pem"
    ln -sf "/etc/letsencrypt/live/$DOMAIN/chain.pem" "$INFRASTRUCTURE_DIR/nginx/ssl/chain.pem"
    print_message "$GREEN" "✓ Certificate symlinks created"
fi

# Reload NGINX
print_message "$YELLOW" "Reloading NGINX..."
if [[ "$DRY_RUN" == false ]]; then
    docker exec telecheck_nginx nginx -s reload
    print_message "$GREEN" "✓ NGINX reloaded"
else
    print_message "$BLUE" "[DRY RUN] Would reload NGINX"
fi

# Set up auto-renewal
print_message "$YELLOW" "Setting up auto-renewal..."
if [[ "$DRY_RUN" == false ]]; then
    cd "$INFRASTRUCTURE_DIR/certbot"
    docker-compose up -d
    print_message "$GREEN" "✓ Auto-renewal configured"
else
    print_message "$BLUE" "[DRY RUN] Would set up auto-renewal"
fi

# Print certificate information
if [[ "$DRY_RUN" == false && "$STAGING" == false ]]; then
    print_message "$YELLOW" "Certificate information:"
    openssl x509 -in "$INFRASTRUCTURE_DIR/certbot/conf/live/$DOMAIN/cert.pem" -noout -text | grep -A 2 "Validity"
fi

# Final message
echo ""
print_message "$GREEN" "==================================================="
print_message "$GREEN" "Let's Encrypt setup completed successfully!"
print_message "$GREEN" "==================================================="
echo ""
print_message "$BLUE" "Next steps:"
echo "  1. Test your site: https://$DOMAIN"
echo "  2. Check SSL rating: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo "  3. Check security headers: https://securityheaders.com/?q=$DOMAIN"
echo "  4. Monitor certificate expiry (auto-renewal is configured)"
echo ""

if [[ "$STAGING" == true ]]; then
    print_message "$YELLOW" "Note: You used the staging environment. For production, run without --staging flag."
fi

if [[ "$DRY_RUN" == true ]]; then
    print_message "$YELLOW" "Note: This was a dry run. No actual changes were made."
fi
