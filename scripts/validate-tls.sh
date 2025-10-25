#!/bin/bash

###############################################################################
# TLS Validation Script for Telecheck V2.0
# Validates internal TLS connections for PostgreSQL, Redis, and services
# Ensures all services are properly configured with encryption in transit
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

# Print colored message
print_message() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

# Print header
print_message "$BLUE" "==================================================="
print_message "$BLUE" "Internal TLS Validation for Telecheck V2.0"
print_message "$BLUE" "==================================================="
echo ""

# Check if docker is running
if ! docker info &> /dev/null; then
    print_message "$RED" "Error: Docker is not running"
    exit 1
fi

# Test PostgreSQL TLS
test_postgres_tls() {
    print_message "$YELLOW" "Test 1: PostgreSQL TLS Connection..."

    if docker exec telecheck_postgres psql -U postgres -d telecheck -c "SHOW ssl;" 2>&1 | grep -q "on"; then
        print_message "$GREEN" "✓ PostgreSQL SSL is enabled"

        # Check SSL version
        local ssl_version=$(docker exec telecheck_postgres psql -U postgres -d telecheck -c "SHOW ssl_min_protocol_version;" 2>/dev/null | grep -v "ssl_min_protocol_version" | grep -v "row" | tr -d ' ')

        if [[ "$ssl_version" =~ TLSv1.2|TLSv1.3 ]]; then
            print_message "$GREEN" "✓ PostgreSQL SSL version: $ssl_version"
        else
            print_message "$YELLOW" "⚠ PostgreSQL SSL version: $ssl_version (should be TLSv1.2 or TLSv1.3)"
        fi

        # Check cipher suites
        docker exec telecheck_postgres psql -U postgres -d telecheck -c "SHOW ssl_ciphers;" 2>/dev/null

    else
        print_message "$RED" "✗ PostgreSQL SSL is disabled"
        return 1
    fi
}

# Test Redis TLS
test_redis_tls() {
    print_message "$YELLOW" "Test 2: Redis TLS Connection..."

    # Check if Redis is configured for TLS
    if docker exec telecheck_redis redis-cli --tls --cert /etc/redis/ssl/redis.crt --key /etc/redis/ssl/redis.key --cacert /etc/redis/ssl/ca.crt ping 2>&1 | grep -q "PONG"; then
        print_message "$GREEN" "✓ Redis TLS is working"

        # Get Redis TLS info
        local tls_info=$(docker exec telecheck_redis redis-cli --tls --cert /etc/redis/ssl/redis.crt --key /etc/redis/ssl/redis.key --cacert /etc/redis/ssl/ca.crt INFO server 2>/dev/null | grep "^redis_version")
        echo "  $tls_info"

    else
        print_message "$RED" "✗ Redis TLS connection failed"
        return 1
    fi
}

# Test NGINX TLS configuration
test_nginx_tls() {
    print_message "$YELLOW" "Test 3: NGINX TLS Configuration..."

    # Test NGINX configuration
    if docker exec telecheck_nginx nginx -t 2>&1 | grep -q "successful"; then
        print_message "$GREEN" "✓ NGINX configuration is valid"
    else
        print_message "$RED" "✗ NGINX configuration is invalid"
        return 1
    fi

    # Check SSL protocols
    local ssl_protocols=$(docker exec telecheck_nginx grep "ssl_protocols" /etc/nginx/conf.d/ssl-params.conf 2>/dev/null || echo "Not found")
    echo "  SSL Protocols: $ssl_protocols"

    if echo "$ssl_protocols" | grep -q "TLSv1.3"; then
        print_message "$GREEN" "✓ TLS 1.3 is configured"
    else
        print_message "$YELLOW" "⚠ TLS 1.3 not found in configuration"
    fi
}

# Test Keycloak TLS
test_keycloak_tls() {
    print_message "$YELLOW" "Test 4: Keycloak TLS Connection..."

    # Check if Keycloak is running with HTTPS
    if docker exec telecheck_keycloak curl -k -s https://localhost:8443/health/ready | grep -q "status.*UP"; then
        print_message "$GREEN" "✓ Keycloak HTTPS is working"
    else
        print_message "$YELLOW" "⚠ Keycloak HTTPS health check failed (may not be fully started)"
    fi
}

# Test Application TLS
test_app_tls() {
    print_message "$YELLOW" "Test 5: Application TLS Configuration..."

    # Check environment variables
    local db_ssl=$(docker exec telecheck_app printenv DB_SSL 2>/dev/null || echo "not set")
    local redis_tls=$(docker exec telecheck_app printenv REDIS_TLS 2>/dev/null || echo "not set")
    local cookie_secure=$(docker exec telecheck_app printenv COOKIE_SECURE 2>/dev/null || echo "not set")

    echo "  DB_SSL: $db_ssl"
    echo "  REDIS_TLS: $redis_tls"
    echo "  COOKIE_SECURE: $cookie_secure"

    if [[ "$db_ssl" == "true" ]]; then
        print_message "$GREEN" "✓ Database SSL is enabled in application"
    else
        print_message "$YELLOW" "⚠ Database SSL is not enabled in application"
    fi

    if [[ "$redis_tls" == "true" ]]; then
        print_message "$GREEN" "✓ Redis TLS is enabled in application"
    else
        print_message "$YELLOW" "⚠ Redis TLS is not enabled in application"
    fi

    if [[ "$cookie_secure" == "true" ]]; then
        print_message "$GREEN" "✓ Secure cookies are enabled"
    else
        print_message "$YELLOW" "⚠ Secure cookies are not enabled"
    fi
}

# Test certificate validity
test_certificates() {
    print_message "$YELLOW" "Test 6: Certificate Validity..."

    # Check NGINX certificates
    if docker exec telecheck_nginx test -f /etc/letsencrypt/live/*/fullchain.pem; then
        print_message "$GREEN" "✓ NGINX certificate exists"

        # Get certificate expiry
        local cert_path=$(docker exec telecheck_nginx find /etc/letsencrypt/live -name "fullchain.pem" | head -1)
        local expiry=$(docker exec telecheck_nginx openssl x509 -enddate -noout -in "$cert_path" 2>/dev/null | cut -d= -f2)

        if [[ -n "$expiry" ]]; then
            echo "  Expires: $expiry"
        fi
    else
        print_message "$YELLOW" "⚠ NGINX certificate not found (using self-signed?)"
    fi

    # Check PostgreSQL certificates
    if docker exec telecheck_postgres test -f /var/lib/postgresql/ssl/server.crt; then
        print_message "$GREEN" "✓ PostgreSQL certificate exists"
    else
        print_message "$YELLOW" "⚠ PostgreSQL certificate not found"
    fi

    # Check Redis certificates
    if docker exec telecheck_redis test -f /etc/redis/ssl/redis.crt; then
        print_message "$GREEN" "✓ Redis certificate exists"
    else
        print_message "$YELLOW" "⚠ Redis certificate not found"
    fi
}

# Test end-to-end TLS
test_e2e_tls() {
    print_message "$YELLOW" "Test 7: End-to-End TLS..."

    # Get the domain from environment
    local domain=$(docker exec telecheck_app printenv DOMAIN 2>/dev/null || echo "localhost")

    # Test full stack HTTPS request
    if docker exec telecheck_nginx curl -k -s -o /dev/null -w "%{http_code}" "https://$domain/health" | grep -q "200"; then
        print_message "$GREEN" "✓ End-to-end HTTPS working"
    else
        print_message "$YELLOW" "⚠ End-to-end HTTPS test failed"
    fi
}

# Check for insecure configurations
test_security_issues() {
    print_message "$YELLOW" "Test 8: Checking for security issues..."

    local issues=0

    # Check for weak ciphers in NGINX
    if docker exec telecheck_nginx grep -i "ssl_ciphers" /etc/nginx/conf.d/ssl-params.conf | grep -qi "RC4\|DES\|MD5"; then
        print_message "$RED" "✗ Weak ciphers detected in NGINX configuration"
        issues=$((issues + 1))
    else
        print_message "$GREEN" "✓ No weak ciphers in NGINX configuration"
    fi

    # Check for TLS 1.0/1.1 in NGINX
    if docker exec telecheck_nginx grep "ssl_protocols" /etc/nginx/conf.d/ssl-params.conf | grep -q "TLSv1\.0\|TLSv1\.1"; then
        print_message "$RED" "✗ TLS 1.0/1.1 is enabled (should be disabled)"
        issues=$((issues + 1))
    else
        print_message "$GREEN" "✓ TLS 1.0/1.1 are disabled"
    fi

    # Check for SSL session tickets (should be off)
    if docker exec telecheck_nginx grep "ssl_session_tickets" /etc/nginx/conf.d/ssl-params.conf | grep -q "off"; then
        print_message "$GREEN" "✓ SSL session tickets are disabled (good for forward secrecy)"
    else
        print_message "$YELLOW" "⚠ SSL session tickets configuration not optimal"
    fi

    return $issues
}

# Generate report
generate_report() {
    print_message "$YELLOW" "Generating TLS validation report..."

    local report_file="/tmp/tls-validation-report-$(date +%Y%m%d-%H%M%S).txt"

    {
        echo "============================================="
        echo "TLS Validation Report for Telecheck V2.0"
        echo "Generated: $(date)"
        echo "============================================="
        echo ""
        echo "Services Status:"
        docker ps --filter "name=telecheck" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        echo "Certificate Information:"
        docker exec telecheck_nginx find /etc/letsencrypt/live -name "*.pem" -exec ls -lh {} \; 2>/dev/null || echo "Certificates not found"
        echo ""
    } > "$report_file"

    print_message "$GREEN" "Report saved to: $report_file"
}

# Main execution
main() {
    local failed=0

    test_postgres_tls || failed=$((failed + 1))
    echo ""

    test_redis_tls || failed=$((failed + 1))
    echo ""

    test_nginx_tls || failed=$((failed + 1))
    echo ""

    test_keycloak_tls || failed=$((failed + 1))
    echo ""

    test_app_tls || failed=$((failed + 1))
    echo ""

    test_certificates || failed=$((failed + 1))
    echo ""

    test_e2e_tls || failed=$((failed + 1))
    echo ""

    test_security_issues || failed=$((failed + $?))
    echo ""

    generate_report
    echo ""

    print_message "$BLUE" "==================================================="
    if [[ $failed -eq 0 ]]; then
        print_message "$GREEN" "All TLS validation tests passed!"
        print_message "$BLUE" "==================================================="
        return 0
    else
        print_message "$YELLOW" "$failed test(s) failed or have warnings"
        print_message "$BLUE" "==================================================="
        return 1
    fi
}

main
