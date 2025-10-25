#!/bin/bash

###############################################################################
# Encryption Performance Validation Script
# Validates that encryption meets HIPAA performance requirements
#
# Usage: ./validate-encryption-performance.sh
#
# Created: 2025-10-25
###############################################################################

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Performance thresholds (milliseconds)
ENCRYPT_THRESHOLD_MS=100
DECRYPT_THRESHOLD_MS=100
QUERY_THRESHOLD_MS=200

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Encryption Performance Validation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Test 1: Database connection
echo -e "${BLUE}[1/5] Testing database connection...${NC}"
if psql $DATABASE_URL -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection OK${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
    exit 1
fi
echo ""

# Test 2: pgcrypto extension
echo -e "${BLUE}[2/5] Verifying pgcrypto extension...${NC}"
if psql $DATABASE_URL -c "SELECT * FROM pg_extension WHERE extname='pgcrypto'" | grep -q pgcrypto; then
    echo -e "${GREEN}✓ pgcrypto extension enabled${NC}"
else
    echo -e "${RED}✗ pgcrypto extension not found${NC}"
    exit 1
fi
echo ""

# Test 3: Encryption functions
echo -e "${BLUE}[3/5] Testing encryption functions...${NC}"

# Test single encryption/decryption
TEST_DATA="Test patient data for performance validation"
ENCRYPT_KEY="${PHI_PATIENT_KEY:-test_key_$(openssl rand -hex 32)}"

# Measure encryption time
ENCRYPT_START=$(date +%s%3N)
ENCRYPTED=$(psql $DATABASE_URL -t -c "SELECT encrypt_column_aes256('${TEST_DATA}', '${ENCRYPT_KEY}')")
ENCRYPT_END=$(date +%s%3N)
ENCRYPT_TIME=$((ENCRYPT_END - ENCRYPT_START))

echo "  Encryption time: ${ENCRYPT_TIME}ms"

if [ $ENCRYPT_TIME -lt $ENCRYPT_THRESHOLD_MS ]; then
    echo -e "${GREEN}✓ Encryption performance acceptable (< ${ENCRYPT_THRESHOLD_MS}ms)${NC}"
else
    echo -e "${YELLOW}⚠ Encryption slower than threshold (${ENCRYPT_TIME}ms > ${ENCRYPT_THRESHOLD_MS}ms)${NC}"
fi

# Measure decryption time
DECRYPT_START=$(date +%s%3N)
DECRYPTED=$(psql $DATABASE_URL -t -c "SELECT decrypt_column_aes256('${ENCRYPTED}', '${ENCRYPT_KEY}')")
DECRYPT_END=$(date +%s%3N)
DECRYPT_TIME=$((DECRYPT_END - DECRYPT_START))

echo "  Decryption time: ${DECRYPT_TIME}ms"

if [ $DECRYPT_TIME -lt $DECRYPT_THRESHOLD_MS ]; then
    echo -e "${GREEN}✓ Decryption performance acceptable (< ${DECRYPT_THRESHOLD_MS}ms)${NC}"
else
    echo -e "${YELLOW}⚠ Decryption slower than threshold (${DECRYPT_TIME}ms > ${DECRYPT_THRESHOLD_MS}ms)${NC}"
fi
echo ""

# Test 4: Batch operations
echo -e "${BLUE}[4/5] Testing batch operations (100 records)...${NC}"

BATCH_START=$(date +%s%3N)
for i in {1..100}; do
    psql $DATABASE_URL -t -c "SELECT encrypt_column_aes256('Test data ${i}', '${ENCRYPT_KEY}')" > /dev/null
done
BATCH_END=$(date +%s%3N)
BATCH_TIME=$((BATCH_END - BATCH_START))
BATCH_AVG=$((BATCH_TIME / 100))

echo "  Batch encryption time: ${BATCH_TIME}ms total"
echo "  Average per record: ${BATCH_AVG}ms"

if [ $BATCH_AVG -lt $ENCRYPT_THRESHOLD_MS ]; then
    echo -e "${GREEN}✓ Batch performance acceptable${NC}"
else
    echo -e "${YELLOW}⚠ Batch performance slower than threshold${NC}"
fi
echo ""

# Test 5: Performance metrics from database
echo -e "${BLUE}[5/5] Checking historical performance metrics...${NC}"

PERF_METRICS=$(psql $DATABASE_URL -t -c "
SELECT
    operation,
    ROUND(AVG(duration_ms)::NUMERIC, 2) as avg_ms,
    ROUND(MAX(duration_ms)::NUMERIC, 2) as max_ms,
    COUNT(*) as operations
FROM encryption_metrics
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY operation
ORDER BY operation;
")

if [ -n "$PERF_METRICS" ]; then
    echo "  Recent performance (last hour):"
    echo "$PERF_METRICS" | while IFS='|' read -r operation avg_ms max_ms operations; do
        operation=$(echo $operation | xargs)
        avg_ms=$(echo $avg_ms | xargs)
        max_ms=$(echo $max_ms | xargs)
        operations=$(echo $operations | xargs)

        if [ -n "$operation" ]; then
            echo "    ${operation}: avg=${avg_ms}ms, max=${max_ms}ms, ops=${operations}"

            if (( $(echo "$avg_ms > $ENCRYPT_THRESHOLD_MS" | bc -l) )); then
                echo -e "${YELLOW}    ⚠ Average exceeds threshold${NC}"
            fi
        fi
    done
    echo -e "${GREEN}✓ Performance metrics collected${NC}"
else
    echo -e "${YELLOW}⚠ No recent performance metrics available${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Performance Validation Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "  Single Encryption: ${ENCRYPT_TIME}ms (threshold: <${ENCRYPT_THRESHOLD_MS}ms)"
echo "  Single Decryption: ${DECRYPT_TIME}ms (threshold: <${DECRYPT_THRESHOLD_MS}ms)"
echo "  Batch Average: ${BATCH_AVG}ms (threshold: <${ENCRYPT_THRESHOLD_MS}ms)"
echo ""

# Overall result
TOTAL_ISSUES=0

if [ $ENCRYPT_TIME -ge $ENCRYPT_THRESHOLD_MS ]; then
    ((TOTAL_ISSUES++))
fi

if [ $DECRYPT_TIME -ge $DECRYPT_THRESHOLD_MS ]; then
    ((TOTAL_ISSUES++))
fi

if [ $BATCH_AVG -ge $ENCRYPT_THRESHOLD_MS ]; then
    ((TOTAL_ISSUES++))
fi

if [ $TOTAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓✓✓ All performance tests PASSED${NC}"
    echo ""
    exit 0
else
    echo -e "${YELLOW}⚠ ${TOTAL_ISSUES} performance test(s) exceeded threshold${NC}"
    echo ""
    echo "Recommendations:"
    echo "  - Review database server resources (CPU, memory)"
    echo "  - Check network latency to database"
    echo "  - Consider optimizing batch sizes"
    echo "  - Review concurrent load on database"
    echo ""
    exit 1
fi
