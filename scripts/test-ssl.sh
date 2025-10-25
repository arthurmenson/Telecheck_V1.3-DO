#!/bin/bash

###############################################################################
# SSL/TLS Testing Script for Telecheck V2.0
# Comprehensive SSL testing using SSL Labs API and local tools
# Validates TLS 1.3 enforcement and security configuration
###############################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=""
WAIT_FOR_SCAN=true
LOCAL_ONLY=false
SKIP_EXTERNAL=false

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

Test SSL/TLS configuration for Telecheck

OPTIONS:
    -d, --domain DOMAIN         Domain name to test (required)
    -l, --local-only            Only run local tests (skip SSL Labs)
    -s, --skip-external         Skip external tests
    -n, --no-wait               Don't wait for SSL Labs scan to complete
    -h, --help                  Show this help message

EXAMPLES:
    # Full test including SSL Labs
    $0 -d telecheck.example.com

    # Local tests only
    $0 -d telecheck.example.com --local-only

    # Quick test (don't wait for SSL Labs)
    $0 -d telecheck.example.com --no-wait

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
        -l|--local-only)
            LOCAL_ONLY=true
            shift
            ;;
        -s|--skip-external)
            SKIP_EXTERNAL=true
            shift
            ;;
        -n|--no-wait)
            WAIT_FOR_SCAN=false
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

# Validate domain
if [[ -z "$DOMAIN" ]]; then
    print_message "$RED" "Error: Domain is required"
    usage
fi

# Print header
print_message "$BLUE" "==================================================="
print_message "$BLUE" "SSL/TLS Testing for Telecheck V2.0"
print_message "$BLUE" "==================================================="
echo ""
print_message "$GREEN" "Testing domain: $DOMAIN"
echo ""

# Check required tools
check_requirements() {
    local missing=false

    if ! command -v openssl &> /dev/null; then
        print_message "$RED" "Error: openssl is not installed"
        missing=true
    fi

    if ! command -v curl &> /dev/null; then
        print_message "$RED" "Error: curl is not installed"
        missing=true
    fi

    if ! command -v jq &> /dev/null && [[ "$LOCAL_ONLY" == false ]]; then
        print_message "$YELLOW" "Warning: jq is not installed (required for SSL Labs API)"
    fi

    if [[ "$missing" == true ]]; then
        exit 1
    fi
}

# Test 1: Check if site is reachable
test_reachability() {
    print_message "$YELLOW" "Test 1: Checking site reachability..."

    if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -q "200\|301\|302"; then
        print_message "$GREEN" "✓ Site is reachable"
        return 0
    else
        print_message "$RED" "✗ Site is not reachable"
        return 1
    fi
}

# Test 2: Check TLS version support
test_tls_versions() {
    print_message "$YELLOW" "Test 2: Checking TLS version support..."

    # Test TLS 1.0 (should fail)
    if openssl s_client -connect "$DOMAIN:443" -tls1 </dev/null 2>&1 | grep -q "Cipher is (NONE)"; then
        print_message "$GREEN" "✓ TLS 1.0 is disabled (good)"
    else
        print_message "$RED" "✗ TLS 1.0 is enabled (bad)"
    fi

    # Test TLS 1.1 (should fail)
    if openssl s_client -connect "$DOMAIN:443" -tls1_1 </dev/null 2>&1 | grep -q "Cipher is (NONE)"; then
        print_message "$GREEN" "✓ TLS 1.1 is disabled (good)"
    else
        print_message "$RED" "✗ TLS 1.1 is enabled (bad)"
    fi

    # Test TLS 1.2 (should work)
    if openssl s_client -connect "$DOMAIN:443" -tls1_2 </dev/null 2>&1 | grep -q "Protocol  : TLSv1.2"; then
        print_message "$GREEN" "✓ TLS 1.2 is enabled"
    else
        print_message "$YELLOW" "⚠ TLS 1.2 is not supported"
    fi

    # Test TLS 1.3 (should work)
    if openssl s_client -connect "$DOMAIN:443" -tls1_3 </dev/null 2>&1 | grep -q "Protocol  : TLSv1.3"; then
        print_message "$GREEN" "✓ TLS 1.3 is enabled (excellent)"
    else
        print_message "$YELLOW" "⚠ TLS 1.3 is not supported"
    fi
}

# Test 3: Check cipher suites
test_ciphers() {
    print_message "$YELLOW" "Test 3: Checking cipher suites..."

    local ciphers=$(openssl s_client -connect "$DOMAIN:443" -tls1_3 </dev/null 2>&1 | grep "Cipher" | head -1)
    echo "  $ciphers"

    if echo "$ciphers" | grep -q "TLS_AES_256_GCM_SHA384\|TLS_CHACHA20_POLY1305_SHA256"; then
        print_message "$GREEN" "✓ Strong cipher suites in use"
    else
        print_message "$YELLOW" "⚠ Check cipher suite configuration"
    fi
}

# Test 4: Check certificate validity
test_certificate() {
    print_message "$YELLOW" "Test 4: Checking certificate validity..."

    local cert_info=$(echo | openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -dates -subject -issuer)

    echo "$cert_info"

    # Check expiry
    local expiry=$(echo "$cert_info" | grep "notAfter" | cut -d= -f2)
    local expiry_epoch=$(date -d "$expiry" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$expiry" +%s 2>/dev/null)
    local now_epoch=$(date +%s)
    local days_left=$(( ($expiry_epoch - $now_epoch) / 86400 ))

    if [[ $days_left -gt 30 ]]; then
        print_message "$GREEN" "✓ Certificate valid for $days_left days"
    elif [[ $days_left -gt 7 ]]; then
        print_message "$YELLOW" "⚠ Certificate expires in $days_left days"
    else
        print_message "$RED" "✗ Certificate expires in $days_left days!"
    fi
}

# Test 5: Check OCSP stapling
test_ocsp_stapling() {
    print_message "$YELLOW" "Test 5: Checking OCSP stapling..."

    if echo | openssl s_client -connect "$DOMAIN:443" -status 2>&1 | grep -q "OCSP Response Status: successful"; then
        print_message "$GREEN" "✓ OCSP stapling is enabled"
    else
        print_message "$YELLOW" "⚠ OCSP stapling is not enabled"
    fi
}

# Test 6: Check security headers
test_security_headers() {
    print_message "$YELLOW" "Test 6: Checking security headers..."

    local headers=$(curl -s -I "https://$DOMAIN")

    # HSTS
    if echo "$headers" | grep -iq "Strict-Transport-Security"; then
        local hsts=$(echo "$headers" | grep -i "Strict-Transport-Security")
        print_message "$GREEN" "✓ HSTS: $hsts"
    else
        print_message "$RED" "✗ HSTS header missing"
    fi

    # X-Frame-Options
    if echo "$headers" | grep -iq "X-Frame-Options"; then
        print_message "$GREEN" "✓ X-Frame-Options present"
    else
        print_message "$YELLOW" "⚠ X-Frame-Options missing"
    fi

    # X-Content-Type-Options
    if echo "$headers" | grep -iq "X-Content-Type-Options"; then
        print_message "$GREEN" "✓ X-Content-Type-Options present"
    else
        print_message "$YELLOW" "⚠ X-Content-Type-Options missing"
    fi

    # CSP
    if echo "$headers" | grep -iq "Content-Security-Policy"; then
        print_message "$GREEN" "✓ Content-Security-Policy present"
    else
        print_message "$YELLOW" "⚠ Content-Security-Policy missing"
    fi
}

# Test 7: Check HTTP to HTTPS redirect
test_https_redirect() {
    print_message "$YELLOW" "Test 7: Checking HTTP to HTTPS redirect..."

    local response=$(curl -s -o /dev/null -w "%{http_code}|%{redirect_url}" "http://$DOMAIN")
    local status_code=$(echo "$response" | cut -d'|' -f1)
    local redirect_url=$(echo "$response" | cut -d'|' -f2)

    if [[ "$status_code" == "301" || "$status_code" == "302" ]]; then
        if echo "$redirect_url" | grep -q "^https://"; then
            print_message "$GREEN" "✓ HTTP redirects to HTTPS (status: $status_code)"
        else
            print_message "$YELLOW" "⚠ Redirect present but not to HTTPS"
        fi
    else
        print_message "$RED" "✗ No HTTP to HTTPS redirect (status: $status_code)"
    fi
}

# Test 8: SSL Labs API test
test_ssllabs() {
    if [[ "$LOCAL_ONLY" == true || "$SKIP_EXTERNAL" == true ]]; then
        print_message "$BLUE" "Skipping SSL Labs test (local-only mode)"
        return 0
    fi

    print_message "$YELLOW" "Test 8: Initiating SSL Labs scan..."
    print_message "$BLUE" "This may take several minutes..."

    local api_url="https://api.ssllabs.com/api/v3/analyze?host=$DOMAIN"

    if [[ "$WAIT_FOR_SCAN" == false ]]; then
        api_url="$api_url&startNew=on"
    fi

    # Start scan
    curl -s "$api_url&publish=off&startNew=on&all=done" > /dev/null

    if [[ "$WAIT_FOR_SCAN" == true ]]; then
        # Poll for results
        local max_attempts=60
        local attempt=0

        while [[ $attempt -lt $max_attempts ]]; do
            sleep 10
            attempt=$((attempt + 1))

            local result=$(curl -s "$api_url&all=done")
            local status=$(echo "$result" | jq -r '.status' 2>/dev/null || echo "ERROR")

            case "$status" in
                "READY")
                    local grade=$(echo "$result" | jq -r '.endpoints[0].grade' 2>/dev/null || echo "N/A")
                    if [[ "$grade" == "A+" ]]; then
                        print_message "$GREEN" "✓ SSL Labs Grade: $grade (Perfect!)"
                    elif [[ "$grade" =~ ^A ]]; then
                        print_message "$GREEN" "✓ SSL Labs Grade: $grade (Excellent)"
                    elif [[ "$grade" =~ ^B ]]; then
                        print_message "$YELLOW" "⚠ SSL Labs Grade: $grade (Good, but can improve)"
                    else
                        print_message "$RED" "✗ SSL Labs Grade: $grade (Needs improvement)"
                    fi

                    # Print details URL
                    print_message "$BLUE" "Full report: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
                    return 0
                    ;;
                "IN_PROGRESS"|"DNS")
                    print_message "$BLUE" "Scan in progress... ($attempt/$max_attempts)"
                    ;;
                "ERROR")
                    print_message "$RED" "✗ SSL Labs scan failed"
                    return 1
                    ;;
            esac
        done

        print_message "$YELLOW" "⚠ Scan timeout - check results manually at:"
        print_message "$BLUE" "https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
    else
        print_message "$BLUE" "Scan initiated. Check results at:"
        print_message "$BLUE" "https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
    fi
}

# Test 9: Security Headers rating
test_security_headers_rating() {
    if [[ "$SKIP_EXTERNAL" == true ]]; then
        print_message "$BLUE" "Skipping Security Headers rating (skip-external mode)"
        return 0
    fi

    print_message "$YELLOW" "Test 9: Security Headers rating..."
    print_message "$BLUE" "Check at: https://securityheaders.com/?q=$DOMAIN"
}

# Test 10: Mozilla Observatory
test_mozilla_observatory() {
    if [[ "$SKIP_EXTERNAL" == true ]]; then
        print_message "$BLUE" "Skipping Mozilla Observatory (skip-external mode)"
        return 0
    fi

    print_message "$YELLOW" "Test 10: Mozilla Observatory..."
    print_message "$BLUE" "Check at: https://observatory.mozilla.org/analyze/$DOMAIN"
}

# Main execution
main() {
    check_requirements

    echo ""
    print_message "$BLUE" "Running SSL/TLS tests..."
    echo ""

    test_reachability
    echo ""

    test_tls_versions
    echo ""

    test_ciphers
    echo ""

    test_certificate
    echo ""

    test_ocsp_stapling
    echo ""

    test_security_headers
    echo ""

    test_https_redirect
    echo ""

    test_ssllabs
    echo ""

    test_security_headers_rating
    echo ""

    test_mozilla_observatory
    echo ""

    print_message "$BLUE" "==================================================="
    print_message "$GREEN" "SSL/TLS testing completed!"
    print_message "$BLUE" "==================================================="
}

main
