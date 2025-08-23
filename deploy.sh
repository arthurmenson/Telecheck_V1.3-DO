#!/bin/bash

# DigitalOcean Deployment Script for Telecheck Healthcare
# Usage: ./deploy.sh [app-platform|droplet]

set -e

DEPLOYMENT_TYPE=${1:-app-platform}
APP_NAME="telecheck-healthcare"

echo "🚀 Starting DigitalOcean deployment..."
echo "📦 Deployment type: $DEPLOYMENT_TYPE"

# Check if required tools are installed
check_dependencies() {
    echo "🔍 Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm not found. Please install npm"
        exit 1
    fi
    
    echo "✅ Dependencies check passed"
}

# Build the application
build_app() {
    echo "🏗️ Building application..."
    
    # Install dependencies
    npm install
    
    # Build client and server
    npm run build
    
    echo "✅ Application built successfully"
}

# Deploy to App Platform
deploy_app_platform() {
    echo "🌊 Deploying to DigitalOcean App Platform..."
    
    if command -v doctl &> /dev/null; then
        echo "📱 Using doctl CLI for deployment..."
        
        # Check if app already exists
        if doctl apps list --format Name --no-header | grep -q "^$APP_NAME$"; then
            echo "🔄 Updating existing app..."
            APP_ID=$(doctl apps list --format ID,Name --no-header | grep "$APP_NAME" | awk '{print $1}')
            doctl apps update "$APP_ID" --spec .do/app.yaml
        else
            echo "🆕 Creating new app..."
            doctl apps create --spec .do/app.yaml
        fi
    else
        echo "⚠️ doctl not found. Please deploy manually through the DigitalOcean dashboard:"
        echo "1. Go to https://cloud.digitalocean.com/apps"
        echo "2. Create a new app"
        echo "3. Connect your GitHub repository"
        echo "4. Use the following settings:"
        echo "   - Build Command: npm run build"
        echo "   - Run Command: npm start"
        echo "   - Environment Variables: See DIGITALOCEAN_DEPLOYMENT.md"
    fi
}

# Deploy to Droplet
deploy_droplet() {
    echo "🖥️ Deploying to DigitalOcean Droplet..."
    
    if [[ -z "$DROPLET_IP" ]]; then
        echo "❌ DROPLET_IP environment variable not set"
        echo "💡 Set it with: export DROPLET_IP=your.droplet.ip.address"
        exit 1
    fi
    
    echo "📤 Uploading files to droplet..."
    
    # Create deployment package
    tar -czf telecheck-deploy.tar.gz \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='*.log' \
        --exclude='dist' \
        .
    
    # Copy files to droplet
    scp telecheck-deploy.tar.gz root@$DROPLET_IP:/tmp/
    
    # Deploy on droplet
    ssh root@$DROPLET_IP << 'EOF'
        set -e
        
        echo "📦 Extracting deployment package..."
        cd /opt
        rm -rf telecheck-healthcare
        mkdir -p telecheck-healthcare
        cd telecheck-healthcare
        tar -xzf /tmp/telecheck-deploy.tar.gz
        
        echo "📚 Installing dependencies..."
        npm install --production
        
        echo "🏗️ Building application..."
        npm run build
        
        echo "🔄 Restarting application with PM2..."
        pm2 reload telecheck-healthcare || pm2 start ecosystem.config.js
        
        echo "✅ Deployment completed successfully!"
EOF
    
    # Cleanup
    rm telecheck-deploy.tar.gz
    
    echo "🌐 Application should be available at: http://$DROPLET_IP"
}

# Set up environment variables
setup_environment() {
    echo "🔧 Setting up environment variables..."
    
    if [[ ! -f ".env.production" ]]; then
        echo "⚠️ .env.production not found. Creating template..."
        cat > .env.production << 'EOF'
NODE_ENV=production
PORT=8080
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
TELNYX_API_KEY=your-telnyx-api-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
DATABASE_URL=sqlite:./database.sqlite
EOF
        echo "📝 Please edit .env.production with your actual values"
        echo "🚨 Don't commit this file to git!"
    fi
}

# Pre-deployment checks
pre_deploy_checks() {
    echo "🔍 Running pre-deployment checks..."
    
    # Check if build succeeds
    if ! npm run build; then
        echo "❌ Build failed. Please fix errors before deploying."
        exit 1
    fi
    
    # Check if required files exist
    if [[ ! -f "dist/server/node-build.mjs" ]]; then
        echo "❌ Server build not found. Build may have failed."
        exit 1
    fi
    
    if [[ ! -d "dist/spa" ]]; then
        echo "❌ Client build not found. Build may have failed."
        exit 1
    fi
    
    echo "✅ Pre-deployment checks passed"
}

# Main deployment flow
main() {
    echo "🏥 Telecheck Healthcare - DigitalOcean Deployment"
    echo "=================================================="
    
    check_dependencies
    setup_environment
    build_app
    pre_deploy_checks
    
    case $DEPLOYMENT_TYPE in
        "app-platform")
            deploy_app_platform
            ;;
        "droplet")
            deploy_droplet
            ;;
        *)
            echo "❌ Invalid deployment type: $DEPLOYMENT_TYPE"
            echo "💡 Use: ./deploy.sh [app-platform|droplet]"
            exit 1
            ;;
    esac
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "📖 For detailed instructions, see: DIGITALOCEAN_DEPLOYMENT.md"
    echo "🔧 For troubleshooting, check the application logs"
}

# Run main function
main "$@"
