#!/bin/bash

# 🚀 TeleCheck External Database Deployment Script
# This script helps you deploy TeleCheck with external PostgreSQL and Redis services

set -e

echo "🚀 TeleCheck External Database Deployment"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL client (psql) not found. Install it to test database connections."
    fi
    
    if ! command -v redis-cli &> /dev/null; then
        print_warning "Redis client (redis-cli) not found. Install it to test Redis connections."
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install npm first."
        exit 1
    fi
    
    print_success "Requirements check completed"
}

# Create production environment file
setup_environment() {
    print_status "Setting up production environment..."
    
    if [ ! -f "production.env" ]; then
        print_error "production.env file not found. Please create it first."
        exit 1
    fi
    
    if [ -f ".env" ]; then
        print_warning "Backing up existing .env file to .env.backup"
        cp .env .env.backup
    fi
    
    cp production.env .env
    print_success "Environment file created"
}

# Test database connection
test_database() {
    print_status "Testing database connection..."
    
    if [ -z "$DATABASE_URL" ] && [ -z "$DB_HOST" ]; then
        print_warning "No database connection details found. Please set DATABASE_URL or DB_HOST in .env"
        return 1
    fi
    
    if command -v psql &> /dev/null; then
        if [ ! -z "$DATABASE_URL" ]; then
            print_status "Testing connection with DATABASE_URL..."
            if psql "$DATABASE_URL" -c "SELECT version();" &> /dev/null; then
                print_success "PostgreSQL connection successful"
            else
                print_error "PostgreSQL connection failed"
                return 1
            fi
        else
            print_status "Testing connection with individual parameters..."
            if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" &> /dev/null; then
                print_success "PostgreSQL connection successful"
            else
                print_error "PostgreSQL connection failed"
                return 1
            fi
        fi
    else
        print_warning "psql not available, skipping database connection test"
    fi
}

# Test Redis connection
test_redis() {
    print_status "Testing Redis connection..."
    
    if [ -z "$REDIS_URL" ] && [ -z "$REDIS_HOST" ]; then
        print_warning "No Redis connection details found. Please set REDIS_URL or REDIS_HOST in .env"
        return 1
    fi
    
    if command -v redis-cli &> /dev/null; then
        if [ ! -z "$REDIS_URL" ]; then
            print_status "Testing Redis connection with REDIS_URL..."
            if redis-cli -u "$REDIS_URL" ping &> /dev/null; then
                print_success "Redis connection successful"
            else
                print_error "Redis connection failed"
                return 1
            fi
        else
            print_status "Testing Redis connection with individual parameters..."
            if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping &> /dev/null; then
                print_success "Redis connection successful"
            else
                print_error "Redis connection failed"
                return 1
            fi
        fi
    else
        print_warning "redis-cli not available, skipping Redis connection test"
    fi
}

# Initialize database schema
init_database() {
    print_status "Initializing database schema..."
    
    if [ ! -f "server/config/init.sql" ]; then
        print_error "Database schema file not found: server/config/init.sql"
        return 1
    fi
    
    if [ ! -z "$DATABASE_URL" ]; then
        print_status "Running schema initialization with DATABASE_URL..."
        psql "$DATABASE_URL" -f server/config/init.sql
    elif [ ! -z "$DB_HOST" ]; then
        print_status "Running schema initialization with individual parameters..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f server/config/init.sql
    else
        print_warning "No database connection details found, skipping schema initialization"
        return 1
    fi
    
    print_success "Database schema initialized"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    npm install
    print_success "Dependencies installed"
}

# Test application
test_application() {
    print_status "Testing application..."
    
    # Start application in background
    print_status "Starting application for testing..."
    npm start &
    APP_PID=$!
    
    # Wait for application to start
    sleep 10
    
    # Test health endpoint
    if curl -s http://localhost:3000/api/health &> /dev/null; then
        print_success "Application health check passed"
    else
        print_error "Application health check failed"
        kill $APP_PID 2>/dev/null || true
        return 1
    fi
    
    # Stop application
    kill $APP_PID 2>/dev/null || true
    print_success "Application test completed"
}

# Main deployment flow
main() {
    echo
    print_status "Starting TeleCheck external database deployment..."
    echo
    
    check_requirements
    echo
    
    setup_environment
    echo
    
    # Source environment variables
    if [ -f ".env" ]; then
        print_status "Loading environment variables..."
        export $(cat .env | grep -v '^#' | xargs)
        print_success "Environment variables loaded"
    else
        print_error ".env file not found"
        exit 1
    fi
    echo
    
    install_dependencies
    echo
    
    test_database
    echo
    
    test_redis
    echo
    
    init_database
    echo
    
    test_application
    echo
    
    print_success "🎉 TeleCheck deployment completed successfully!"
    echo
    print_status "Next steps:"
    echo "1. Review your .env file for production settings"
    echo "2. Deploy to your chosen platform (DigitalOcean, Heroku, etc.)"
    echo "3. Set up monitoring and alerts"
    echo "4. Configure backups"
    echo
    print_status "For detailed instructions, see: EXTERNAL_DATABASE_DEPLOYMENT.md"
}

# Run main function
main "$@"
