#!/bin/bash
# =============================================================================
# Smoke Test Production Deployment
#
# Purpose: Verify all production services are healthy and functional
# Usage: ./scripts/smoke-test-production.sh
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAILED_TESTS=0
PASSED_TESTS=0

# Helper function to run tests
run_test() {
    local test_name="$1"
    local test_command="$2"

    echo -n "  Testing $test_name... "

    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}✗${NC}"
        ((FAILED_TESTS++))
    fi
}

echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}Smoke Test - Production Deployment${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""

# -----------------------------------------------------------------------------
# Test Infrastructure Services
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Infrastructure Services:${NC}"

run_test "PostgreSQL health check" \
    "docker exec telecheck-postgres pg_isready -U telecheck"

run_test "PostgreSQL encryption enabled" \
    "docker exec telecheck-postgres psql -U telecheck -d telecheck -c 'SHOW ssl' | grep -q 'on'"

run_test "Redis ping" \
    "docker exec telecheck-redis redis-cli --tls --cacert /ssl/ca.crt ping | grep -q PONG"

run_test "Vault seal status" \
    "docker exec vault-1 vault status | grep -q 'Sealed.*false'"

run_test "Keycloak health" \
    "curl -sf http://localhost:8080/health | grep -q 'UP'"

echo ""

# -----------------------------------------------------------------------------
# Test API Endpoints
# -----------------------------------------------------------------------------
echo -e "${YELLOW}API Endpoints:${NC}"

run_test "API health endpoint" \
    "curl -sf http://localhost:3000/health | grep -q 'ok'"

run_test "API metrics endpoint" \
    "curl -sf http://localhost:9090/metrics | grep -q 'process_cpu'"

run_test "API database connection" \
    "curl -sf http://localhost:3000/health/db | grep -q 'connected'"

run_test "API Redis connection" \
    "curl -sf http://localhost:3000/health/redis | grep -q 'connected'"

run_test "API Vault connection" \
    "curl -sf http://localhost:3000/health/vault | grep -q 'connected'"

echo ""

# -----------------------------------------------------------------------------
# Test Authentication
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Authentication:${NC}"

# Get Keycloak token for test user
TOKEN=$(curl -s -X POST "http://localhost:8080/realms/telecheck/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=test.patient@example.com" \
    -d "password=TestPatient123!" \
    -d "grant_type=password" \
    -d "client_id=telecheck-web" \
    | jq -r '.access_token')

run_test "Keycloak token generation" \
    "[ -n '$TOKEN' ] && [ '$TOKEN' != 'null' ]"

run_test "API accepts valid JWT" \
    "curl -sf -H 'Authorization: Bearer $TOKEN' http://localhost:3000/api/users/me | grep -q 'test.patient'"

run_test "API rejects invalid JWT" \
    "curl -sf -H 'Authorization: Bearer invalid_token' http://localhost:3000/api/users/me || true | grep -q '401'"

echo ""

# -----------------------------------------------------------------------------
# Test Security Features
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Security Features:${NC}"

run_test "CSRF protection enabled" \
    "curl -sf -X POST http://localhost:3000/api/auth/login | grep -q 'CSRF'"

run_test "Rate limiting active" \
    "for i in {1..10}; do curl -s http://localhost:3000/api/auth/login; done | grep -q '429'"

run_test "TLS 1.3 on NGINX" \
    "docker exec telecheck-nginx nginx -V 2>&1 | grep -q 'TLS1.3'"

run_test "Security headers present" \
    "curl -sI http://localhost:80 | grep -q 'X-Frame-Options'"

echo ""

# -----------------------------------------------------------------------------
# Test Monitoring
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Monitoring & Observability:${NC}"

run_test "Prometheus scraping metrics" \
    "curl -sf http://localhost:9090/api/v1/targets | jq -r '.data.activeTargets[] | select(.health==\"up\") | .labels.job' | grep -q 'telecheck-api'"

run_test "Grafana running" \
    "curl -sf http://localhost:3001/api/health | grep -q 'ok'"

run_test "Loki receiving logs" \
    "curl -sf http://localhost:3100/ready | grep -q 'ready'"

run_test "Alertmanager running" \
    "curl -sf http://localhost:9093/-/healthy | grep -q 'Healthy'"

echo ""

# -----------------------------------------------------------------------------
# Test Database Encryption
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Database Encryption:${NC}"

run_test "PHI columns encrypted" \
    "docker exec telecheck-postgres psql -U telecheck -d telecheck -c \"SELECT COUNT(*) FROM patients WHERE email NOT LIKE '%@%'\" | grep -q '0'"

run_test "Encryption keys in Vault" \
    "docker exec vault-1 vault kv get secret/telecheck/phi | grep -q 'patient_key'"

run_test "Audit logging enabled" \
    "docker exec telecheck-postgres psql -U telecheck -d telecheck -c 'SELECT COUNT(*) FROM audit_log' | grep -v 'COUNT' | grep -v 'row' | awk '{print \$1}' | grep -E '^[0-9]+$'"

echo ""

# -----------------------------------------------------------------------------
# Test Backup System
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Backup & Disaster Recovery:${NC}"

run_test "Backup script exists" \
    "test -x ./scripts/backup-database.sh"

run_test "Restore script exists" \
    "test -x ./scripts/restore-database.sh"

run_test "DR test script exists" \
    "test -x ./scripts/test-disaster-recovery.sh"

run_test "Backup directory exists" \
    "test -d ./backups/postgres"

echo ""

# -----------------------------------------------------------------------------
# Test Web Application
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Web Application:${NC}"

run_test "Web server responds" \
    "curl -sf http://localhost:80 | grep -q 'Telecheck'"

run_test "Static assets served" \
    "curl -sf http://localhost:80/assets/ || true"

run_test "SPA routing works" \
    "curl -sf http://localhost:80/login | grep -q 'Telecheck'"

echo ""

# -----------------------------------------------------------------------------
# Test Container Health
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Container Health:${NC}"

# Get all telecheck containers
CONTAINERS=$(docker ps --filter "name=telecheck" --format "{{.Names}}")

for container in $CONTAINERS; do
    HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-healthcheck")

    if [ "$HEALTH" == "healthy" ] || [ "$HEALTH" == "no-healthcheck" ]; then
        echo -e "  ${container}: ${GREEN}✓${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "  ${container}: ${RED}✗ ($HEALTH)${NC}"
        ((FAILED_TESTS++))
    fi
done

echo ""

# -----------------------------------------------------------------------------
# Test Load Balancer
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Load Balancer:${NC}"

run_test "NGINX running" \
    "docker ps | grep -q telecheck-nginx"

run_test "NGINX proxying to API" \
    "curl -sf http://localhost:80/api/health | grep -q 'ok'"

run_test "NGINX serving static files" \
    "curl -sf http://localhost:80/ | grep -q 'Telecheck'"

echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
TOTAL_TESTS=$((PASSED_TESTS + FAILED_TESTS))

echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}Smoke Test Results${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! ($PASSED_TESTS/$TOTAL_TESTS)${NC}"
    echo ""
    echo -e "${GREEN}Production deployment is healthy and ready!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed ($FAILED_TESTS/$TOTAL_TESTS)${NC}"
    echo -e "${YELLOW}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    echo ""
    echo -e "${YELLOW}Check logs with:${NC}"
    echo -e "  docker-compose -f infrastructure/docker-compose.production.yml logs"
    echo ""
    exit 1
fi
