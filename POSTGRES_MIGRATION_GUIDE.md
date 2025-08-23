# PostgreSQL Migration & DigitalOcean Deployment Guide

## 🎯 Overview

This guide will help you migrate your Telecheck Healthcare application from SQLite to DigitalOcean Managed PostgreSQL and deploy it to DigitalOcean App Platform.

## 📋 Prerequisites

1. DigitalOcean account
2. Existing SQLite database with your data
3. GitHub repository with your application code
4. Node.js 18+ installed locally

## 🗄️ Step 1: Set Up DigitalOcean Managed PostgreSQL

### 1.1 Create Database via DigitalOcean Dashboard

1. **Login to DigitalOcean** → Databases → Create Database
2. **Choose PostgreSQL 15**
3. **Select Plan**:
   - **Development**: Basic plan ($15/month)
   - **Production**: Professional plan ($60/month)
4. **Configuration**:
   ```
   Database Name: telecheck
   Region: Choose closest to your users
   VPC: Default VPC (or create new)
   ```
5. **Create Database**

### 1.2 Get Connection Details

After creation, you'll get:

```bash
Host: your-db-host.db.ondigitalocean.com
Port: 25060
Username: doadmin
Password: [generated-password]
Database: telecheck
SSL Mode: require
```

### 1.3 Create Connection String

```bash
DATABASE_URL=postgresql://doadmin:your-password@your-db-host.db.ondigitalocean.com:25060/telecheck?sslmode=require
```

## 🔄 Step 2: Database Migration

### 2.1 Install PostgreSQL Dependencies

```bash
# Add PostgreSQL client library
npm install pg @types/pg

# Install migration dependencies (if not already installed)
npm install --save-dev sqlite3
```

### 2.2 Prepare Migration Environment

```bash
# Copy environment template
cp .env.example .env.production

# Edit with your PostgreSQL connection
nano .env.production
```

Add your database connection:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://doadmin:your-password@your-db-host.db.ondigitalocean.com:25060/telecheck?sslmode=require
JWT_SECRET=your-super-secret-key
TELNYX_API_KEY=your-telnyx-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### 2.3 Run Database Migration

```bash
# Make migration script executable
chmod +x scripts/migrate-to-postgres.js

# Set environment variables
export $(cat .env.production | xargs)

# Run migration
node scripts/migrate-to-postgres.js
```

The migration will:

- ✅ Create PostgreSQL schema
- ✅ Transfer all data from SQLite
- ✅ Update sequences
- ✅ Validate data integrity
- ✅ Generate migration report

### 2.4 Verify Migration

```bash
# Test PostgreSQL connection
node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => {
  console.log('✅ PostgreSQL connected successfully');
  return client.query('SELECT COUNT(*) FROM users');
}).then(result => {
  console.log('📊 Users in database:', result.rows[0].count);
  client.end();
}).catch(console.error);
"
```

## 🚀 Step 3: Deploy to DigitalOcean App Platform

### 3.1 Deploy via DigitalOcean Dashboard

1. **Go to Apps** → Create App
2. **Connect GitHub Repository**
   - Select your repository
   - Branch: `main`
   - Auto-deploy: ✅ Enabled

3. **Configure App Settings**:

   ```yaml
   App Name: telecheck-healthcare
   Region: Same as your database
   Plan: Basic ($5/month) or Professional ($12/month)
   ```

4. **Build Configuration**:

   ```bash
   Build Command: npm run build
   Run Command: npm start
   HTTP Port: 8080
   Output Directory: dist/spa
   ```

5. **Environment Variables**:

   ```bash
   NODE_ENV=production
   PORT=8080
   JWT_SECRET=your-super-secret-key
   TELNYX_API_KEY=your-telnyx-key
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   ```

6. **Link Database**:
   - In the Apps section, go to your app
   - Go to Settings → App-Level Environment Variables
   - DigitalOcean will automatically inject `DATABASE_URL`

### 3.2 Deploy via CLI (Alternative)

```bash
# Install doctl CLI
# macOS: brew install doctl
# Linux: See DigitalOcean docs

# Authenticate
doctl auth init

# Deploy using app spec
doctl apps create --spec .do/app.yaml

# Get app ID and update if needed
export DO_APP_ID=$(doctl apps list --format ID --no-header)
doctl apps update $DO_APP_ID --spec .do/app.yaml
```

### 3.3 Configure Database Connection

The app will automatically use PostgreSQL if `DATABASE_URL` is set. The database adapter will:

- ✅ Auto-detect PostgreSQL vs SQLite
- ✅ Use appropriate query syntax
- ✅ Handle connection pooling
- ✅ Provide health checks

## 🔧 Step 4: Application Updates

### 4.1 Update Import Statements

In your route files, update database imports:

```typescript
// OLD: Direct SQLite import
import { database } from "../utils/database";

// NEW: Database adapter (supports both)
import { db } from "../utils/databaseAdapter";
```

### 4.2 Test Locally with PostgreSQL

```bash
# Set environment variables
export DATABASE_URL="your-postgres-connection-string"

# Run application
npm run build
npm start

# Test endpoints
curl http://localhost:8080/api/health
curl http://localhost:8080/api/users/user-123
```

## 🏥 Step 5: Healthcare-Specific Configuration

### 5.1 HIPAA Compliance Features

Your PostgreSQL setup includes:

- ✅ **Encryption at rest**: Enabled by default on DigitalOcean
- ✅ **SSL/TLS encryption**: Required for all connections
- ✅ **Audit logging**: All activities logged with timestamps
- ✅ **Access controls**: Role-based database permissions
- ✅ **Backup**: Automatic daily backups retained for 7 days

### 5.2 Enable Additional Security

```sql
-- Connect to your database and run:
CREATE ROLE telecheck_app LOGIN PASSWORD 'strong-app-password';
GRANT CONNECT ON DATABASE telecheck TO telecheck_app;
GRANT USAGE ON SCHEMA public TO telecheck_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO telecheck_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO telecheck_app;

-- Use this role in your application instead of doadmin
```

### 5.3 Set Up Monitoring

1. **Enable Database Metrics** in DigitalOcean dashboard
2. **Set up Alerts**:
   - CPU usage > 80%
   - Memory usage > 85%
   - Disk usage > 90%
   - Connection count > 80% of limit

## 📊 Step 6: Performance Optimization

### 6.1 Database Optimization

```sql
-- Create additional indexes for healthcare queries
CREATE INDEX idx_vital_signs_patient_type_date ON vital_signs(user_id, type, measured_at);
CREATE INDEX idx_lab_results_patient_date ON lab_results(user_id, date_collected);
CREATE INDEX idx_medications_patient_active ON medications(user_id, active);
CREATE INDEX idx_chat_messages_patient_date ON chat_messages(user_id, timestamp);
```

### 6.2 Connection Pool Settings

The PostgreSQL adapter automatically configures:

```typescript
// Optimal pool settings for healthcare app
{
  max: 20,              // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  keepAlive: true
}
```

## 🔄 Step 7: Data Backup Strategy

### 7.1 Automatic Backups

DigitalOcean Managed Database provides:

- ✅ **Daily backups**: Automatic, retained for 7 days
- ✅ **Point-in-time recovery**: Last 7 days
- ✅ **Cross-region backups**: Available for production

### 7.2 Manual Backup Script

```bash
#!/bin/bash
# Create manual backup
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_${DATE}.sql

# Upload to DigitalOcean Spaces (optional)
# s3cmd put backup_${DATE}.sql s3://your-backup-bucket/
```

## 🚨 Step 8: Troubleshooting

### 8.1 Common Issues

**Connection Refused**:

```bash
# Check if DATABASE_URL is set correctly
echo $DATABASE_URL

# Test connection manually
psql $DATABASE_URL -c "SELECT version();"
```

**SSL Certificate Issues**:

```bash
# Add SSL configuration to connection string
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require&sslcert=client-cert.pem&sslkey=client-key.pem&sslrootcert=ca-cert.pem"
```

**Migration Fails**:

```bash
# Check SQLite database exists
ls -la telecheck.db

# Check PostgreSQL permissions
psql $DATABASE_URL -c "\l"
```

### 8.2 Performance Issues

```sql
-- Check active connections
SELECT COUNT(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(tablename::text))
FROM pg_tables
WHERE schemaname = 'public';
```

## 💰 Cost Estimation

### Monthly Costs:

- **DigitalOcean App Platform**: $5-12/month
- **Managed PostgreSQL**: $15/month (Basic) - $60/month (Professional)
- **Total**: $20-72/month

### Cost Optimization:

- Use Basic database plan for development
- Scale up to Professional for production
- Monitor usage and adjust as needed

## ✅ Step 9: Go-Live Checklist

Before going live with PostgreSQL:

- [ ] ✅ Database migration completed successfully
- [ ] ✅ Application deployed to DigitalOcean App Platform
- [ ] ✅ DATABASE_URL environment variable configured
- [ ] ✅ SSL certificates working
- [ ] ✅ All API endpoints responding correctly
- [ ] ✅ User authentication working
- [ ] ✅ Data integrity verified (user records, vital signs, etc.)
- [ ] ✅ Backup strategy configured
- [ ] ✅ Monitoring and alerts set up
- [ ] ✅ Security settings reviewed
- [ ] ✅ Performance testing completed

## 🎉 Benefits of PostgreSQL Migration

Your healthcare application now has:

✅ **Better Performance**: Optimized queries and indexing
✅ **Enhanced Security**: Enterprise-grade database security
✅ **Scalability**: Handle growing patient data
✅ **Reliability**: 99.95% uptime SLA
✅ **HIPAA Compliance**: Healthcare-grade data protection
✅ **Automatic Backups**: Point-in-time recovery
✅ **Real-time Analytics**: Advanced reporting capabilities
✅ **Multi-user Support**: Concurrent access handling

## 📞 Support

If you encounter issues:

1. **DigitalOcean Support**: Available 24/7 for database issues
2. **Application Logs**: Check App Platform logs for errors
3. **Database Monitoring**: Use DigitalOcean's built-in metrics
4. **Community**: DigitalOcean community forums

Your telehealth application is now running on enterprise-grade infrastructure! 🏥
