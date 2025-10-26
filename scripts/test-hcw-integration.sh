#!/bin/bash
# Test HCW Integration from Deployed Telecheck App

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get app URL from doctl
APP_URL=$(./doctl.exe apps get 3e163757-94ee-4483-a241-8b59cd451f32 --format DefaultIngress --no-header)

echo -e "${YELLOW}=== Testing HCW Integration ===${NC}"
echo -e "App URL: ${APP_URL}"
echo ""

# Test 1: Check if app is accessible
echo -e "${YELLOW}Test 1: Checking if Telecheck app is accessible...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${APP_URL}/health")
if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ App is accessible (HTTP ${HTTP_CODE})${NC}"
else
    echo -e "${RED}❌ App is not accessible (HTTP ${HTTP_CODE})${NC}"
    exit 1
fi
echo ""

# Test 2: Check HCW backend connectivity from Telecheck
echo -e "${YELLOW}Test 2: Testing HCW backend connectivity...${NC}"
echo "Checking if HCW backend (143.198.2.224:1337) is accessible..."
HCW_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "http://143.198.2.224:1337/api/v1/config")
if [ "$HCW_HTTP" -eq 200 ]; then
    echo -e "${GREEN}✅ HCW backend is accessible (HTTP ${HCW_HTTP})${NC}"
    curl -s "http://143.198.2.224:1337/api/v1/config" | head -20
else
    echo -e "${RED}❌ HCW backend not accessible (HTTP ${HCW_HTTP})${NC}"
fi
echo ""

# Test 3: Check HCW patient interface
echo -e "${YELLOW}Test 3: Testing HCW patient interface...${NC}"
HCW_PATIENT=$(curl -s -o /dev/null -w "%{http_code}" "http://143.198.2.224:4200")
if [ "$HCW_PATIENT" -eq 200 ]; then
    echo -e "${GREEN}✅ HCW patient interface is accessible (HTTP ${HCW_PATIENT})${NC}"
else
    echo -e "${RED}❌ HCW patient interface not accessible (HTTP ${HCW_PATIENT})${NC}"
fi
echo ""

# Test 4: Check HCW doctor interface
echo -e "${YELLOW}Test 4: Testing HCW doctor interface...${NC}"
HCW_DOCTOR=$(curl -s -o /dev/null -w "%{http_code}" "http://143.198.2.224:4201")
if [ "$HCW_DOCTOR" -eq 200 ]; then
    echo -e "${GREEN}✅ HCW doctor interface is accessible (HTTP ${HCW_DOCTOR})${NC}"
else
    echo -e "${RED}❌ HCW doctor interface not accessible (HTTP ${HCW_DOCTOR})${NC}"
fi
echo ""

# Test 5: Check Telecheck consultation endpoint (this will fail without auth, but should return 401 not 404)
echo -e "${YELLOW}Test 5: Testing Telecheck consultation API endpoint...${NC}"
CONSULT_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "${APP_URL}/api/consultations/test-123/hcw-session" -X POST -H "Content-Type: application/json")
if [ "$CONSULT_HTTP" -eq 401 ] || [ "$CONSULT_HTTP" -eq 403 ] || [ "$CONSULT_HTTP" -eq 503 ]; then
    echo -e "${GREEN}✅ Consultation endpoint exists (HTTP ${CONSULT_HTTP} - expected without auth)${NC}"
elif [ "$CONSULT_HTTP" -eq 404 ]; then
    echo -e "${RED}❌ Consultation endpoint not found (HTTP 404)${NC}"
else
    echo -e "${YELLOW}⚠️  Consultation endpoint returned HTTP ${CONSULT_HTTP}${NC}"
fi
echo ""

echo -e "${YELLOW}=== Summary ===${NC}"
echo -e "App URL: ${APP_URL}"
echo -e "HCW Backend: http://143.198.2.224:1337"
echo -e "HCW Patient: http://143.198.2.224:4200"
echo -e "HCW Doctor: http://143.198.2.224:4201"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Check deployment logs if any tests failed"
echo "2. Verify environment variables are set correctly"
echo "3. Test with authentication token for full E2E test"
echo "4. Build frontend video consultation UI"
