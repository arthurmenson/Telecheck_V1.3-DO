#!/bin/bash
# 🚀 TeleCheck DigitalOcean Deployment Script
# This script helps you deploy TeleCheck to DigitalOcean App Platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_requirements() {
    print_status "Checking deployment requirements..."
    
    # Check if doctl is installed
    if ! command -v doctl &> /dev/null; then
        print_error "DigitalOcean CLI (doctl) is not installed"
        print_status "Install it from: https://docs.digitalocean.com/reference/doctl/how-to/install/"
        exit 1
    fi
    
    # Check if logged in to DigitalOcean
    if ! doctl account get &> /dev/null; then
        print_error "Not logged in to DigitalOcean"
        print_status "Run: doctl auth init"
        exit 1
    fi
    
    print_success "Requirements met"
}

setup_environment() {
    print_status "Setting up environment..."
    
    # Create .env.production if it doesn't exist
    if [ ! -f ".env.production" ]; then
        if [ -f ".env.production.template" ]; then
            print_warning "Creating .env.production from template"
            cp .env.production.template .env.production
            print_warning "Please edit .env.production with your actual values"
            print_warning "Press Enter when ready to continue..."
            read
        else
            print_error ".env.production.template not found"
            exit 1
        fi
    fi
    
    # Load environment variables
    if [ -f ".env.production" ]; then
        print_status "Loading production environment variables..."
        # Load environment variables safely
        while IFS= read -r line; do
            if [[ $line =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
                export "$line"
            fi
        done < .env.production
        print_success "Environment variables loaded"
    fi
}

build_application() {
    print_status "Building application for production..."
    
    # Build application using existing dependencies
    npm run build:prod
    
    print_success "Application built successfully"
}

deploy_to_digitalocean() {
    print_status "Deploying to DigitalOcean App Platform..."
    
    # Check if app exists
    if doctl apps list | grep -q "telecheck"; then
        print_status "Updating existing app..."
        doctl apps update $(doctl apps list --format ID,Name | grep telecheck | awk '{print $1}') --spec .do/app.yaml
    else
        print_status "Creating new app..."
        doctl apps create --spec .do/app.yaml
    fi
    
    print_success "Deployment initiated"
}

wait_for_deployment() {
    print_status "Waiting for deployment to complete..."
    
    local app_id=$(doctl apps list --format ID,Name | grep telecheck | awk '{print $1}')
    
    while true; do
        local status=$(doctl apps get $app_id --format Status)
        if [ "$status" = "RUNNING" ]; then
            print_success "App is running!"
            break
        elif [ "$status" = "ERROR" ]; then
            print_error "Deployment failed"
            doctl apps logs $app_id
            exit 1
        else
            print_status "Current status: $status"
            sleep 10
        fi
    done
}

get_app_url() {
    local app_id=$(doctl apps list --format ID,Name | grep telecheck | awk '{print $1}')
    local url=$(doctl apps get $app_id --format DefaultIngress)
    echo $url
}

test_deployment() {
    print_status "Testing deployment..."
    
    local app_url=$(get_app_url)
    if [ -n "$app_url" ]; then
        print_status "Testing health endpoint: $app_url/api/health"
        
        # Wait a bit for the app to be fully ready
        sleep 30
        
        if curl -f -s "$app_url/api/health" > /dev/null; then
            print_success "Health check passed!"
            print_success "Your app is accessible at: $app_url"
        else
            print_warning "Health check failed, but app might still be starting up"
            print_success "Your app is accessible at: $app_url"
        fi
    else
        print_warning "Could not determine app URL"
    fi
}

main() {
    echo
    print_status "Starting TeleCheck DigitalOcean deployment..."
    echo
    
    check_requirements
    echo
    
    setup_environment
    echo
    
    build_application
    echo
    
    deploy_to_digitalocean
    echo
    
    wait_for_deployment
    echo
    
    test_deployment
    echo
    
    print_success "🎉 TeleCheck deployment completed successfully!"
    echo
    print_status "Next steps:"
    echo "1. Set up your external PostgreSQL database"
    echo "2. Set up your external Redis instance"
    echo "3. Update environment variables in DigitalOcean dashboard"
    echo "4. Configure custom domain (optional)"
    echo "5. Set up monitoring and alerts"
    echo
    print_status "For database setup, see: EXTERNAL_DATABASE_DEPLOYMENT.md"
}

main "$@"
