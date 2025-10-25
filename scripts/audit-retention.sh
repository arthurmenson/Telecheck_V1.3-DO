#!/bin/bash
#
# Audit Log Retention Script
# HIPAA requires 6+ years of audit log retention
# This script archives old partitions and manages storage
#

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-telecheck}"
DB_USER="${DB_USER:-postgres}"
ARCHIVE_DIR="${AUDIT_ARCHIVE_DIR:-/var/lib/telecheck/audit-archives}"
RETENTION_YEARS=6

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================================="
echo "Audit Log Retention and Archival Script"
echo "HIPAA Compliance - 45 CFR § 164.312(b)"
echo "=================================================="
echo ""

# Create archive directory if it doesn't exist
mkdir -p "$ARCHIVE_DIR"

# Calculate retention cutoff date (6 years ago)
CUTOFF_DATE=$(date -d "${RETENTION_YEARS} years ago" +%Y-%m-%d)
echo -e "${GREEN}Retention cutoff date: ${CUTOFF_DATE}${NC}"
echo ""

# Function to archive a partition
archive_partition() {
    local partition_name=$1
    local archive_file="${ARCHIVE_DIR}/${partition_name}_$(date +%Y%m%d_%H%M%S).sql.gz"

    echo -e "${YELLOW}Archiving partition: ${partition_name}${NC}"

    # Export partition to compressed SQL file
    PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -t "$partition_name" \
        --data-only \
        --no-owner \
        --no-privileges \
        | gzip > "$archive_file"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Archived to: ${archive_file}${NC}"

        # Calculate checksum for integrity verification
        local checksum=$(sha256sum "$archive_file" | awk '{print $1}')
        echo "$checksum" > "${archive_file}.sha256"
        echo -e "${GREEN}✓ Checksum: ${checksum}${NC}"

        # Mark events in this partition as archived
        PGPASSWORD="$DB_PASSWORD" psql \
            -h "$DB_HOST" \
            -p "$DB_PORT" \
            -U "$DB_USER" \
            -d "$DB_NAME" \
            -c "SELECT mark_events_archived('${partition_name}', '${archive_file}')"

        echo -e "${GREEN}✓ Partition marked as archived in database${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to archive partition${NC}"
        return 1
    fi
}

# Get list of archivable partitions
echo "Querying for archivable partitions..."
ARCHIVABLE_PARTITIONS=$(PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -t -c "SELECT partition_name FROM get_archivable_audit_events()" | tr -d ' ')

if [ -z "$ARCHIVABLE_PARTITIONS" ]; then
    echo -e "${GREEN}No partitions ready for archival${NC}"
    echo ""
else
    echo -e "${YELLOW}Found partitions to archive:${NC}"
    echo "$ARCHIVABLE_PARTITIONS"
    echo ""

    # Archive each partition
    while IFS= read -r partition; do
        if [ -n "$partition" ]; then
            archive_partition "$partition"
            echo ""
        fi
    done <<< "$ARCHIVABLE_PARTITIONS"
fi

# Verify archive integrity
echo "=================================================="
echo "Verifying Archive Integrity"
echo "=================================================="
echo ""

for archive_file in "$ARCHIVE_DIR"/*.sql.gz; do
    if [ -f "$archive_file" ]; then
        if [ -f "${archive_file}.sha256" ]; then
            echo "Checking: $(basename "$archive_file")"

            expected_checksum=$(cat "${archive_file}.sha256")
            actual_checksum=$(sha256sum "$archive_file" | awk '{print $1}')

            if [ "$expected_checksum" == "$actual_checksum" ]; then
                echo -e "${GREEN}✓ Integrity verified${NC}"
            else
                echo -e "${RED}✗ INTEGRITY FAILURE - Archive may be corrupted${NC}"
                echo "  Expected: $expected_checksum"
                echo "  Actual:   $actual_checksum"
            fi
        else
            echo -e "${YELLOW}⚠ No checksum file found for $(basename "$archive_file")${NC}"
        fi
        echo ""
    fi
done

# Report storage usage
echo "=================================================="
echo "Storage Report"
echo "=================================================="
echo ""

ARCHIVE_SIZE=$(du -sh "$ARCHIVE_DIR" | awk '{print $1}')
ARCHIVE_COUNT=$(find "$ARCHIVE_DIR" -name "*.sql.gz" | wc -l)

echo "Archive directory: $ARCHIVE_DIR"
echo "Total size: $ARCHIVE_SIZE"
echo "Archive files: $ARCHIVE_COUNT"
echo ""

# Get database audit log statistics
echo "Database audit log statistics:"
PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -c "
    SELECT
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE archived = TRUE) as archived_events,
        COUNT(*) FILTER (WHERE archived = FALSE) as active_events,
        MIN(timestamp) as oldest_event,
        MAX(timestamp) as newest_event,
        pg_size_pretty(pg_total_relation_size('audit_events')) as total_size
    FROM audit_events;
"

echo ""
echo -e "${GREEN}Retention script completed successfully${NC}"
echo "=================================================="

# Optional: Compress old archives (older than 1 year)
# find "$ARCHIVE_DIR" -name "*.sql.gz" -mtime +365 -exec xz -9 {} \;

exit 0
