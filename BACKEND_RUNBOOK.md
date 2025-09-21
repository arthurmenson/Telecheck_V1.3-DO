# Telecheck Backend Services - Development Runbook

## 🏗️ Architecture Overview

The Telecheck backend implements a microservices architecture with the following components:

### Services Implemented
- **Gateway Service** (Port 3000) - API gateway with JWT auth, routing, rate limiting
- **EHR Service** (Port 3002) - Patient management, scheduling, intake forms, messaging
- **RPM Service** (Port 3003) - Remote patient monitoring, vitals, alerts, thresholds

### Services Pending
- **Auth Service** (Port 3001) - Authentication and authorization
- **Labs Service** (Port 3004) - Lab analysis and results
- **Medications Service** (Port 3005) - Medication management and interactions
- **Analytics Service** (Port 3006) - Analytics and reporting
- **Messaging Service** (Port 3007) - Patient-provider messaging
- **Files Service** (Port 3008) - File management and storage
- **Billing Service** (Port 3009) - EDI billing and eligibility

## 🚀 Quick Start

### Prerequisites
```bash
# Node.js 20+
node --version

# Docker and Docker Compose
docker --version
docker-compose --version

# PostgreSQL (for local development)
psql --version

# Redis (for caching and rate limiting)
redis-cli --version
```

### Environment Setup
```bash
# Clone the repository
cd telecheck_backend

# Install dependencies for each service
cd services/gateway && npm install
cd ../ehr && npm install
cd ../rpm && npm install

# Copy environment files
cp local.env .env
```

### Database Setup
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run migrations for each service
cd services/ehr && npm run db:migrate
cd ../rpm && npm run db:migrate

# Seed test data
cd services/ehr && npm run db:seed
cd ../rpm && npm run db:seed
```

### Start Services

#### Option 1: Development Mode (Recommended)
```bash
# Terminal 1 - Gateway
cd services/gateway
npm run dev

# Terminal 2 - EHR Service
cd services/ehr
npm run dev

# Terminal 3 - RPM Service
cd services/rpm
npm run dev
```

#### Option 2: Docker Compose
```bash
# Start all services
docker-compose up --build

# Or start specific services
docker-compose up gateway ehr rpm
```

## 📊 Service Health Checks

```bash
# Gateway
curl http://localhost:3000/health

# EHR Service
curl http://localhost:3002/health

# RPM Service
curl http://localhost:3003/health
```

## 🔧 API Testing

### Authentication (Mock for Development)
```bash
# The gateway expects these headers from the auth service:
# x-user-id: user-uuid
# x-user-role: patient|doctor|admin|nurse|pharmacist
# x-request-id: request-uuid

# For testing, you can add these headers manually
curl -H "x-user-id: test-user-123" \
     -H "x-user-role: patient" \
     -H "x-request-id: req-123" \
     http://localhost:3000/api/ehr/patients/123
```

### EHR Endpoints
```bash
# Get patient
curl -H "x-user-id: test-user" -H "x-user-role: doctor" \
  http://localhost:3000/api/ehr/patients/123

# Get available slots
curl -H "x-user-id: test-user" -H "x-user-role: patient" \
  http://localhost:3000/api/ehr/scheduling/slots

# Book appointment
curl -X POST -H "Content-Type: application/json" \
  -H "x-user-id: test-user" -H "x-user-role: patient" \
  -d '{"slotId":"s1","patientId":"123","appointmentType":"consultation"}' \
  http://localhost:3000/api/ehr/scheduling/book

# Submit intake form (will return error per MSW compatibility)
curl -X POST -H "Content-Type: application/json" \
  -H "x-user-id: test-user" -H "x-user-role: patient" \
  -d '{"patientId":"123","chiefComplaint":"Headache"}' \
  http://localhost:3000/api/ehr/intake
```

### RPM Endpoints
```bash
# Get vitals trends
curl -H "x-user-id: test-user" -H "x-user-role: patient" \
  http://localhost:3000/api/vitals/trends

# Get patient vitals
curl -H "x-user-id: test-user" -H "x-user-role: doctor" \
  http://localhost:3000/api/rpm/patients/123/vitals?days=7

# Get patient alerts
curl -H "x-user-id: test-user" -H "x-user-role: doctor" \
  http://localhost:3000/api/rpm/patients/123/alerts

# Get patient thresholds
curl -H "x-user-id: test-user" -H "x-user-role: doctor" \
  http://localhost:3000/api/rpm/patients/123/thresholds
```

### Chaos Mode Testing
```bash
# Test chaos mode endpoints (random 401/500 errors)
curl http://localhost:3000/api/ehr/scheduling/slots?chaos=1
curl http://localhost:3000/api/labs/analyze?chaos=1
```

## 🧪 Testing

### Unit Tests
```bash
cd services/gateway && npm test
cd services/ehr && npm test
cd services/rpm && npm test
```

### Integration Tests
```bash
cd services/ehr && npm run test:integration
cd services/rpm && npm run test:integration
```

### End-to-End Tests
```bash
# Run existing Playwright tests against the backend
npm run test:e2e
```

### Contract Tests
```bash
# Run Pact provider verification
cd services/ehr && npm run test:contract
```

## 📝 API Documentation

### OpenAPI Specifications
- **Auth API**: `contracts/auth.openapi.yaml`
- **EHR API**: `contracts/ehr.openapi.yaml`
- **RPM API**: `contracts/rpm.openapi.yaml`
- **Labs API**: `contracts/labs.openapi.yaml`
- **Medications API**: `contracts/medications.openapi.yaml`

### Generate SDK and Mocks
```bash
# Generate TypeScript SDK from OpenAPI specs
npm run gen:sdk

# Generate updated MSW mocks
npm run gen:mocks
```

### API Gateway Documentation
```bash
# View service routing information
curl http://localhost:3000/api/docs
```

## 🐛 Debugging

### Service Logs
```bash
# View gateway logs
docker-compose logs -f gateway

# View EHR service logs
docker-compose logs -f ehr

# View RPM service logs
docker-compose logs -f rpm
```

### Database Access
```bash
# Connect to PostgreSQL
docker exec -it telecheck_postgres psql -U postgres -d telecheck_ehr

# Connect to Redis
docker exec -it telecheck_redis redis-cli
```

### Common Issues

1. **Port Conflicts**
   - Check if ports 3000-3009 are available
   - Update docker-compose.yml port mappings if needed

2. **Database Connection Issues**
   - Ensure PostgreSQL is running: `docker-compose ps postgres`
   - Check connection string in .env files

3. **Authentication Errors**
   - Verify x-user-id and x-user-role headers are set
   - Check gateway JWT configuration

4. **CORS Issues**
   - Update CORS origins in gateway configuration
   - Verify frontend is running on expected port

## 🔒 Security Features

### Implemented
- **JWT Authentication**: Token verification at gateway
- **Rate Limiting**: Per-service and global rate limits
- **Audit Logging**: HIPAA-compliant audit trails
- **PII Redaction**: Automatic redaction in logs
- **Request ID Tracking**: End-to-end request tracing
- **Security Headers**: Helmet.js security headers

### PHI/PII Protection
- All logs automatically redact sensitive data
- Audit events track PHI access
- Error responses sanitize sensitive information

## 📊 Monitoring

### Health Endpoints
- Gateway: `GET /health`
- EHR: `GET /health`
- RPM: `GET /health`

### Metrics
- Request latency tracking
- Error rate monitoring
- Database connection health
- Rate limit violations

### Audit Logs
```bash
# View audit logs
docker-compose logs gateway | grep '"type":"audit"'
docker-compose logs ehr | grep '"type":"ehr_audit"'
docker-compose logs rpm | grep '"type":"rpm_audit"'
```

## 🚢 Deployment

### Development
```bash
# Build all services
docker-compose build

# Deploy to development environment
./scripts/deploy-dev.sh
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] Monitoring and alerting set up
- [ ] Audit log aggregation configured
- [ ] Backup procedures in place

## 🔄 Next Steps

### Pending Services
1. **Auth Service** - JWT token management and user authentication
2. **Labs Service** - AI-powered lab analysis with S3 storage
3. **Medications Service** - Drug interaction checking and management
4. **Billing Service** - EDI 837/835 processing

### Testing Strategy
1. **Unit Tests** - Business logic and validation
2. **Integration Tests** - Database interactions with Testcontainers
3. **Contract Tests** - Pact provider verification
4. **E2E Tests** - Playwright smoke tests
5. **Load Tests** - Performance and scalability validation

### Infrastructure
1. **Service Discovery** - Consul or Kubernetes service mesh
2. **Load Balancing** - NGINX or AWS ALB
3. **Observability** - Prometheus + Grafana + Jaeger
4. **Secret Management** - AWS Secrets Manager or Vault

## 📞 Support

For issues or questions:
1. Check this runbook first
2. Review service logs
3. Consult OpenAPI documentation
4. Contact the backend team

---

**Last Updated**: January 2025  
**Version**: 1.0.0
