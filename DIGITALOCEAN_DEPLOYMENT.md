# DigitalOcean Deployment Guide

## 🚀 Option 1: DigitalOcean App Platform (Recommended)

### Prerequisites

1. DigitalOcean account
2. GitHub repository with your code
3. `doctl` CLI installed (optional)

### Step 1: Install DigitalOcean CLI (Optional)

```bash
# macOS
brew install doctl

# Linux/WSL
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin

# Windows
# Download from: https://github.com/digitalocean/doctl/releases
```

### Step 2: Deploy via DigitalOcean Dashboard

1. **Log into DigitalOcean** → Go to "Apps" → "Create App"

2. **Connect GitHub Repository**
   - Select your repository
   - Choose the main branch
   - Enable auto-deploy on push

3. **Configure App Settings**

   ```yaml
   Name: telecheck-healthcare
   Region: Choose closest to your users
   Plan: Basic ($5/month) or Professional ($12/month)
   ```

4. **Environment Variables** (Add these in the dashboard):

   ```
   NODE_ENV=production
   PORT=8080
   JWT_SECRET=your-secret-key-here
   TELNYX_API_KEY=your-telnyx-key
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   ```

5. **Build Settings**:
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Output Directory: `dist/spa` (for static files)

### Step 3: Database Setup

**Option A: DigitalOcean Managed Database**

1. Create a PostgreSQL database in DigitalOcean
2. Add the connection string to your app's environment variables
3. Update your application to use PostgreSQL instead of SQLite

**Option B: Keep SQLite (simpler)**

1. Your existing SQLite setup will work
2. Database file will be stored in the app's filesystem
3. Note: Data will be lost on app restarts/deployments

### Step 4: Domain Configuration

1. **Custom Domain** (Optional):
   - Go to your app settings
   - Add your domain name
   - Configure DNS records as shown in DigitalOcean

2. **SSL Certificate**:
   - Automatically provided by DigitalOcean
   - Free Let's Encrypt certificates

## 🖥️ Option 2: DigitalOcean Droplet (VPS)

### Step 1: Create a Droplet

```bash
# Choose specs based on your needs
Size: 1GB RAM, 1 vCPU ($6/month) - Minimum
      2GB RAM, 1 vCPU ($12/month) - Recommended
      4GB RAM, 2 vCPU ($24/month) - Production

OS: Ubuntu 22.04 LTS
```

### Step 2: Initial Server Setup

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx for reverse proxy
apt install nginx -y

# Install certbot for SSL
apt install certbot python3-certbot-nginx -y
```

### Step 3: Deploy Your Application

```bash
# Clone your repository
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Install dependencies
npm install

# Build the application
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'telecheck-healthcare',
    script: 'dist/server/node-build.mjs',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir logs

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 4: Configure Nginx

```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/telecheck << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Serve static files
    location / {
        root /root/your-repo/dist/spa;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/telecheck /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Step 5: SSL Certificate

```bash
# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 🗄️ Database Migration (SQLite to PostgreSQL)

If you want to use managed PostgreSQL, here's how to migrate:

### Step 1: Create Migration Script

```bash
# Create migration script
cat > migrate-to-postgres.js << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');

// Your existing SQLite DB
const sqliteDb = new sqlite3.Database('./database.sqlite');

// Your new PostgreSQL connection
const pgClient = new Client({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  await pgClient.connect();

  // Add your migration logic here
  // Example: Export tables from SQLite and import to PostgreSQL

  await pgClient.end();
  sqliteDb.close();
}

migrate().catch(console.error);
EOF
```

### Step 2: Update Database Connection in Your App

```javascript
// server/utils/database.ts
import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

export { client as db };
```

## 🔐 Environment Variables Setup

### Required Environment Variables:

```bash
# Core Application
NODE_ENV=production
PORT=8080
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Database (if using PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# Messaging Services
TELNYX_API_KEY=your-telnyx-api-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token

# Optional: External Services
OPENAI_API_KEY=your-openai-key (if using AI features)
STRIPE_SECRET_KEY=your-stripe-key (if using payments)
```

## 📊 Monitoring & Logging

### For App Platform:

- Built-in application metrics
- Real-time logs in the dashboard
- Automatic health checks

### For Droplets:

```bash
# View PM2 logs
pm2 logs

# Monitor application
pm2 monit

# Set up log rotation
pm2 install pm2-logrotate

# Monitor server resources
htop
```

## 🚀 Deployment Commands

### App Platform:

```bash
# Deploy via CLI (if using doctl)
doctl apps create --spec .do/app.yaml

# Update existing app
doctl apps update your-app-id --spec .do/app.yaml
```

### Droplet:

```bash
# Deploy updates
git pull origin main
npm run build
pm2 reload all
```

## 💰 Cost Estimation

### App Platform:

- **Basic**: $5/month (512MB RAM, 1 vCPU)
- **Professional**: $12/month (1GB RAM, 1 vCPU)
- **Database**: $15/month (1GB RAM, 1 vCPU)

### Droplet + Managed Database:

- **Droplet**: $6-24/month (depending on size)
- **Database**: $15/month (managed PostgreSQL)
- **Load Balancer**: $10/month (if needed)

## 🔒 Security Considerations for Healthcare

1. **HIPAA Compliance**:
   - Enable encryption at rest for databases
   - Use SSL/TLS for all communications
   - Implement proper access logging

2. **Network Security**:
   - Configure firewall rules
   - Use VPC for database isolation
   - Enable DDoS protection

3. **Data Backup**:
   - Enable automatic database backups
   - Set up monitoring and alerting
   - Regular security updates

## 🎯 Recommended Approach

For your healthcare application, I recommend **App Platform** because:

✅ **Pros**:

- Automatic scaling
- Built-in SSL certificates
- Managed infrastructure
- Integrated with DigitalOcean services
- CI/CD pipeline included
- No server maintenance

❌ **Cons**:

- Less control over infrastructure
- Higher cost for equivalent resources
- Limited customization options

**Start with App Platform** for faster deployment, then consider migrating to Droplets if you need more control or cost optimization.
