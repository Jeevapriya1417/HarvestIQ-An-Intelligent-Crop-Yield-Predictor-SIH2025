#!/bin/bash

# HarvestIQ - Agricultural Intelligence Platform
# Multi-service startup script for macOS and Linux

set -e  # Exit on error

# Get the directory where the script is located
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions for colored output
print_header() {
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  🌾 HarvestIQ - Agricultural Intelligence${NC}"
    echo -e "${BLUE}     Platform Startup Script${NC}"
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo ""
}

print_check() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_ok() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_action() {
    echo -e "${BLUE}[ACTION]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_step() {
    echo ""
    echo -e "${BLUE}────────────────────────────────────────────${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}────────────────────────────────────────────${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header
    print_check "Verifying prerequisites..."
    echo ""
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed or not in PATH"
        print_info "Download from: https://nodejs.org/"
        echo ""
        exit 1
    fi
    print_ok "Node.js found: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed or not in PATH"
        exit 1
    fi
    print_ok "npm found: $(npm --version)"
    
    # Check Python
    if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
        print_error "Python is not installed or not in PATH"
        print_info "Download from: https://www.python.org/"
        echo ""
        exit 1
    fi
    
    if command -v python3 &> /dev/null; then
        print_ok "Python found: $(python3 --version)"
        PYTHON_CMD="python3"
    else
        print_ok "Python found: $(python --version)"
        PYTHON_CMD="python"
    fi
    
    echo ""
}

# Check and install dependencies
check_dependencies() {
    print_check "Verifying dependencies..."
    echo ""
    
    # Check frontend dependencies
    if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
        print_warn "Frontend dependencies not installed"
        print_action "Installing frontend dependencies..."
        cd "$ROOT_DIR/frontend"
        npm install
        if [ $? -ne 0 ]; then
            print_error "Failed to install frontend dependencies"
            exit 1
        fi
        cd "$ROOT_DIR"
    fi
    print_ok "Frontend dependencies ready"
    
    # Check backend dependencies
    if [ ! -d "$ROOT_DIR/backend/node_modules" ]; then
        print_warn "Backend dependencies not installed"
        print_action "Installing backend dependencies..."
        cd "$ROOT_DIR/backend"
        npm install
        if [ $? -ne 0 ]; then
            print_error "Failed to install backend dependencies"
            exit 1
        fi
        cd "$ROOT_DIR"
    fi
    print_ok "Backend dependencies ready"
    
    # Check Python dependencies
    if ! $PYTHON_CMD -m pip show fastapi &> /dev/null; then
        print_warn "Python dependencies not installed"
        print_action "Installing Python dependencies..."
        cd "$ROOT_DIR/Pymodel"
        if [ -f "requirements.txt" ]; then
            $PYTHON_CMD -m pip install -r requirements.txt
            if [ $? -ne 0 ]; then
                print_error "Failed to install Python dependencies"
                exit 1
            fi
        fi
        cd "$ROOT_DIR"
    fi
    print_ok "Python dependencies ready"
    
    echo ""
}

# Display startup information
display_startup_info() {
    print_step "Starting Services..."
    echo ""
}

# Start ML Service
start_ml_service() {
    print_info "[1/3] Starting FastAPI ML Service (Port 8000)"
    if [ "$(uname)" == "Darwin" ]; then
        # macOS
        open -a Terminal "$ROOT_DIR/Pymodel" --args cd "$ROOT_DIR/Pymodel" && $PYTHON_CMD harvest_fastapi.py
    else
        # Linux
        gnome-terminal --tab --title="HarvestIQ ML Service" -- bash -c "cd '$ROOT_DIR/Pymodel' && $PYTHON_CMD harvest_fastapi.py; exec bash"
    fi
}

# Start Backend Service
start_backend_service() {
    sleep 3
    print_info "[2/3] Starting Backend API Server (Port 5000)"
    if [ "$(uname)" == "Darwin" ]; then
        # macOS
        osascript -e "tell app \"Terminal\" to do script \"cd '$ROOT_DIR/backend' && npm run dev\""
    else
        # Linux
        gnome-terminal --tab --title="HarvestIQ Backend" -- bash -c "cd '$ROOT_DIR/backend' && npm run dev; exec bash"
    fi
}

# Start Frontend Service
start_frontend_service() {
    sleep 3
    print_info "[3/3] Starting Frontend Dev Server (Port 5173)"
    if [ "$(uname)" == "Darwin" ]; then
        # macOS
        osascript -e "tell app \"Terminal\" to do script \"cd '$ROOT_DIR/frontend' && npm run dev\""
    else
        # Linux
        gnome-terminal --tab --title="HarvestIQ Frontend" -- bash -c "cd '$ROOT_DIR/frontend' && npm run dev; exec bash"
    fi
}

# Display success message
display_success() {
    sleep 2
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    print_success "All Services Started Successfully!"
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}🌐 SERVICES RUNNING:${NC}"
    echo -e "${BLUE}────────────────────────────────────────────${NC}"
    echo "  Frontend:       ${BLUE}http://localhost:5173${NC}"
    echo "  Backend API:    ${BLUE}http://localhost:5000${NC}"
    echo "  ML Service:     ${BLUE}http://localhost:8000${NC}"
    echo "  API Docs:       ${BLUE}http://localhost:8000/docs${NC}"
    echo ""
    echo -e "${GREEN}📁 WORKSPACE STRUCTURE:${NC}"
    echo -e "${BLUE}────────────────────────────────────────────${NC}"
    echo "  Root:           $ROOT_DIR"
    echo "  Frontend:       $ROOT_DIR/frontend"
    echo "  Backend:        $ROOT_DIR/backend"
    echo "  Python ML:      $ROOT_DIR/Pymodel"
    echo ""
    echo -e "${GREEN}📝 IMPORTANT:${NC}"
    echo -e "${BLUE}────────────────────────────────────────────${NC}"
    echo "  Services are running in new terminal tabs"
    echo "  Close a tab to stop that service"
    echo "  Close all tabs to stop the application"
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════${NC}"
    echo ""
}

# Main execution
main() {
    # Check if running on macOS or Linux
    OS_TYPE="$(uname)"
    if [ "$OS_TYPE" != "Darwin" ] && [ "$OS_TYPE" != "Linux" ]; then
        print_error "Unsupported OS. This script supports macOS and Linux only."
        exit 1
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Check and install dependencies
    check_dependencies
    
    # Display startup information
    display_startup_info
    
    # Start services
    start_ml_service
    start_backend_service
    start_frontend_service
    
    # Display success message
    display_success
}

# Run main function
main
