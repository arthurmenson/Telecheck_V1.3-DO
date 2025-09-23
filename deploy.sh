#!/bin/bash

# DigitalOcean Deployment Script for Telecheck Healthcare
# Usage: ./deploy.sh [app-platform|droplet]

set -e

DEPLOYMENT_TYPE=${1:-app-platform}
APP_NAME="telecheck-healthcare"

echo "ðŸš€ Starting DigitalOcean deployment..."
echo "ðŸ“¦ Deployment type: $DEPLOYMENT_TYPE"

# Check if required tools are installed
check_dependencies() {
    echo "ðŸ” Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        echo "âŒ Node.js not found. Please install Node.js 20+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "âŒ npm not found. Please install npm"
        exit 1
    fi
    
    echo "âœ… Dependencies check passed"
}

# Build the application
build_app() {
    echo "ðŸ—ï¸ Building application..."
    
    # Install dependencies
    npm install
    
    # Build client and server
    npm run build
    
    echo "âœ… Application built successfully"
}

# Deploy to App Platform
deploy_app_platform() {
    echo "ðŸŒŠ Deploying to DigitalOcean App Platform..."
    
    if command -v doctl &> /dev/null; then
        echo "ðŸ“± Using doctl CLI for deployment..."
        
        # Check if app already exists
        if doctl apps list --format Name --no-header | grep -q "^$APP_NAME$"; then
            echo "ðŸ”„ Updating existing app..."
            APP_ID=$(doctl apps list --format ID,Name --no-header | grep "$APP_NAME" | awk '{print $1}')
            doctl apps update "$APP_ID" --spec .do/app.yaml
        else
            echo "ðŸ†• Creating new app..."
            doctl apps create --spec .do/app.yaml
        fi
    else
        echo "âš ï¸ doctl not found. Please deploy manually through the DigitalOcean dashboard:"
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
    echo "ðŸ–¥ï¸ Deploying to DigitalOcean Droplet..."
    
    if [[ -z "$DROPLET_IP" ]]; then
        echo "âŒ DROPLET_IP environment variable not set"
        echo "ðŸ’¡ Set it with: export DROPLET_IP=your.droplet.ip.address"
        exit 1
    fi
    
    echo "ðŸ“¤ Uploading files to droplet..."
    
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
        
        echo "ðŸ“¦ Extracting deployment package..."
        cd /opt
        rm -rf telecheck-healthcare
        mkdir -p telecheck-healthcare
        cd telecheck-healthcare
        tar -xzf /tmp/telecheck-deploy.tar.gz
        
        echo "ðŸ“š Installing dependencies..."
        npm install --production
        
        echo "ðŸ—ï¸ Building application..."
        npm run build
        
        echo "ðŸ”„ Restarting application with PM2..."
        pm2 reload telecheck-healthcare || pm2 start ecosystem.config.js
        
        echo "âœ… Deployment completed successfully!"
EOF
    
    # Cleanup
    rm telecheck-deploy.tar.gz
    
    echo "ðŸŒ Application should be available at: http://$DROPLET_IP"
}

# Set up environment variables
setup_environment() {
    echo "ðŸ”§ Setting up environment variables..."
    
    if [[ ! -f ".env.production" ]]; then
        echo "âš ï¸ .env.production not found. Creating template..."
        cat > .env.production << 'EOF'
NODE_ENV=production
PORT=8080
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
TELNYX_API_KEY=your-telnyx-api-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
DATABASE_URL=sqlite:./database.sqlite
EOF
        echo "ðŸ“ Please edit .env.production with your actual values"
        echo "ðŸš¨ Don't commit this file to git!"
    fi
}

# Pre-deployment checks
pre_deploy_checks() {
    echo "ðŸ” Running pre-deployment checks..."
    
    # Check if build succeeds
    if ! npm run build; then
        echo "âŒ Build failed. Please fix errors before deploying."
        exit 1
    fi
    
    # Check if required files exist
    if [[ ! -f "dist/server/node-build.mjs" ]]; then
        echo "âŒ Server build not found. Build may have failed."
        exit 1
    fi
    
    if [[ ! -d "dist/spa" ]]; then
        echo "âŒ Client build not found. Build may have failed."
        exit 1
    fi
    
    echo "âœ… Pre-deployment checks passed"
}

# Main deployment flow
main() {
    echo "ðŸ¥ Telecheck Healthcare - DigitalOcean Deployment"
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
            echo "âŒ Invalid deployment type: $DEPLOYMENT_TYPE"
            echo "ðŸ’¡ Use: ./deploy.sh [app-platform|droplet]"
            exit 1
            ;;
    esac
    
    echo ""
    echo "ðŸŽ‰ Deployment completed successfully!"
    echo "ðŸ“– For detailed instructions, see: DIGITALOCEAN_DEPLOYMENT.md"
    echo "ðŸ”§ For troubleshooting, check the application logs"
}

# Run main function
main "$@"
