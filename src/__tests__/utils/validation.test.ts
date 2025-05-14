import { Request, Response } from 'express';
import { authValidation, userValidation } from '../../utils/validation.rules';
import { validate } from '../../middlewares/validator.middleware';

// Mock Express request ve response
const mockRequest = (body = {}, params = {}, query = {}) => {
  return {
    body,
    params,
    query
  } as Request;
};

const mockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  return res as Response;
};

const mockNext = jest.fn();

describe('Validation Rules', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Auth Validation', () => {
    describe('Login Validation', () => {
      const validationMiddleware = validate(authValidation.login);

      it('should pass for valid login data', async () => {
        const req = mockRequest({
          email: 'test@example.com',
          password: 'password123'
        });
        
        await validationMiddleware(req, mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
      });

      it('should fail for missing email', async () => {
        const req = mockRequest({
          password: 'password123'
        });
        const res = mockResponse();
        
        await validationMiddleware(req, res, mockNext);
        expect(mockNext).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'error',
            message: 'Validasyon hatası'
          })
        );
      });

      it('should fail for short password', async () => {
        const req = mockRequest({
          email: 'test@example.com',
          password: '12345'
        });
        const res = mockResponse();
        
        await validationMiddleware(req, res, mockNext);
        expect(mockNext).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
      });
    });

    describe('Register Validation', () => {
      const validationMiddleware = validate(authValidation.register);

      it('should pass for valid registration data', async () => {
        const req = mockRequest({
          username: 'newuser',
          email: 'test@example.com',
          password: 'password123',
          full_name: 'Test User'
        });
        
        await validationMiddleware(req, mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
      });

      it('should fail for invalid email', async () => {
        const req = mockRequest({
          username: 'newuser',
          email: 'invalid-email',
          password: 'password123'
        });
        const res = mockResponse();
        
        await validationMiddleware(req, res, mockNext);
        expect(mockNext).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
      });
    });
  });

  describe('User Validation', () => {
    describe('Get User By ID Validation', () => {
      const validationMiddleware = validate(userValidation.getById);

      it('should pass for valid user ID', async () => {
        const req = mockRequest({}, { id: '1' });
        
        await validationMiddleware(req, mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
      });

      it('should fail for non-numeric user ID', async () => {
        const req = mockRequest({}, { id: 'abc' });
        const res = mockResponse();
        
        await validationMiddleware(req, res, mockNext);
        expect(mockNext).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
      });
    });

    describe('Update User Validation', () => {
      const validationMiddleware = validate(userValidation.update);

      it('should pass for valid update data', async () => {
        const req = mockRequest(
          { email: 'new@example.com', full_name: 'Updated Name' },
          { id: '1' }
        );
        
        await validationMiddleware(req, mockResponse(), mockNext);
        expect(mockNext).toHaveBeenCalled();
      });

      it('should fail for invalid email format', async () => {
        const req = mockRequest(
          { email: 'invalid-email' },
          { id: '1' }
        );
        const res = mockResponse();
        
        await validationMiddleware(req, res, mockNext);
        expect(mockNext).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
      });
    });
  });
}); 