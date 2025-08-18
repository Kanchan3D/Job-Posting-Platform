# Job Posting Platform - MERN Stack with DevOps

A scalable, production-ready job posting platform built with the MERN stack, featuring comprehensive DevOps automation, Docker containerization, and CI/CD pipelines.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │────│   Node.js/      │────│   MongoDB       │
│   Frontend      │    │   Express API   │    │   Database      │
│   (Port 3000)   │    │   (Port 5000)   │    │   (Port 27017)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Features

### Application Features
- **Admin Functions:**
  - Post job listings (title, company, location, salary, description)
  - Manage job applications
  - View application analytics
  
- **User Functions:**
  - User registration and authentication
  - Browse and search job listings
  - Apply to jobs with resume and cover letter
  - Track application status in "My Applications" page

### DevOps Features
- **Containerization:** Docker setup for all services
- **CI/CD Pipeline:** GitHub Actions for automated testing and deployment
- **Cloud Deployment:** Ready for AWS EC2/ECS, Render, or Railway
- **Security:** JWT authentication, input validation, security headers
- **Monitoring:** Health checks and logging

## 📁 Project Structure

```
Job Posting Platform/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth & validation
│   │   └── server.js        # App entry point
│   ├── tests/               # API tests
│   ├── Dockerfile           # Backend container
│   └── package.json
├── frontend/                # React.js SPA
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route components
│   │   ├── context/         # State management
│   │   ├── services/        # API calls
│   │   └── main.jsx         # App entry point
│   ├── Dockerfile           # Frontend container
│   └── package.json
├── .github/workflows/       # CI/CD pipelines
├── docker-compose.yml       # Multi-service orchestration
└── README.md               # This file
```

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with bcryptjs
- **Validation:** express-validator
- **Security:** Helmet, CORS, rate limiting
- **Testing:** Jest, Supertest

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **State Management:** React Query + Context API
- **Forms:** React Hook Form
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

### DevOps
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions
- **Registry:** Docker Hub / GitHub Container Registry
- **Deployment:** AWS EC2/ECS, Render.com, Railway.app
- **Monitoring:** Health checks, logging

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd "Job Posting Platform"

# Setup environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit each .env file with your configuration
```

### 2. Development with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 3. Manual Development Setup

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Database Setup
- Install MongoDB locally or use MongoDB Atlas
- Update MONGODB_URI in backend/.env

## 🔧 Environment Configuration

### Root `.env` (Docker Compose Only)
```env
# Docker Compose orchestration variables
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
MONGO_DB_NAME=jobposting
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters
```

### Backend Environment Variables (`backend/.env`)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobposting
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters-long
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME="Job Posting Platform"
NODE_ENV=development
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with docker-compose
docker-compose up --build -d

# For production with nginx proxy
docker-compose --profile production up -d
```

### Cloud Deployment Options

#### 1. AWS EC2/ECS
- Use provided Dockerfiles
- Set up security groups for ports 80, 443
- Configure environment variables
- Use Application Load Balancer

#### 2. Render.com
- Connect GitHub repository
- Set up web service for backend
- Set up static site for frontend
- Configure environment variables

#### 3. Railway.app
- Deploy directly from GitHub
- Automatic HTTPS and domain
- Built-in environment management

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Security headers with Helmet
- Docker security best practices

## 📋 API Documentation

### Authentication Endpoints
```
POST /api/auth/register - User registration
POST /api/auth/login    - User login
GET  /api/auth/profile  - Get user profile
PUT  /api/auth/profile  - Update user profile
```

### Job Endpoints
```
GET    /api/jobs        - Get all jobs (with filtering)
GET    /api/jobs/:id    - Get job by ID
POST   /api/jobs        - Create job (admin only)
PUT    /api/jobs/:id    - Update job
DELETE /api/jobs/:id    - Delete job
GET    /api/jobs/my-jobs - Get user's posted jobs
```

### Application Endpoints
```
POST   /api/applications              - Apply to job
GET    /api/applications/my-applications - Get user's applications
GET    /api/applications/job/:jobId   - Get job applications (admin)
PUT    /api/applications/:id/status   - Update application status
DELETE /api/applications/:id          - Delete application
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm test               # Run component tests
npm run test:e2e      # End-to-end tests (if configured)
```

## 🔄 CI/CD Pipeline

The GitHub Actions pipeline includes:

1. **Code Quality Checks**
   - ESLint for code style
   - Automated testing
   - Security vulnerability scanning

2. **Build Process**
   - Multi-platform Docker builds
   - Image optimization
   - Automated tagging

3. **Deployment**
   - Automatic deployment on main branch
   - Environment-specific configurations
   - Health checks and rollback

### Setting Up CI/CD

1. **Required GitHub Secrets:**
   ```
   DOCKER_USERNAME        # Docker Hub username
   DOCKER_PASSWORD        # Docker Hub password
   HOST                   # Deployment server IP
   USERNAME               # Server username
   SSH_KEY                # Private SSH key
   PORT                   # SSH port (usually 22)
   ```

2. **Workflow Triggers:**
   - Push to main/develop branches
   - Pull requests to main
   - Manual workflow dispatch

## 📊 Monitoring and Logging

### Health Checks
- Backend: `GET /health`
- Frontend: `GET /health` (nginx)
- Database: MongoDB ping

### Logging
- Request/response logging
- Error tracking
- Performance metrics
- Docker container logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Demo Credentials

For testing purposes:
- **Admin:** admin@example.com / password
- **User:** user@example.com / password

## 📞 Support

For questions and support:
- Create an issue in the GitHub repository
- Check the documentation
- Review the CI/CD pipeline logs

## 🔮 Future Enhancements

- [ ] Email notifications
- [ ] Advanced search filters
- [ ] File upload for resumes
- [ ] Application status tracking
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Kubernetes deployment
- [ ] Terraform infrastructure

---

Built with ❤️ using the MERN stack and modern DevOps practices.
