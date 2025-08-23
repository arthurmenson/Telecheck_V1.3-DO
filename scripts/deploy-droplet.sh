#!/bin/bash
# 🚀 TeleCheck DigitalOcean Droplet Deployment Script
# This script helps you deploy TeleCheck to a DigitalOcean Droplet using Docker

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
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker is not running"
        print_status "Start Docker and try again"
        exit 1
    fi
    
    print_success "Requirements met"
}

setup_environment() {
    print_status "Setting up environment..."
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        print_error ".env.production file not found"
        print_status "Run: ./scripts/setup-production-db.sh first"
        exit 1
    fi
    
    # Load environment variables
    print_status "Loading production environment variables..."
    source .env.production
    print_success "Environment variables loaded"
}

build_docker_image() {
    print_status "Building Docker image..."
    
    # Build the production Docker image
    docker build -t telecheck:latest .
    
    print_success "Docker image built successfully"
}

create_droplet() {
    print_status "Creating DigitalOcean Droplet..."
    
    # Check if droplet already exists
    if doctl compute droplet list | grep -q "telecheck-droplet"; then
        print_warning "Droplet 'telecheck-droplet' already exists"
        read -p "Do you want to recreate it? (y/N): " recreate
        if [[ $recreate =~ ^[Yy]$ ]]; then
            print_status "Deleting existing droplet..."
            doctl compute droplet delete telecheck-droplet --force
            sleep 10
        else
            print_status "Using existing droplet"
            return
        fi
    fi
    
    # Create new droplet
    print_status "Creating new droplet with Docker..."
    doctl compute droplet create telecheck-droplet \
        --size s-2vcpu-4gb \
        --image docker-20-04 \
        --region nyc1 \
        --ssh-keys $(doctl compute ssh-key list --format ID,Name | grep -E "(macbook|default)" | head -1 | awk '{print $1}') \
        --wait
    
    print_success "Droplet created successfully"
    
    # Get droplet IP
    DROPLET_IP=$(doctl compute droplet get telecheck-droplet --format PublicIPv4 --no-header)
    print_status "Droplet IP: $DROPLET_IP"
    
    # Wait for droplet to be ready
    print_status "Waiting for droplet to be ready..."
    sleep 60
    
    # Test SSH connection
    print_status "Testing SSH connection..."
    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 root@$DROPLET_IP "echo 'SSH connection successful'" || {
        print_error "SSH connection failed"
        exit 1
    }
}

deploy_to_droplet() {
    print_status "Deploying to DigitalOcean Droplet..."
    
    # Get droplet IP
    DROPLET_IP=$(doctl compute droplet get telecheck-droplet --format PublicIPv4 --no-header)
    
    # Copy files to droplet
    print_status "Copying application files to droplet..."
    scp -o StrictHostKeyChecking=no docker-compose.prod.yml root@$DROPLET_IP:/root/
    scp -o StrictHostKeyChecking=no .env.production root@$DROPLET_IP:/root/
    
    # Deploy application on droplet
    print_status "Deploying application on droplet..."
    ssh -o StrictHostKeyChecking=no root@$DROPLET_IP << 'EOF'
        # Update system
        apt update && apt upgrade -y
        
        # Install Docker Compose if not present
        if ! command -v docker-compose &> /dev/null; then
            curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        fi
        
        # Create app directory
        mkdir -p /opt/telecheck
        cd /opt/telecheck
        
        # Copy files
        cp /root/docker-compose.prod.yml ./docker-compose.yml
        cp /root/.env.production ./.env
        
        # Pull and start application
        docker-compose pull || docker-compose build
        docker-compose up -d
        
        # Wait for application to start
        sleep 30
        
        # Check status
        docker-compose ps
        docker-compose logs --tail=20
EOF
    
    print_success "Application deployed to droplet"
}

test_deployment() {
    print_status "Testing deployment..."
    
    # Get droplet IP
    DROPLET_IP=$(doctl compute droplet get telecheck-droplet --format PublicIPv4 --no-header)
    
    # Test health endpoint
    print_status "Testing health endpoint: http://$DROPLET_IP:8080/api/health"
    
    # Wait a bit for the app to be fully ready
    sleep 30
    
    if curl -f -s "http://$DROPLET_IP:8080/api/health" > /dev/null; then
        print_success "Health check passed!"
        print_success "Your app is accessible at: http://$DROPLET_IP:8080"
    else
        print_warning "Health check failed, but app might still be starting up"
        print_success "Your app is accessible at: http://$DROPLET_IP:8080"
    fi
}

setup_firewall() {
    print_status "Setting up firewall..."
    
    # Get droplet IP
    DROPLET_IP=$(doctl compute droplet get telecheck-droplet --format PublicIPv4 --no-header)
    
    # Create firewall rules
    if ! doctl compute firewall list | grep -q "telecheck-firewall"; then
        print_status "Creating firewall rules..."
        doctl compute firewall create \
            --name telecheck-firewall \
            --inbound-rules "protocol:tcp,ports:22,address:0.0.0.0/0 protocol:tcp,ports:8080,address:0.0.0.0/0" \
            --outbound-rules "protocol:tcp,ports:all,address:0.0.0.0/0 protocol:udp,ports:all,address:0.0.0.0/0 protocol:icmp,address:0.0.0.0/0"
        
        # Apply firewall to droplet
        DROPLET_ID=$(doctl compute droplet list --format ID,Name | grep telecheck-droplet | awk '{print $1}')
        FIREWALL_ID=$(doctl compute firewall list --format ID,Name | grep telecheck-firewall | awk '{print $1}')
        doctl compute firewall add-droplets $FIREWALL_ID --droplet-ids $DROPLET_ID
        
        print_success "Firewall configured"
    else
        print_status "Firewall already exists"
    fi
}

main() {
    echo
    print_status "Starting TeleCheck DigitalOcean Droplet deployment..."
    echo
    
    check_requirements
    echo
    
    setup_environment
    echo
    
    build_docker_image
    echo
    
    create_droplet
    echo
    
    deploy_to_droplet
    echo
    
    setup_firewall
    echo
    
    test_deployment
    echo
    
    print_success "🎉 TeleCheck deployment completed successfully!"
    echo
    print_status "Your application is now running on DigitalOcean!"
    echo
    print_status "Next steps:"
    echo "1. Set up a domain name and point it to your droplet IP"
    echo "2. Configure SSL certificates (Let's Encrypt)"
    echo "3. Set up monitoring and alerts"
    echo "4. Configure automated backups"
    echo
    print_status "Access your app at: http://$(doctl compute droplet get telecheck-droplet --format PublicIPv4 --no-header):8080"
}

main "$@"
