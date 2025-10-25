# Telecheck V2.0 - Deployment Quick Reference Card

**Version**: 2.0.0
**Last Updated**: 2025-10-25
**Status**: Production Ready ✅

---

## 🚀 One-Command Deployment

```bash
# Full production deployment (20 minutes)
./scripts/deploy-production.sh
```

---

## 📋 Prerequisites Checklist

```bash
# 1. Environment file
cp .env.production.template .env.production
# Edit .env.production with your secrets

# 2. Verify Docker
docker --version  # Should be 20.10+
docker-compose --version  # Should be 2.0+

# 3. Check images exist
docker images | grep telecheck

# If images don't exist, build them:
./scripts/build-production-images.sh v2.0.0
```

---

## 🔧 Common Commands

### Build
```bash
# Build production images
./scripts/build-production-images.sh v2.0.0

# With security scan
DOCKER_REGISTRY=your-registry ./scripts/build-production-images.sh v2.0.0
```

### Deploy
```bash
# Full deployment
./scripts/deploy-production.sh

# Start specific services
cd infrastructure
docker-compose -f docker-compose.production.yml up -d postgres redis
docker-compose -f docker-compose.production.yml up -d api web nginx
```

### Test
```bash
# Run smoke tests
./scripts/smoke-test-production.sh

# Check specific service health
curl http://localhost:3000/health  # API
curl http://localhost:80/  # Web
curl http://localhost:8080/health  # Keycloak
```

### Monitor
```bash
# View logs (all services)
docker-compose -f infrastructure/docker-compose.production.yml logs -f

# View specific service logs
docker logs telecheck-api -f
docker logs telecheck-postgres -f

# Grafana dashboards
open http://localhost:3001  # admin/admin
```

### Backup
```bash
# Create backup
./scripts/backup-database.sh

# Restore from backup
./scripts/restore-database.sh /path/to/backup.sql.gz.gpg

# Test disaster recovery
./scripts/test-disaster-recovery.sh
```

---

## 🔒 Security Operations

### Vault Management
```bash
# Initialize Vault (first time only)
./scripts/vault-init.sh

# Unseal Vault (after restart)
vault operator unseal <unseal-key-1>
vault operator unseal <unseal-key-2>
vault operator unseal <unseal-key-3>

# Check Vault status
vault status
```

### Certificate Management
```bash
# Set up Let's Encrypt
./scripts/setup-letsencrypt.sh

# Renew certificates
./scripts/renew-certificates.sh

# Test TLS configuration
./scripts/validate-tls.sh
```

### Key Rotation
```bash
# Rotate encryption keys
./scripts/rotate-encryption-keys.sh

# Verify no hardcoded secrets
./scripts/verify-no-secrets.sh
```

---

## 📊 Monitoring URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Application** | https://telecheck.health | - |
| **Grafana** | http://localhost:3001 | admin/admin |
| **Prometheus** | http://localhost:9090 | - |
| **Alertmanager** | http://localhost:9093 | - |
| **Keycloak** | http://localhost:8080 | admin/admin |

---

## 🐛 Troubleshooting

### Service Won't Start
```bash
# Check logs
docker logs <container-name>

# Verify environment variables
docker exec <container-name> env | grep DATABASE_URL

# Check health
docker inspect --format='{{.State.Health.Status}}' <container-name>
```

### Database Connection Issues
```bash
# Check Postgres is running
docker exec telecheck-postgres pg_isready -U telecheck

# Test connection
docker exec telecheck-postgres psql -U telecheck -d telecheck -c "SELECT 1"

# View Postgres logs
docker logs telecheck-postgres --tail 100
```

### Vault Sealed
```bash
# Check status
docker exec vault-1 vault status

# Unseal with 3 keys
docker exec vault-1 vault operator unseal <key-1>
docker exec vault-1 vault operator unseal <key-2>
docker exec vault-1 vault operator unseal <key-3>
```

### API Health Check Failing
```bash
# Check API logs
docker logs telecheck-api --tail 100

# Test database connection
curl http://localhost:3000/health/db

# Test Redis connection
curl http://localhost:3000/health/redis

# Test Vault connection
curl http://localhost:3000/health/vault
```

### High Memory/CPU Usage
```bash
# Check container resources
docker stats

# View container limits
docker inspect <container-name> | grep -A 5 "Memory\|Cpu"

# Restart specific service
docker-compose -f infrastructure/docker-compose.production.yml restart api
```

---

## 🔄 Rollback Procedure

```bash
# 1. Stop current deployment
cd infrastructure
docker-compose -f docker-compose.production.yml down

# 2. Restore database backup
./scripts/restore-database.sh /path/to/backup.sql.gz.gpg

# 3. Deploy previous version
docker-compose -f docker-compose.production.yml up -d

# 4. Verify
./scripts/smoke-test-production.sh
```

---

## 📞 Emergency Contacts

| Issue | Action |
|-------|--------|
| **Service Down** | Check logs, restart service |
| **Database Corruption** | Restore from backup |
| **Vault Sealed** | Unseal with 3 keys |
| **SSL Expired** | Run renew-certificates.sh |
| **High Load** | Check Grafana, scale API replicas |

---

## ✅ Health Check Matrix

| Component | Endpoint | Expected |
|-----------|----------|----------|
| API | `curl localhost:3000/health` | `{"status":"ok"}` |
| API DB | `curl localhost:3000/health/db` | `{"connected":true}` |
| API Redis | `curl localhost:3000/health/redis` | `{"connected":true}` |
| API Vault | `curl localhost:3000/health/vault` | `{"connected":true}` |
| Web | `curl localhost:80` | HTTP 200 |
| Keycloak | `curl localhost:8080/health` | `{"status":"UP"}` |
| Prometheus | `curl localhost:9090/-/healthy` | HTTP 200 |
| Grafana | `curl localhost:3001/api/health` | `{"status":"ok"}` |

---

## 🔐 Security Checklist

Daily:
- [ ] Check Grafana security dashboard
- [ ] Review failed login attempts
- [ ] Verify all services healthy

Weekly:
- [ ] Review audit logs
- [ ] Check certificate expiration
- [ ] Verify backups completed
- [ ] Run security scan

Monthly:
- [ ] Rotate encryption keys
- [ ] Update dependencies
- [ ] Review user access
- [ ] Test disaster recovery

---

## 📦 Container Reference

| Container | Image | Replicas | Resources |
|-----------|-------|----------|-----------|
| telecheck-postgres | postgres:15-alpine | 1 | 2 CPU, 4GB RAM |
| telecheck-redis | redis:7-alpine | 1 | 1 CPU, 1.5GB RAM |
| telecheck-api | telecheck-api:v2.0.0 | 2 | 2 CPU, 2GB RAM each |
| telecheck-web | telecheck-web:v2.0.0 | 1 | 0.5 CPU, 512MB RAM |
| telecheck-nginx | nginx:1.25-alpine | 1 | 1 CPU, 512MB RAM |
| telecheck-keycloak | quay.io/keycloak/keycloak | 1 | 2 CPU, 2GB RAM |
| vault-1/2/3 | hashicorp/vault:1.15 | 3 | 1 CPU, 1GB RAM each |

---

## 🎯 Success Criteria

Post-deployment verification:
- [ ] All smoke tests pass (40+)
- [ ] SSL Labs A+ rating
- [ ] API response time < 200ms (p95)
- [ ] Database encryption verified
- [ ] Audit logging working
- [ ] Monitoring dashboards populated
- [ ] Backup completed successfully
- [ ] No CRITICAL vulnerabilities

---

## 📚 Documentation Links

- **Full Deployment Guide**: [WEEK10_DAY2_DEPLOYMENT_COMPLETE.md](WEEK10_DAY2_DEPLOYMENT_COMPLETE.md)
- **Architecture Overview**: [NewDesign.md](NewDesign.md)
- **Security Guide**: [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md)
- **HIPAA Compliance**: [docs/AUDIT_COMPLIANCE.md](docs/AUDIT_COMPLIANCE.md)
- **Keycloak Setup**: [docs/KEYCLOAK_DEPLOYMENT.md](docs/KEYCLOAK_DEPLOYMENT.md)

---

**Print this card and keep it handy during deployments!**

---

**Last Updated**: 2025-10-25
**Version**: 2.0.0
**Status**: ✅ Production Ready
