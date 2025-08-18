const request = require('supertest');
const app = require('../src/server');

describe('API Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
  });
});

describe('Authentication Endpoints', () => {
  test('POST /api/auth/register should validate required fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({})
      .expect(400);
    
    expect(response.body.errors).toBeDefined();
  });

  test('POST /api/auth/login should validate required fields', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({})
      .expect(400);
    
    expect(response.body.errors).toBeDefined();
  });
});

describe('Job Endpoints', () => {
  test('GET /api/jobs should return jobs list', async () => {
    const response = await request(app)
      .get('/api/jobs')
      .expect(200);
    
    expect(response.body.jobs).toBeDefined();
    expect(response.body.pagination).toBeDefined();
  });
});

describe('404 Handler', () => {
  test('Should return 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/api/unknown-route')
      .expect(404);
    
    expect(response.body.message).toBe('Route not found');
  });
});
