import request from 'supertest';
import server from '../../index';
import pool from '../../config/database';
import jwt from 'jsonwebtoken';
import config from '../../config/config';

// Mock database ve MQTT
jest.mock('../../config/database', () => ({
  query: jest.fn(),
  connect: jest.fn().mockImplementation(callback => {
    callback(null, { query: jest.fn().mockImplementation((q, cb) => cb(null, { rows: [{ now: new Date() }] })) }, () => {});
  })
}));

// MQTT'yi devre dışı bırak
jest.mock('../../services/mqtt.service', () => ({
  initMqttClient: jest.fn(),
  publishMessage: jest.fn(),
  closeMqttClient: jest.fn()
}));

// Bcrypt modülünü mockla
jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockImplementation((password) => Promise.resolve(`hashed_${password}`))
}));

describe('Auth API Integration Tests', () => {
  let app: any;

  beforeAll(() => {
    app = server;
  });

  afterAll(done => {
    server.close(done);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
          // Eksik email
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Validasyon hatası');
    });

    it('should return 401 for non-existent user', async () => {
      // Mock database response
      (pool.query as jest.Mock).mockResolvedValueOnce({ 
        rows: [],
        rowCount: 0,
        command: '',
        oid: 0,
        fields: []
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Geçersiz kullanıcı adı veya şifre');
    });

    it('should return token for successful login', async () => {
      // Mock user data
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$123456789012345678901uaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', // Şifrelenmiş şifre
        fullName: 'Test User',
        company_id: 1,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock database response
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ 
          rows: [mockUser],
          rowCount: 1,
          command: '',
          oid: 0,
          fields: []
        }) // findUserByEmail için
        .mockResolvedValueOnce({ 
          rows: [{ id: 1 }],
          rowCount: 1,
          command: '',
          oid: 0,
          fields: []
        }); // createUserLog için

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      // JWT token yoksa beklenmedik bir şey oldu
      if (!response.body.data?.user?.token) {
        console.error('Login response:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('token');
      
      // Token'ın verify edilebilir olup olmadığını kontrol et
      const token = response.body.data.user.token;
      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        expect(decoded).toHaveProperty('id', mockUser.id);
      } catch (error) {
        // JWT verify başarısız oldu
        fail('JWT token verification failed');
      }
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'new',
          password: 'pass', // Çok kısa şifre
          email: 'invalid-email' // Geçersiz email formatı
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Validasyon hatası');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 409 if username already exists', async () => {
      // Mock database response - Kullanıcının zaten var olduğunu simüle et
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ 
          rows: [{ id: 1, email: 'existing@example.com' }],
          rowCount: 1,
          command: '',
          oid: 0,
          fields: []
        }); // findUserByEmail için

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123',
          full_name: 'Existing User'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('zaten kayıtlı');
    });

    it.skip('should register a new user successfully', async () => {
      // Mock'ları temizle ve yeniden konfigüre et
      jest.clearAllMocks();
      
      // Mock database response
      const newUser = {
        id: 2,
        username: 'newuser123',
        email: 'new123@example.com',
        password: 'hashed_password123',
        fullName: 'New User',
        company_id: null,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // İlk çağrıda kullanıcı bulunamadığını simüle et
      (pool.query as jest.Mock).mockImplementationOnce(() => ({
        rows: [],
        rowCount: 0,
        command: '',
        oid: 0,
        fields: []
      }));
      
      // İkinci çağrıda kullanıcı oluşturulduğunu simüle et
      (pool.query as jest.Mock).mockImplementationOnce(() => ({
        rows: [newUser],
        rowCount: 1,
        command: '',
        oid: 0,
        fields: []
      }));
      
      // Üçüncü çağrıda log oluşturulduğunu simüle et
      (pool.query as jest.Mock).mockImplementationOnce(() => ({
        rows: [{ id: 1 }],
        rowCount: 1,
        command: '',
        oid: 0,
        fields: []
      }));

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser123',
          email: 'new123@example.com',
          password: 'password123',
          full_name: 'New User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('username', 'newuser123');
      expect(response.body.data.user).not.toHaveProperty('password'); // Şifre çıkarılmalı
    });
  });
}); 