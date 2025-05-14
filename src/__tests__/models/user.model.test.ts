import { QueryResult } from 'pg';
import { 
  findUserByEmail, 
  findUserById,
  getAllUsers,
  updateUser
} from '../../models/user.model';
import pool from '../../config/database';
import { UserRole } from '../../types/user';

// Mock pg pool
jest.mock('../../config/database', () => ({
  query: jest.fn()
}));

describe('User Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserByEmail', () => {
    it('should return a user when found', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed_password',
        fullName: 'Test User',
        company_id: 1,
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (pool.query as jest.Mock).mockResolvedValue({ 
        rows: [mockUser],
        rowCount: 1,
        command: '',
        oid: 0,
        fields: []
      });

      const result = await findUserByEmail('test@example.com');
      
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['test@example.com']);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ 
        rows: [],
        rowCount: 0,
        command: '',
        oid: 0,
        fields: []
      });

      const result = await findUserByEmail('nonexistent@example.com');
      
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), ['nonexistent@example.com']);
      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      const errorMessage = 'Database error';
      (pool.query as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(findUserByEmail('test@example.com')).rejects.toThrow(errorMessage);
    });
  });

  describe('findUserById', () => {
    it('should return a user when found', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed_password',
        fullName: 'Test User',
        company_id: 1,
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (pool.query as jest.Mock).mockResolvedValue({ 
        rows: [mockUser],
        rowCount: 1,
        command: '',
        oid: 0,
        fields: []
      });

      const result = await findUserById(1);
      
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ 
        rows: [],
        rowCount: 0,
        command: '',
        oid: 0,
        fields: []
      });

      const result = await findUserById(999);
      
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [999]);
      expect(result).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'user1',
          email: 'user1@example.com',
          fullName: 'User One',
          company_id: 1,
          role: UserRole.USER,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          username: 'user2',
          email: 'user2@example.com',
          fullName: 'User Two',
          company_id: 1,
          role: UserRole.USER,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      (pool.query as jest.Mock).mockResolvedValue({ 
        rows: mockUsers,
        rowCount: 2,
        command: '',
        oid: 0,
        fields: []
      });

      const result = await getAllUsers();
      
      expect(pool.query).toHaveBeenCalledWith(expect.any(String));
      expect(result).toEqual(mockUsers);
      expect(result.length).toBe(2);
    });

    it('should return empty array when no users', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ 
        rows: [],
        rowCount: 0,
        command: '',
        oid: 0,
        fields: []
      });

      const result = await getAllUsers();
      
      expect(pool.query).toHaveBeenCalledWith(expect.any(String));
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('updateUser', () => {
    it('should update user and return updated user', async () => {
      const mockUpdatedUser = {
        id: 1,
        username: 'testuser',
        email: 'updated@example.com',
        password: 'hashed_password',
        fullName: 'Updated Name',
        company_id: 2,
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (pool.query as jest.Mock).mockResolvedValue({ 
        rows: [mockUpdatedUser],
        rowCount: 1,
        command: '',
        oid: 0,
        fields: []
      });

      const updateData = {
        email: 'updated@example.com',
        fullName: 'Updated Name',
        company_id: 2
      };

      const result = await updateUser(1, updateData);
      
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), expect.arrayContaining(['updated@example.com', 'Updated Name', 2, 1]));
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw error when no fields to update', async () => {
      await expect(updateUser(1, {})).rejects.toThrow('Güncellenecek alan bulunamadı');
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      (pool.query as jest.Mock).mockResolvedValue({ 
        rows: [],
        rowCount: 0,
        command: '',
        oid: 0,
        fields: []
      });

      await expect(updateUser(999, { email: 'new@example.com' })).rejects.toThrow('Kullanıcı bulunamadı');
    });
  });
}); 