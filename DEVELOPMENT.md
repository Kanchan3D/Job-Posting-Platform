# Job Posting Platform Development

## Development Scripts

### Quick Start Development
```bash
# Start backend in development mode
cd backend && npm run dev

# Start frontend in development mode  
cd frontend && npm run dev

# Run both with Docker Compose
docker-compose up -d
```

### Database Management
```bash
# Access MongoDB shell in Docker
docker-compose exec mongodb mongosh -u admin -p password

# Backup database
docker-compose exec mongodb mongodump --uri="mongodb://admin:password@localhost:27017/jobposting?authSource=admin"

# Restore database
docker-compose exec mongodb mongorestore --uri="mongodb://admin:password@localhost:27017/jobposting?authSource=admin" dump/
```

### Production Deployment
```bash
# Build production images
docker-compose build

# Deploy to production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View production logs
docker-compose logs -f
```

## Common Development Tasks

### Adding New Features
1. Create new routes in backend/src/routes/
2. Add controllers in backend/src/controllers/
3. Create corresponding frontend pages/components
4. Update API service calls
5. Add tests for new functionality

### Database Schema Changes
1. Update models in backend/src/models/
2. Create migration scripts if needed
3. Update API documentation
4. Test with existing data

### Environment Setup
1. Copy .env.example to .env
2. Update MongoDB URI and JWT secret
3. Configure frontend API URL
4. Set up GitHub secrets for CI/CD
