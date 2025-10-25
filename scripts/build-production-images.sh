#!/bin/bash
# =============================================================================
# Build Production Docker Images
#
# Purpose: Build and tag production Docker images for Telecheck V2.0
# Usage: ./scripts/build-production-images.sh [version]
# Example: ./scripts/build-production-images.sh v2.0.0
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VERSION="${1:-v2.0.0}"
REGISTRY="${DOCKER_REGISTRY:-telecheck}"  # Default to local, override with env var

echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}Building Telecheck V2.0 Production Images${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""
echo -e "Version: ${YELLOW}${VERSION}${NC}"
echo -e "Registry: ${YELLOW}${REGISTRY}${NC}"
echo ""

# -----------------------------------------------------------------------------
# Pre-build checks
# -----------------------------------------------------------------------------
echo -e "${YELLOW}Running pre-build checks...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Docker is not running${NC}"
    exit 1
fi

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}ERROR: Must run from project root directory${NC}"
    exit 1
fi

# Check if TypeScript compiles
echo -e "${YELLOW}Verifying TypeScript compilation...${NC}"
npm run typecheck
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: TypeScript compilation failed${NC}"
    exit 1
fi

# Check if tests pass
echo -e "${YELLOW}Running tests...${NC}"
npm test
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Tests failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Pre-build checks passed${NC}"
echo ""

# -----------------------------------------------------------------------------
# Build API Server Image
# -----------------------------------------------------------------------------
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}Building API Server Image${NC}"
echo -e "${GREEN}==============================================================================${NC}"

BUILD_START=$(date +%s)

docker build \
    -f Dockerfile.server \
    -t "${REGISTRY}/telecheck-api:${VERSION}" \
    -t "${REGISTRY}/telecheck-api:latest" \
    --build-arg NODE_ENV=production \
    --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
    --build-arg VCS_REF=$(git rev-parse --short HEAD) \
    --build-arg VERSION="${VERSION}" \
    .

if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: API server build failed${NC}"
    exit 1
fi

BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))

# Get image size
API_SIZE=$(docker images "${REGISTRY}/telecheck-api:${VERSION}" --format "{{.Size}}")

echo -e "${GREEN}✓ API server image built successfully${NC}"
echo -e "  Image: ${REGISTRY}/telecheck-api:${VERSION}"
echo -e "  Size: ${API_SIZE}"
echo -e "  Build time: ${BUILD_TIME}s"
echo ""

# -----------------------------------------------------------------------------
# Build Web Client Image
# -----------------------------------------------------------------------------
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}Building Web Client Image${NC}"
echo -e "${GREEN}==============================================================================${NC}"

BUILD_START=$(date +%s)

docker build \
    -f Dockerfile.client \
    -t "${REGISTRY}/telecheck-web:${VERSION}" \
    -t "${REGISTRY}/telecheck-web:latest" \
    --build-arg NODE_ENV=production \
    --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
    --build-arg VCS_REF=$(git rev-parse --short HEAD) \
    --build-arg VERSION="${VERSION}" \
    .

if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Web client build failed${NC}"
    exit 1
fi

BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))

# Get image size
WEB_SIZE=$(docker images "${REGISTRY}/telecheck-web:${VERSION}" --format "{{.Size}}")

echo -e "${GREEN}✓ Web client image built successfully${NC}"
echo -e "  Image: ${REGISTRY}/telecheck-web:${VERSION}"
echo -e "  Size: ${WEB_SIZE}"
echo -e "  Build time: ${BUILD_TIME}s"
echo ""

# -----------------------------------------------------------------------------
# Image Verification
# -----------------------------------------------------------------------------
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}Verifying Images${NC}"
echo -e "${GREEN}==============================================================================${NC}"

# Check API image size (should be < 500MB)
API_SIZE_MB=$(docker images "${REGISTRY}/telecheck-api:${VERSION}" --format "{{.Size}}" | sed 's/MB//')
if (( $(echo "$API_SIZE_MB > 500" | bc -l) )); then
    echo -e "${YELLOW}WARNING: API image size (${API_SIZE}) exceeds 500MB target${NC}"
fi

# Check web image size (should be < 150MB)
WEB_SIZE_MB=$(docker images "${REGISTRY}/telecheck-web:${VERSION}" --format "{{.Size}}" | sed 's/MB//')
if (( $(echo "$WEB_SIZE_MB > 150" | bc -l) )); then
    echo -e "${YELLOW}WARNING: Web image size (${WEB_SIZE}) exceeds 150MB target${NC}"
fi

# Test API container starts
echo -e "${YELLOW}Testing API container startup...${NC}"
API_CONTAINER=$(docker run -d --rm \
    -e DATABASE_URL="postgresql://test:test@localhost:5432/test" \
    -e REDIS_URL="redis://localhost:6379" \
    -e JWT_SECRET="test_secret_minimum_32_characters_long_for_testing" \
    "${REGISTRY}/telecheck-api:${VERSION}")

sleep 5

if docker ps | grep -q "$API_CONTAINER"; then
    echo -e "${GREEN}✓ API container started successfully${NC}"
    docker stop "$API_CONTAINER" > /dev/null 2>&1
else
    echo -e "${RED}ERROR: API container failed to start${NC}"
    docker logs "$API_CONTAINER"
    docker rm -f "$API_CONTAINER" > /dev/null 2>&1
    exit 1
fi

# Test web container starts
echo -e "${YELLOW}Testing web container startup...${NC}"
WEB_CONTAINER=$(docker run -d --rm -p 8081:80 "${REGISTRY}/telecheck-web:${VERSION}")

sleep 3

if docker ps | grep -q "$WEB_CONTAINER"; then
    echo -e "${GREEN}✓ Web container started successfully${NC}"
    docker stop "$WEB_CONTAINER" > /dev/null 2>&1
else
    echo -e "${RED}ERROR: Web container failed to start${NC}"
    docker logs "$WEB_CONTAINER"
    docker rm -f "$WEB_CONTAINER" > /dev/null 2>&1
    exit 1
fi

echo ""

# -----------------------------------------------------------------------------
# Security Scanning (Optional - requires Trivy)
# -----------------------------------------------------------------------------
if command -v trivy &> /dev/null; then
    echo -e "${GREEN}==============================================================================${NC}"
    echo -e "${GREEN}Security Scanning (Trivy)${NC}"
    echo -e "${GREEN}==============================================================================${NC}"

    echo -e "${YELLOW}Scanning API image...${NC}"
    trivy image --severity HIGH,CRITICAL "${REGISTRY}/telecheck-api:${VERSION}"

    echo ""
    echo -e "${YELLOW}Scanning web image...${NC}"
    trivy image --severity HIGH,CRITICAL "${REGISTRY}/telecheck-web:${VERSION}"

    echo ""
else
    echo -e "${YELLOW}Trivy not installed - skipping security scan${NC}"
    echo -e "Install with: brew install aquasecurity/trivy/trivy"
    echo ""
fi

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}Build Summary${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""
echo -e "${GREEN}✓ All images built successfully${NC}"
echo ""
echo -e "API Server:"
echo -e "  • ${REGISTRY}/telecheck-api:${VERSION} (${API_SIZE})"
echo -e "  • ${REGISTRY}/telecheck-api:latest"
echo ""
echo -e "Web Client:"
echo -e "  • ${REGISTRY}/telecheck-web:${VERSION} (${WEB_SIZE})"
echo -e "  • ${REGISTRY}/telecheck-web:latest"
echo ""

# -----------------------------------------------------------------------------
# Next Steps
# -----------------------------------------------------------------------------
echo -e "${YELLOW}==============================================================================${NC}"
echo -e "${YELLOW}Next Steps${NC}"
echo -e "${YELLOW}==============================================================================${NC}"
echo ""
echo -e "1. Push images to registry:"
echo -e "   ${YELLOW}docker push ${REGISTRY}/telecheck-api:${VERSION}${NC}"
echo -e "   ${YELLOW}docker push ${REGISTRY}/telecheck-api:latest${NC}"
echo -e "   ${YELLOW}docker push ${REGISTRY}/telecheck-web:${VERSION}${NC}"
echo -e "   ${YELLOW}docker push ${REGISTRY}/telecheck-web:latest${NC}"
echo ""
echo -e "2. Deploy to production:"
echo -e "   ${YELLOW}cd infrastructure && docker-compose -f docker-compose.production.yml up -d${NC}"
echo ""
echo -e "3. Verify deployment:"
echo -e "   ${YELLOW}./scripts/smoke-test-production.sh${NC}"
echo ""

echo -e "${GREEN}Build complete!${NC}"
