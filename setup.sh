#!/bin/bash

# Job Posting Platform Setup Script
# This script helps you quickly set up the development environment

set -e

echo "🚀 Setting up Job Posting Platform..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Please edit .env file with your configuration"
fi

# Create backend environment file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📄 Creating backend .env file from template..."
    cp backend/.env.example backend/.env
    echo "✅ Please edit backend/.env file with your configuration"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Build and start services
echo "🐳 Building and starting Docker services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."
if curl -f http://localhost:5000/health >/dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:5000"
else
    echo "❌ Backend health check failed"
fi

if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend health check failed"
fi

echo ""
echo "🎉 Setup complete!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "🗄️  MongoDB: mongodb://localhost:27017"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env files with your configuration"
echo "2. Visit http://localhost:3000 to see the application"
echo "3. Check docker-compose logs for any issues"
echo ""
echo "🛑 To stop services: docker-compose down"
