#!/bin/bash

# 🏠 TeleCheck Local PostgreSQL Setup Script
# This script helps you set up a local PostgreSQL installation for development

set -e

echo "🏠 TeleCheck Local PostgreSQL Setup"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if PostgreSQL is already installed
check_postgres() {
    print_status "Checking PostgreSQL installation..."
    
    if command -v psql &> /dev/null; then
        PG_VERSION=$(psql --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
        print_success "PostgreSQL $PG_VERSION is already installed"
        return 0
    else
        print_warning "PostgreSQL not found"
        return 1
    fi
}

# Install PostgreSQL based on OS
install_postgres() {
    print_status "Installing PostgreSQL..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            print_status "Installing PostgreSQL with Homebrew..."
            brew install postgresql@15
            brew services start postgresql@15
            
            # Add to PATH
            echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
            export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
            
            print_success "PostgreSQL installed and started"
        else
            print_error "Homebrew not found. Please install Homebrew first: https://brew.sh/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            print_status "Installing PostgreSQL with apt..."
            sudo apt-get update
            sudo apt-get install -y postgresql postgresql-contrib
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
            print_success "PostgreSQL installed and started"
        elif command -v yum &> /dev/null; then
            print_status "Installing PostgreSQL with yum..."
            sudo yum install -y postgresql postgresql-server postgresql-contrib
            sudo postgresql-setup initdb
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
            print_success "PostgreSQL installed and started"
        else
            print_error "Unsupported package manager. Please install PostgreSQL manually."
            exit 1
        fi
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
}

# Setup database and user
setup_database() {
    print_status "Setting up database and user..."
    
    # Create database
    createdb telecheck 2>/dev/null || print_warning "Database 'telecheck' already exists"
    
    # Create user (this might require sudo on some systems)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS with Homebrew
        createuser -s telecheck_user 2>/dev/null || print_warning "User 'telecheck_user' already exists"
    else
        # Linux - might need sudo
        sudo -u postgres createuser -s telecheck_user 2>/dev/null || print_warning "User 'telecheck_user' already exists"
    fi
    
    print_success "Database and user setup completed"
}

# Test connection
test_connection() {
    print_status "Testing database connection..."
    
    if psql -h localhost -U telecheck_user -d telecheck -c "SELECT version();" &> /dev/null; then
        print_success "Database connection successful!"
        return 0
    else
        print_error "Database connection failed"
        return 1
    fi
}

# Initialize schema
init_schema() {
    print_status "Initializing database schema..."
    
    if [ -f "server/config/init.sql" ]; then
        if psql -h localhost -U telecheck_user -d telecheck -f server/config/init.sql; then
            print_success "Database schema initialized"
        else
            print_error "Failed to initialize schema"
            return 1
        fi
    else
        print_warning "Schema file not found: server/config/init.sql"
    fi
}

# Create local environment file
create_env_file() {
    print_status "Creating local environment file..."
    
    cat > .env << EOF
# Local Development Environment Configuration
NODE_ENV=development

# Local PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=telecheck
DB_USER=telecheck_user
DB_PASSWORD=
DB_MAX_CONNECTIONS=20

# Local Redis (Docker container)
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=dev-secret-key-change-in-production

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:8080

# Security Configuration (relaxed for local development)
CORS_ORIGIN=http://localhost:8080
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# SSL Configuration (disabled for local development)
DB_SSL=false
EOF

    print_success "Local environment file created: .env"
}

# Main setup flow
main() {
    echo
    
    if check_postgres; then
        print_status "PostgreSQL is already installed"
    else
        install_postgres
    fi
    
    echo
    
    setup_database
    echo
    
    if test_connection; then
        echo
        
        init_schema
        echo
        
        create_env_file
        echo
        
        print_success "🎉 Local PostgreSQL setup completed successfully!"
        echo
        print_status "Next steps:"
        echo "1. Start your application: npm run dev"
        echo "2. The database will connect automatically"
        echo "3. Check the health endpoint: http://localhost:3000/api/health"
        echo
        print_status "Note: Redis is still running in Docker. If you want to install Redis locally too, run:"
        echo "  brew install redis && brew services start redis  # macOS"
        echo "  sudo apt-get install redis-server               # Ubuntu/Debian"
    else
        print_error "Setup failed. Please check the error messages above."
        exit 1
    fi
}

# Run main function
main "$@"
