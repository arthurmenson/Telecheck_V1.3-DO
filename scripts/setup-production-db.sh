#!/bin/bash
# 🗄️ TeleCheck Production Database Setup Script
# This script helps you set up external PostgreSQL and Redis for production

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
    print_status "Checking requirements..."
    
    # Check if psql is available
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL client (psql) is not installed"
        print_status "Install it to test database connections"
    fi
    
    # Check if redis-cli is available
    if ! command -v redis-cli &> /dev/null; then
        print_error "Redis client (redis-cli) is not installed"
        print_status "Install it to test Redis connections"
    fi
    
    print_success "Requirements checked"
}

setup_postgresql() {
    print_status "Setting up PostgreSQL..."
    
    echo
    print_status "Choose your PostgreSQL service:"
    echo "1. DigitalOcean Managed Database (Recommended)"
    echo "2. Supabase (Free tier available)"
    echo "3. PlanetScale (Free tier available)"
    echo "4. Custom PostgreSQL server"
    echo "5. Skip for now"
    echo
    
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            print_status "Setting up DigitalOcean Managed Database..."
            print_status "1. Go to DigitalOcean Dashboard > Databases"
            print_status "2. Create a new PostgreSQL cluster"
            print_status "3. Choose your plan (Basic plan recommended for starters)"
            print_status "4. Select your region (same as your app)"
            print_status "5. Copy the connection string"
            echo
            read -p "Enter your PostgreSQL connection string: " db_url
            echo "DATABASE_URL=$db_url" >> .env.production
            print_success "PostgreSQL connection string added to .env.production"
            ;;
        2)
            print_status "Setting up Supabase..."
            print_status "1. Go to https://supabase.com"
            print_status "2. Create a new project"
            print_status "3. Go to Settings > Database"
            print_status "4. Copy the connection string"
            echo
            read -p "Enter your Supabase connection string: " db_url
            echo "DATABASE_URL=$db_url" >> .env.production
            print_success "Supabase connection string added to .env.production"
            ;;
        3)
            print_status "Setting up PlanetScale..."
            print_status "1. Go to https://planetscale.com"
            print_status "2. Create a new database"
            print_status "3. Go to Connect > Connect with Prisma"
            print_status "4. Copy the connection string"
            echo
            read -p "Enter your PlanetScale connection string: " db_url
            echo "DATABASE_URL=$db_url" >> .env.production
            print_success "PlanetScale connection string added to .env.production"
            ;;
        4)
            print_status "Setting up Custom PostgreSQL..."
            read -p "Enter PostgreSQL host: " db_host
            read -p "Enter PostgreSQL port (default: 5432): " db_port
            read -p "Enter database name: " db_name
            read -p "Enter username: " db_user
            read -s -p "Enter password: " db_pass
            echo
            
            if [ -z "$db_port" ]; then
                db_port=5432
            fi
            
            echo "DB_HOST=$db_host" >> .env.production
            echo "DB_PORT=$db_port" >> .env.production
            echo "DB_NAME=$db_name" >> .env.production
            echo "DB_USER=$db_user" >> .env.production
            echo "DB_PASSWORD=$db_pass" >> .env.production
            print_success "Custom PostgreSQL settings added to .env.production"
            ;;
        5)
            print_warning "Skipping PostgreSQL setup"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

setup_redis() {
    print_status "Setting up Redis..."
    
    echo
    print_status "Choose your Redis service:"
    echo "1. DigitalOcean Managed Redis (Recommended)"
    echo "2. Redis Cloud (Free tier available)"
    echo "3. Custom Redis server"
    echo "4. Skip for now"
    echo
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            print_status "Setting up DigitalOcean Managed Redis..."
            print_status "1. Go to DigitalOcean Dashboard > Databases"
            print_status "2. Create a new Redis cluster"
            print_status "3. Choose your plan (Basic plan recommended for starters)"
            print_status "4. Select your region (same as your app)"
            print_status "5. Copy the connection string"
            echo
            read -p "Enter your Redis connection string: " redis_url
            echo "REDIS_URL=$redis_url" >> .env.production
            print_success "Redis connection string added to .env.production"
            ;;
        2)
            print_status "Setting up Redis Cloud..."
            print_status "1. Go to https://redis.com/try-free/"
            print_status "2. Create a free account"
            print_status "3. Create a new database"
            print_status "4. Copy the connection string"
            echo
            read -p "Enter your Redis connection string: " redis_url
            echo "REDIS_URL=$redis_url" >> .env.production
            print_success "Redis connection string added to .env.production"
            ;;
        3)
            print_status "Setting up Custom Redis..."
            read -p "Enter Redis host: " redis_host
            read -p "Enter Redis port (default: 6379): " redis_port
            read -s -p "Enter Redis password (if any): " redis_pass
            echo
            
            if [ -z "$redis_port" ]; then
                redis_port=6379
            fi
            
            if [ -n "$redis_pass" ]; then
                echo "REDIS_URL=redis://:$redis_pass@$redis_host:$redis_port" >> .env.production
            else
                echo "REDIS_URL=redis://$redis_host:$redis_port" >> .env.production
            fi
            
            print_success "Custom Redis settings added to .env.production"
            ;;
        4)
            print_warning "Skipping Redis setup"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

setup_environment() {
    print_status "Setting up production environment..."
    
    # Create .env.production if it doesn't exist
    if [ ! -f ".env.production" ]; then
        print_status "Creating .env.production file..."
        cp .env.production.template .env.production
    fi
    
    # Generate JWT secret if not present
    if ! grep -q "JWT_SECRET" .env.production; then
        print_status "Generating JWT secret..."
        jwt_secret=$(openssl rand -base64 64)
        echo "JWT_SECRET=$jwt_secret" >> .env.production
        print_success "JWT secret generated and added"
    fi
    
    # Set frontend URL
    if ! grep -q "FRONTEND_URL" .env.production; then
        print_status "Setting frontend URL..."
        read -p "Enter your app URL (e.g., https://telecheck.ondigitalocean.app): " frontend_url
        echo "FRONTEND_URL=$frontend_url" >> .env.production
        echo "CORS_ORIGIN=$frontend_url" >> .env.production
        print_success "Frontend URL configured"
    fi
    
    print_success "Environment setup completed"
}

test_connections() {
    print_status "Testing database connections..."
    
    # Test PostgreSQL if configured
    if grep -q "DATABASE_URL\|DB_HOST" .env.production; then
        print_status "Testing PostgreSQL connection..."
        source .env.production
        
        if command -v psql &> /dev/null; then
            if [ -n "$DATABASE_URL" ]; then
                if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
                    print_success "PostgreSQL connection successful"
                else
                    print_error "PostgreSQL connection failed"
                fi
            elif [ -n "$DB_HOST" ]; then
                if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
                    print_success "PostgreSQL connection successful"
                else
                    print_error "PostgreSQL connection failed"
                fi
            fi
        else
            print_warning "psql not available, skipping connection test"
        fi
    fi
    
    # Test Redis if configured
    if grep -q "REDIS_URL" .env.production; then
        print_status "Testing Redis connection..."
        source .env.production
        
        if command -v redis-cli &> /dev/null; then
            if redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1; then
                print_success "Redis connection successful"
            else
                print_error "Redis connection failed"
            fi
        else
            print_warning "redis-cli not available, skipping connection test"
        fi
    fi
}

main() {
    echo
    print_status "Starting TeleCheck production database setup..."
    echo
    
    check_requirements
    echo
    
    setup_environment
    echo
    
    setup_postgresql
    echo
    
    setup_redis
    echo
    
    test_connections
    echo
    
    print_success "🎉 Production database setup completed!"
    echo
    print_status "Next steps:"
    echo "1. Review your .env.production file"
    echo "2. Run: ./scripts/deploy-digitalocean.sh"
    echo "3. Set up monitoring and alerts"
    echo "4. Configure backups"
    echo
    print_status "Your .env.production file contains:"
    echo "----------------------------------------"
    cat .env.production
    echo "----------------------------------------"
}

main "$@"
