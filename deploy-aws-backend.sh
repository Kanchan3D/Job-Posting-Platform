#!/bin/bash

# =============================================================================
# AWS EC2 Job Posting Platform - Backend Deployment Script
# =============================================================================
# Description: Automated deployment script for MERN Job Posting Platform backend
# Author: Job Platform Team
# Version: 1.0
# Date: $(date)
# =============================================================================

set -e  # Exit on any error

# =============================================================================
# CONFIGURATION VARIABLES
# =============================================================================

# Application Configuration
APP_NAME="job-posting-backend"
APP_PORT="8000"
DOCKER_IMAGE_NAME="job-posting-backend"
DOCKER_CONTAINER_NAME="job-backend-container"

# AWS and Repository Configuration
GITHUB_REPO="https://github.com/Kanchan3D/Job-Posting-Platform.git"
DEPLOY_DIR="/opt/job-posting-platform"
LOG_DIR="/var/log/job-posting"
BACKUP_DIR="/opt/backups/job-posting"

# Docker Configuration
DOCKER_NETWORK="job-platform-network"
MONGODB_CONTAINER="job-mongodb-container"

# Environment Configuration
NODE_ENV="production"
MONGODB_URI="mongodb://mongodb:27017/jobposting"

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/deployment.log"
}

# Error handling function
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Check if command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        error_exit "$1 is required but not installed."
    fi
}

# =============================================================================
# SYSTEM PREPARATION
# =============================================================================

prepare_system() {
    log "=== Starting System Preparation ==="
    
    # Update system packages
    log "Updating system packages..."
    sudo yum update -y || sudo apt-get update -y
    
    # Create necessary directories
    log "Creating application directories..."
    sudo mkdir -p "$DEPLOY_DIR" "$LOG_DIR" "$BACKUP_DIR"
    sudo chown ec2-user:ec2-user "$DEPLOY_DIR" "$LOG_DIR" "$BACKUP_DIR"
    
    # Install required packages
    log "Installing required packages..."
    if command -v yum &> /dev/null; then
        # Amazon Linux / RHEL / CentOS
        sudo yum install -y git curl wget unzip
    else
        # Ubuntu / Debian
        sudo apt-get install -y git curl wget unzip
    fi
    
    log "System preparation completed successfully!"
}

# =============================================================================
# DOCKER INSTALLATION
# =============================================================================

install_docker() {
    log "=== Installing Docker ==="
    
    if command -v docker &> /dev/null; then
        log "Docker is already installed. Version: $(docker --version)"
        return 0
    fi
    
    log "Installing Docker..."
    
    if command -v yum &> /dev/null; then
        # Amazon Linux
        sudo yum install -y docker
        sudo service docker start
        sudo usermod -a -G docker ec2-user
    else
        # Ubuntu
        sudo apt-get remove docker docker-engine docker.io containerd runc || true
        sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io
        sudo usermod -aG docker ec2-user
    fi
    
    # Install Docker Compose
    log "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Enable Docker to start on boot
    sudo systemctl enable docker
    sudo systemctl start docker
    
    log "Docker installation completed successfully!"
}

# =============================================================================
# APPLICATION DEPLOYMENT
# =============================================================================

clone_or_update_repo() {
    log "=== Cloning/Updating Application Repository ==="
    
    if [ -d "$DEPLOY_DIR/.git" ]; then
        log "Repository exists. Pulling latest changes..."
        cd "$DEPLOY_DIR"
        git pull origin main
    else
        log "Cloning repository..."
        git clone "$GITHUB_REPO" "$DEPLOY_DIR"
        cd "$DEPLOY_DIR"
    fi
    
    log "Repository setup completed!"
}

setup_environment() {
    log "=== Setting up Environment Configuration ==="
    
    # Create production environment file for backend
    cat > "$DEPLOY_DIR/backend/.env" << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=$APP_PORT

# Database Configuration
MONGODB_URI=$MONGODB_URI

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000

# Security Configuration
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Logging
LOG_LEVEL=info
EOF

    log "Environment configuration completed!"
}

# =============================================================================
# DOCKER OPERATIONS
# =============================================================================

stop_existing_containers() {
    log "=== Stopping Existing Containers ==="
    
    # Stop and remove existing containers
    if docker ps -q -f name="$DOCKER_CONTAINER_NAME" | grep -q .; then
        log "Stopping existing backend container..."
        docker stop "$DOCKER_CONTAINER_NAME" || true
        docker rm "$DOCKER_CONTAINER_NAME" || true
    fi
    
    if docker ps -q -f name="$MONGODB_CONTAINER" | grep -q .; then
        log "MongoDB container is running. Keeping it active..."
    fi
    
    log "Container cleanup completed!"
}

build_backend_image() {
    log "=== Building Backend Docker Image ==="
    
    cd "$DEPLOY_DIR/backend"
    
    # Build the Docker image
    log "Building Docker image: $DOCKER_IMAGE_NAME"
    docker build -t "$DOCKER_IMAGE_NAME:latest" .
    
    # Tag with timestamp for rollback capability
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    docker tag "$DOCKER_IMAGE_NAME:latest" "$DOCKER_IMAGE_NAME:$TIMESTAMP"
    
    log "Docker image build completed!"
}

start_mongodb() {
    log "=== Starting MongoDB Container ==="
    
    # Create Docker network if it doesn't exist
    docker network create "$DOCKER_NETWORK" 2>/dev/null || true
    
    # Check if MongoDB container is already running
    if docker ps -q -f name="$MONGODB_CONTAINER" | grep -q .; then
        log "MongoDB container is already running"
        return 0
    fi
    
    # Start MongoDB container
    log "Starting MongoDB container..."
    docker run -d \
        --name "$MONGODB_CONTAINER" \
        --network "$DOCKER_NETWORK" \
        --restart unless-stopped \
        -p 27017:27017 \
        -v mongodb_data:/data/db \
        -e MONGO_INITDB_ROOT_USERNAME=admin \
        -e MONGO_INITDB_ROOT_PASSWORD=password \
        -e MONGO_INITDB_DATABASE=jobposting \
        mongo:7-jammy
    
    # Wait for MongoDB to be ready
    log "Waiting for MongoDB to be ready..."
    sleep 30
    
    log "MongoDB container started successfully!"
}

start_backend_container() {
    log "=== Starting Backend Container ==="
    
    # Start the backend container
    log "Starting backend container..."
    docker run -d \
        --name "$DOCKER_CONTAINER_NAME" \
        --network "$DOCKER_NETWORK" \
        --restart unless-stopped \
        -p "$APP_PORT:$APP_PORT" \
        --env-file "$DEPLOY_DIR/backend/.env" \
        --health-cmd="curl -f http://localhost:$APP_PORT/health || exit 1" \
        --health-interval=30s \
        --health-timeout=10s \
        --health-retries=3 \
        "$DOCKER_IMAGE_NAME:latest"
    
    log "Backend container started successfully!"
}

# =============================================================================
# HEALTH CHECKS AND VERIFICATION
# =============================================================================

verify_deployment() {
    log "=== Verifying Deployment ==="
    
    # Wait for application to start
    log "Waiting for application to start..."
    sleep 60
    
    # Check container status
    if ! docker ps | grep -q "$DOCKER_CONTAINER_NAME"; then
        error_exit "Backend container is not running!"
    fi
    
    # Check application health
    log "Checking application health..."
    for i in {1..10}; do
        if curl -f "http://localhost:$APP_PORT/health" &>/dev/null; then
            log "Application is healthy and responding!"
            break
        else
            log "Health check attempt $i/10 failed. Retrying in 10 seconds..."
            sleep 10
            if [ $i -eq 10 ]; then
                error_exit "Application health check failed after 10 attempts!"
            fi
        fi
    done
    
    # Display container logs
    log "Recent container logs:"
    docker logs --tail 20 "$DOCKER_CONTAINER_NAME"
    
    log "Deployment verification completed successfully!"
}

# =============================================================================
# CLEANUP AND OPTIMIZATION
# =============================================================================

cleanup_old_images() {
    log "=== Cleaning up old Docker images ==="
    
    # Remove dangling images
    docker image prune -f
    
    # Keep only last 3 versions of the application image
    docker images "$DOCKER_IMAGE_NAME" --format "table {{.Tag}}\t{{.ID}}" | tail -n +2 | head -n -3 | awk '{print $2}' | xargs -r docker rmi
    
    log "Docker cleanup completed!"
}

setup_logrotate() {
    log "=== Setting up log rotation ==="
    
    sudo tee /etc/logrotate.d/job-posting << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF
    
    log "Log rotation setup completed!"
}

# =============================================================================
# MONITORING AND ALERTS
# =============================================================================

setup_monitoring() {
    log "=== Setting up basic monitoring ==="
    
    # Create a simple monitoring script
    cat > "$DEPLOY_DIR/monitor.sh" << 'EOF'
#!/bin/bash
# Basic monitoring script for Job Posting Platform

CONTAINER_NAME="job-backend-container"
LOG_FILE="/var/log/job-posting/monitor.log"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "[$(date)] ALERT: Backend container is not running!" >> "$LOG_FILE"
    # Restart container
    docker start "$CONTAINER_NAME" >> "$LOG_FILE" 2>&1
fi

# Check application health
if ! curl -f http://localhost:8000/health &>/dev/null; then
    echo "[$(date)] ALERT: Application health check failed!" >> "$LOG_FILE"
fi

# Check disk usage
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "[$(date)] WARNING: Disk usage is at $DISK_USAGE%" >> "$LOG_FILE"
fi
EOF

    chmod +x "$DEPLOY_DIR/monitor.sh"
    
    # Add to crontab for regular monitoring
    (crontab -l 2>/dev/null || true; echo "*/5 * * * * $DEPLOY_DIR/monitor.sh") | crontab -
    
    log "Monitoring setup completed!"
}

# =============================================================================
# BACKUP FUNCTIONALITY
# =============================================================================

setup_backup() {
    log "=== Setting up backup functionality ==="
    
    cat > "$DEPLOY_DIR/backup.sh" << 'EOF'
#!/bin/bash
# Backup script for Job Posting Platform

BACKUP_DIR="/opt/backups/job-posting"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Backup MongoDB data
docker exec job-mongodb-container mongodump --out /tmp/backup_$TIMESTAMP
docker cp job-mongodb-container:/tmp/backup_$TIMESTAMP $BACKUP_DIR/mongodb_$TIMESTAMP

# Backup application code
tar -czf $BACKUP_DIR/app_$TIMESTAMP.tar.gz /opt/job-posting-platform

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongodb_*" -mtime +7 -exec rm -rf {} \;

echo "[$(date)] Backup completed: $TIMESTAMP"
EOF

    chmod +x "$DEPLOY_DIR/backup.sh"
    
    # Schedule daily backups
    (crontab -l 2>/dev/null || true; echo "0 2 * * * $DEPLOY_DIR/backup.sh >> $LOG_DIR/backup.log 2>&1") | crontab -
    
    log "Backup setup completed!"
}

# =============================================================================
# FIREWALL CONFIGURATION
# =============================================================================

configure_firewall() {
    log "=== Configuring Firewall ==="
    
    # Configure iptables rules
    sudo iptables -I INPUT -p tcp --dport 22 -j ACCEPT      # SSH
    sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT      # HTTP
    sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT     # HTTPS
    sudo iptables -I INPUT -p tcp --dport "$APP_PORT" -j ACCEPT  # Backend API
    
    # Save iptables rules
    if command -v iptables-save &> /dev/null; then
        sudo iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
    fi
    
    log "Firewall configuration completed!"
}

# =============================================================================
# MAIN EXECUTION FLOW
# =============================================================================

main() {
    log "=== Starting Job Posting Platform Backend Deployment ==="
    log "Deployment started at: $(date)"
    
    # Check if running as ec2-user or with sudo access
    if [ "$EUID" -eq 0 ]; then
        error_exit "Please do not run this script as root. Use ec2-user instead."
    fi
    
    # Verify required commands
    check_command "curl"
    check_command "git"
    
    # Execute deployment steps
    prepare_system
    install_docker
    
    # Note: After Docker installation, you may need to log out and back in
    # for group changes to take effect. This script handles that automatically.
    
    clone_or_update_repo
    setup_environment
    stop_existing_containers
    build_backend_image
    start_mongodb
    start_backend_container
    verify_deployment
    cleanup_old_images
    setup_logrotate
    setup_monitoring
    setup_backup
    configure_firewall
    
    log "=== Deployment Completed Successfully! ==="
    log "Application URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):$APP_PORT"
    log "Health Check: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):$APP_PORT/health"
    log "Logs: docker logs $DOCKER_CONTAINER_NAME"
    log "Deployment completed at: $(date)"
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================

# Create log directory if it doesn't exist
sudo mkdir -p "$LOG_DIR"
sudo chown ec2-user:ec2-user "$LOG_DIR"

# Execute main function and log output
main "$@" 2>&1 | tee -a "$LOG_DIR/deployment.log"
