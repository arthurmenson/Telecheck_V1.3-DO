#!/bin/bash
# =============================================================================
# Production Database Migration Script for DigitalOcean
# =============================================================================
# Run this script from the DigitalOcean App Platform console or a container
# with access to the production database.
#
# Usage:
#   bash scripts/migrate-production.sh
# =============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "======================================================================="
echo "  Telecheck V2.0 - Production Database Migration"
echo "======================================================================="
echo ""

# Check for DATABASE_URL
if [ -z "${DATABASE_URL:-}" ]; then
    echo -e "${RED}[ERROR]${NC} DATABASE_URL environment variable not set"
    echo "Please set DATABASE_URL or run this from the DigitalOcean App console"
    exit 1
fi

echo -e "${BLUE}[INFO]${NC} Database URL found (connection string redacted)"
echo -e "${BLUE}[INFO]${NC} Checking database connection..."

# Test database connection
if ! psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}[ERROR]${NC} Cannot connect to database"
    echo "Please check your DATABASE_URL and database firewall rules"
    exit 1
fi

echo -e "${GREEN}[SUCCESS]${NC} Database connection successful"
echo ""

# Function to run SQL file
run_sql_file() {
    local file_path="$1"
    local description="$2"

    echo -e "${BLUE}[INFO]${NC} Running migration: $description"

    if [ ! -f "$file_path" ]; then
        echo -e "${YELLOW}[WARNING]${NC} File not found: $file_path (skipping)"
        return 0
    fi

    if psql "$DATABASE_URL" -f "$file_path" > /dev/null 2>&1; then
        echo -e "${GREEN}[SUCCESS]${NC} $description completed"
        return 0
    else
        echo -e "${RED}[ERROR]${NC} $description failed"
        return 1
    fi
}

# Run migrations in order
echo "======================================================================="
echo "  Running Database Migrations"
echo "======================================================================="
echo ""

MIGRATIONS_RUN=0
MIGRATIONS_FAILED=0

# Migration 1: Core schema (init.sql)
if run_sql_file "server/config/init.sql" "Core schema (users, patients, appointments)"; then
    ((MIGRATIONS_RUN++))
else
    ((MIGRATIONS_FAILED++))
fi

echo ""

# Migration 2: Messaging schema (messaging-tables.sql)
if run_sql_file "server/config/messaging-tables.sql" "Messaging schema (schedules, communications)"; then
    ((MIGRATIONS_RUN++))
else
    ((MIGRATIONS_FAILED++))
fi

echo ""

# Verify migrations
echo "======================================================================="
echo "  Verifying Database Schema"
echo "======================================================================="
echo ""

echo -e "${BLUE}[INFO]${NC} Checking created tables..."

TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "
SELECT COUNT(*)
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
" | xargs)

echo -e "${GREEN}[SUCCESS]${NC} Found $TABLE_COUNT tables in database"
echo ""

# List all tables
echo -e "${BLUE}[INFO]${NC} Tables created:"
psql "$DATABASE_URL" -c "
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name
"

echo ""

# Check for admin user
ADMIN_EXISTS=$(psql "$DATABASE_URL" -t -c "
SELECT COUNT(*) FROM users WHERE email = 'admin@telecheck.com'
" | xargs)

if [ "$ADMIN_EXISTS" = "1" ]; then
    echo -e "${GREEN}[SUCCESS]${NC} Default admin user created"
    echo "  Email: admin@telecheck.com"
    echo "  Password: admin123"
    echo "  ${YELLOW}⚠️  Please change this password after first login!${NC}"
else
    echo -e "${YELLOW}[WARNING]${NC} Default admin user not found"
fi

echo ""
echo "======================================================================="
echo "  Migration Summary"
echo "======================================================================="
echo "  Migrations Run: $MIGRATIONS_RUN"
echo "  Migrations Failed: $MIGRATIONS_FAILED"
echo "  Total Tables: $TABLE_COUNT"
echo "======================================================================="

if [ $MIGRATIONS_FAILED -eq 0 ]; then
    echo -e "${GREEN}[SUCCESS]${NC} All migrations completed successfully!"
    echo ""
    exit 0
else
    echo -e "${RED}[ERROR]${NC} Some migrations failed. Please review the output above."
    echo ""
    exit 1
fi
