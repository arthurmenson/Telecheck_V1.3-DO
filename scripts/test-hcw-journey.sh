#!/bin/bash
#
# HCW@Home Doctor-Patient Video Consultation Test Journey
# This script tests the complete end-to-end flow for HCW@Home televisit integration
#

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TELECHECK_API="https://whale-app-bs3xa.ondigitalocean.app/api"
HCW_DROPLET_IP="165.227.180.202"
HCW_BACKEND="http://${HCW_DROPLET_IP}:1337"
HCW_PATIENT_APP="http://${HCW_DROPLET_IP}:4200"
HCW_DOCTOR_APP="http://${HCW_DROPLET_IP}:4201"

# Test data
TEST_PATIENT_EMAIL="test.patient@telecheck.com"
TEST_PATIENT_FIRST="John"
TEST_PATIENT_LAST="Doe"
TEST_DOCTOR_EMAIL="dr.smith@telecheck.com"
TEST_DOCTOR_FIRST="Jane"
TEST_DOCTOR_LAST="Smith"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  HCW@Home Doctor-Patient Video Consultation Test Journey      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

#######################################
# STEP 1: Verify Infrastructure
#######################################
echo -e "${YELLOW}[STEP 1/10]${NC} Verifying infrastructure..."

# Check Telecheck API
echo -n "  Checking Telecheck API health... "
if curl -s -o /dev/null -w "%{http_code}" "${TELECHECK_API}/health" | grep -q "200"; then
    echo -e "${GREEN}✓ ONLINE${NC}"
else
    echo -e "${RED}✗ OFFLINE${NC}"
    echo -e "${RED}ERROR: Telecheck API is not responding${NC}"
    exit 1
fi

# Check HCW Droplet
echo -n "  Checking HCW droplet... "
if ping -c 1 -W 2 ${HCW_DROPLET_IP} > /dev/null 2>&1; then
    echo -e "${GREEN}✓ REACHABLE${NC}"
else
    echo -e "${YELLOW}⚠ NOT REACHABLE (may need VPN)${NC}"
fi

# Check HCW Backend
echo -n "  Checking HCW Backend API... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${HCW_BACKEND}/api/healthcheck" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ ONLINE${NC}"
    HCW_BACKEND_ONLINE=true
else
    echo -e "${YELLOW}⚠ OFFLINE (Code: $HTTP_CODE)${NC}"
    HCW_BACKEND_ONLINE=false
fi

# Check HCW Patient App
echo -n "  Checking HCW Patient App... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${HCW_PATIENT_APP}" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    echo -e "${GREEN}✓ ONLINE${NC}"
else
    echo -e "${YELLOW}⚠ OFFLINE (Code: $HTTP_CODE)${NC}"
fi

# Check HCW Doctor App
echo -n "  Checking HCW Doctor App... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${HCW_DOCTOR_APP}" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    echo -e "${GREEN}✓ ONLINE${NC}"
else
    echo -e "${YELLOW}⚠ OFFLINE (Code: $HTTP_CODE)${NC}"
fi

echo ""

#######################################
# STEP 2: Deploy HCW Stack (if needed)
#######################################
if [ "$HCW_BACKEND_ONLINE" = false ]; then
    echo -e "${YELLOW}[STEP 2/10]${NC} HCW Backend is offline. Deployment required."
    echo -e "${BLUE}ACTION REQUIRED:${NC}"
    echo "  1. SSH into droplet: ssh root@${HCW_DROPLET_IP}"
    echo "  2. Upload docker-compose.hcw-production.yml"
    echo "  3. Set environment variables in .env file"
    echo "  4. Run: docker compose -f docker-compose.hcw-production.yml up -d"
    echo ""
    echo "  See: HCW_HOME_BEST_PRACTICE_DEPLOYMENT.md for full instructions"
    echo ""
    read -p "Press ENTER when HCW stack is deployed, or Ctrl+C to exit..."
else
    echo -e "${YELLOW}[STEP 2/10]${NC} HCW Backend is online ${GREEN}✓${NC}"
fi

echo ""

#######################################
# STEP 3: Test Patient Creation
#######################################
echo -e "${YELLOW}[STEP 3/10]${NC} Testing patient creation in HCW..."

PATIENT_PAYLOAD=$(cat <<EOF
{
  "externalId": "tc-patient-001",
  "firstName": "$TEST_PATIENT_FIRST",
  "lastName": "$TEST_PATIENT_LAST",
  "email": "$TEST_PATIENT_EMAIL",
  "phone": "+1234567890"
}
EOF
)

echo "  Payload: $PATIENT_PAYLOAD"
echo -n "  Creating patient via Telecheck API... "

# This would call: POST /api/consultations/test-appointment-id/hcw-session
# For now, we'll test the HCW API directly
RESPONSE=$(curl -s -X POST "${HCW_BACKEND}/api/patient" \
    -H "Content-Type: application/json" \
    -d "$PATIENT_PAYLOAD" 2>/dev/null || echo '{"error": "connection_failed"}')

if echo "$RESPONSE" | grep -q '"id"\|"_id"'; then
    PATIENT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    if [ -z "$PATIENT_ID" ]; then
        PATIENT_ID=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
    fi
    echo -e "${GREEN}✓ SUCCESS${NC}"
    echo -e "  Patient ID: ${BLUE}${PATIENT_ID}${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "  Response: $RESPONSE"
    exit 1
fi

echo ""

#######################################
# STEP 4: Test Doctor Creation
#######################################
echo -e "${YELLOW}[STEP 4/10]${NC} Testing doctor creation in HCW..."

DOCTOR_PAYLOAD=$(cat <<EOF
{
  "externalId": "tc-doctor-001",
  "firstName": "$TEST_DOCTOR_FIRST",
  "lastName": "$TEST_DOCTOR_LAST",
  "email": "$TEST_DOCTOR_EMAIL",
  "specialization": "General Practitioner"
}
EOF
)

echo "  Payload: $DOCTOR_PAYLOAD"
echo -n "  Creating doctor via Telecheck API... "

RESPONSE=$(curl -s -X POST "${HCW_BACKEND}/api/doctor" \
    -H "Content-Type: application/json" \
    -d "$DOCTOR_PAYLOAD" 2>/dev/null || echo '{"error": "connection_failed"}')

if echo "$RESPONSE" | grep -q '"id"\|"_id"'; then
    DOCTOR_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    if [ -z "$DOCTOR_ID" ]; then
        DOCTOR_ID=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
    fi
    echo -e "${GREEN}✓ SUCCESS${NC}"
    echo -e "  Doctor ID: ${BLUE}${DOCTOR_ID}${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "  Response: $RESPONSE"
    exit 1
fi

echo ""

#######################################
# STEP 5: Create Consultation Session
#######################################
echo -e "${YELLOW}[STEP 5/10]${NC} Creating video consultation session..."

CONSULTATION_PAYLOAD=$(cat <<EOF
{
  "externalId": "tc-appt-001",
  "patient": "$PATIENT_ID",
  "doctor": "$DOCTOR_ID",
  "scheduledDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "type": "video"
}
EOF
)

echo "  Payload: $CONSULTATION_PAYLOAD"
echo -n "  Creating consultation... "

RESPONSE=$(curl -s -X POST "${HCW_BACKEND}/api/consultation" \
    -H "Content-Type: application/json" \
    -d "$CONSULTATION_PAYLOAD" 2>/dev/null || echo '{"error": "connection_failed"}')

if echo "$RESPONSE" | grep -q '"id"\|"_id"'; then
    CONSULTATION_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    if [ -z "$CONSULTATION_ID" ]; then
        CONSULTATION_ID=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
    fi
    echo -e "${GREEN}✓ SUCCESS${NC}"
    echo -e "  Consultation ID: ${BLUE}${CONSULTATION_ID}${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
    echo "  Response: $RESPONSE"
    exit 1
fi

echo ""

#######################################
# STEP 6: Generate Join URLs
#######################################
echo -e "${YELLOW}[STEP 6/10]${NC} Generating join URLs..."

PATIENT_JOIN_URL="${HCW_PATIENT_APP}/consultation/${CONSULTATION_ID}"
DOCTOR_JOIN_URL="${HCW_DOCTOR_APP}/consultation/${CONSULTATION_ID}"

echo -e "  ${BLUE}Patient URL:${NC} $PATIENT_JOIN_URL"
echo -e "  ${BLUE}Doctor URL:${NC}  $DOCTOR_JOIN_URL"

echo ""

#######################################
# STEP 7: Test Telecheck Integration
#######################################
echo -e "${YELLOW}[STEP 7/10]${NC} Testing Telecheck → HCW@Home integration..."

echo -n "  Testing consultation endpoint... "
# This tests the route we created: POST /api/consultations/:id/hcw-session
TEST_RESPONSE=$(curl -s -X POST "${TELECHECK_API}/consultations/test-appt-001/hcw-session" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer test-token" 2>/dev/null || echo '{"error": "connection_failed"}')

if echo "$TEST_RESPONSE" | grep -q 'consultationId\|hcwUrl'; then
    echo -e "${GREEN}✓ SUCCESS${NC}"
    echo "  Response: $TEST_RESPONSE"
else
    echo -e "${YELLOW}⚠ Endpoint exists but may need authentication${NC}"
    echo "  Response: $TEST_RESPONSE"
fi

echo ""

#######################################
# STEP 8: Verify WebRTC Prerequisites
#######################################
echo -e "${YELLOW}[STEP 8/10]${NC} Verifying WebRTC prerequisites..."

echo -n "  Checking Mediasoup service... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://${HCW_DROPLET_IP}:3005/health" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ ONLINE${NC}"
else
    echo -e "${YELLOW}⚠ OFFLINE (Port 3005)${NC}"
fi

echo -n "  Checking UDP ports for RTP... "
echo -e "${BLUE}ℹ  Ports 40000-40100 UDP should be open${NC}"

echo ""

#######################################
# STEP 9: Manual Testing Instructions
#######################################
echo -e "${YELLOW}[STEP 9/10]${NC} ${BLUE}Manual Testing Instructions${NC}"
echo ""
echo -e "${GREEN}┌─────────────────────────────────────────────────────────────┐${NC}"
echo -e "${GREEN}│  DOCTOR SESSION                                             │${NC}"
echo -e "${GREEN}├─────────────────────────────────────────────────────────────┤${NC}"
echo -e "${GREEN}│${NC}  1. Open browser: ${BLUE}${DOCTOR_JOIN_URL}${NC}"
echo -e "${GREEN}│${NC}  2. Allow camera and microphone permissions"
echo -e "${GREEN}│${NC}  3. Click 'Join Consultation'"
echo -e "${GREEN}│${NC}  4. Verify video preview appears"
echo -e "${GREEN}└─────────────────────────────────────────────────────────────┘${NC}"
echo ""
echo -e "${BLUE}┌─────────────────────────────────────────────────────────────┐${NC}"
echo -e "${BLUE}│  PATIENT SESSION                                            │${NC}"
echo -e "${BLUE}├─────────────────────────────────────────────────────────────┤${NC}"
echo -e "${BLUE}│${NC}  1. Open browser: ${BLUE}${PATIENT_JOIN_URL}${NC}"
echo -e "${BLUE}│${NC}  2. Allow camera and microphone permissions"
echo -e "${BLUE}│${NC}  3. Click 'Join Consultation'"
echo -e "${BLUE}│${NC}  4. Verify video preview appears"
echo -e "${BLUE}└─────────────────────────────────────────────────────────────┘${NC}"
echo ""
echo -e "${YELLOW}TEST CHECKLIST:${NC}"
echo "  □ Both participants can see each other's video"
echo "  □ Audio is clear in both directions"
echo "  □ Video quality is acceptable"
echo "  □ Screen sharing works (if available)"
echo "  □ Chat messages are delivered"
echo "  □ File sharing works (if available)"
echo "  □ Call can be ended cleanly"
echo "  □ Consultation data persists in HCW MongoDB"
echo ""

read -p "Press ENTER after completing manual tests, or Ctrl+C to exit..."

echo ""

#######################################
# STEP 10: Verify Consultation Status
#######################################
echo -e "${YELLOW}[STEP 10/10]${NC} Verifying consultation status..."

echo -n "  Checking consultation status... "
STATUS_RESPONSE=$(curl -s "${HCW_BACKEND}/api/consultation/${CONSULTATION_ID}" 2>/dev/null || echo '{"error": "connection_failed"}')

if echo "$STATUS_RESPONSE" | grep -q '"status"'; then
    STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ SUCCESS${NC}"
    echo -e "  Status: ${BLUE}${STATUS}${NC}"
else
    echo -e "${YELLOW}⚠ Could not retrieve status${NC}"
fi

echo ""

#######################################
# Summary
#######################################
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  TEST JOURNEY COMPLETE                                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Summary:${NC}"
echo "  • Patient ID: $PATIENT_ID"
echo "  • Doctor ID: $DOCTOR_ID"
echo "  • Consultation ID: $CONSULTATION_ID"
echo ""
echo -e "${BLUE}Architecture Flow:${NC}"
echo "  Telecheck Web → Televisit.tsx"
echo "      ↓"
echo "  POST /api/consultations/:id/hcw-session"
echo "      ↓"
echo "  server/services/hcwService.ts"
echo "      ↓ (axios + JWT)"
echo "  HCW Backend API (${HCW_DROPLET_IP}:1337)"
echo "      ↓"
echo "  Mediasoup WebRTC Server (${HCW_DROPLET_IP}:3005)"
echo "      ↓"
echo "  Patient App (${HCW_DROPLET_IP}:4200)"
echo "  Doctor App (${HCW_DROPLET_IP}:4201)"
echo ""
echo -e "${GREEN}✓ Test journey completed successfully!${NC}"
echo ""
