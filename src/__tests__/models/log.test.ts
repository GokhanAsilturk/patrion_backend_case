import { createUserLog, getUserLogsByUserId, getUserLogsByAction, getLogAnalytics } from '../../models/log.model';
import { LogAction } from '../../types/log';
import pool from '../../config/database';

// Test veritabanı bağlantısı mocklanıyor
jest.mock('../../config/database', () => ({
  query: jest.fn(),
}));

describe('Log Model Tests', () => {
  // Her test öncesinde mock'ları sıfırla
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserLog', () => {
    it('should create a user log successfully', async () => {
      // Mock response
      const mockResult = {
        rows: [{
          id: 1,
          user_id: 2,
          action: LogAction.VIEWED_LOGS,
          details: { target_user_id: 3 },
          ip_address: '192.168.1.1',
          timestamp: new Date(),
          createdAt: new Date()
        }]
      };

      // Mock the database query function
      (pool.query as jest.Mock).mockResolvedValue(mockResult);

      // Call the function
      const logData = {
        user_id: 2,
        action: LogAction.VIEWED_LOGS,
        details: { target_user_id: 3 },
        ip_address: '192.168.1.1'
      };
      
      const result = await createUserLog(logData);

      // Assertions
      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockResult.rows[0]);
    });

    it('should handle creation error properly', async () => {
      // Mock error
      const mockError = new Error('Database error');
      (pool.query as jest.Mock).mockRejectedValue(mockError);

      // Call the function and expect it to throw
      await expect(createUserLog({
        user_id: 2,
        action: LogAction.VIEWED_LOGS
      })).rejects.toThrow();
    });
  });

  describe('getUserLogsByUserId', () => {
    it('should get logs by user ID successfully', async () => {
      // Mock response
      const mockResult = {
        rows: [
          {
            id: 1,
            user_id: 2,
            action: LogAction.VIEWED_LOGS,
            details: { target_user_id: 3 },
            ip_address: '192.168.1.1',
            timestamp: new Date(),
            createdAt: new Date()
          },
          {
            id: 2,
            user_id: 2,
            action: LogAction.VIEWED_SENSOR_DATA,
            details: { sensor_id: 'sensor-1' },
            ip_address: '192.168.1.1',
            timestamp: new Date(),
            createdAt: new Date()
          }
        ]
      };

      // Mock the database query function
      (pool.query as jest.Mock).mockResolvedValue(mockResult);

      // Call the function
      const userId = 2;
      const result = await getUserLogsByUserId(userId);

      // Assertions
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [userId]);
      expect(result).toEqual(mockResult.rows);
      expect(result.length).toBe(2);
    });
  });

  describe('getUserLogsByAction', () => {
    it('should get logs by action type successfully', async () => {
      // Mock response
      const mockResult = {
        rows: [
          {
            id: 1,
            user_id: 2,
            action: LogAction.VIEWED_LOGS,
            details: { target_user_id: 3 },
            ip_address: '192.168.1.1',
            timestamp: new Date(),
            createdAt: new Date()
          },
          {
            id: 3,
            user_id: 4,
            action: LogAction.VIEWED_LOGS,
            details: { target_user_id: 5 },
            ip_address: '192.168.1.2',
            timestamp: new Date(),
            createdAt: new Date()
          }
        ]
      };

      // Mock the database query function
      (pool.query as jest.Mock).mockResolvedValue(mockResult);

      // Call the function
      const action = LogAction.VIEWED_LOGS;
      const result = await getUserLogsByAction(action);

      // Assertions
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [action]);
      expect(result).toEqual(mockResult.rows);
      expect(result.length).toBe(2);
      expect(result[0].action).toBe(LogAction.VIEWED_LOGS);
    });
  });

  describe('getLogAnalytics', () => {
    it('should get log analytics successfully', async () => {
      // Mock response
      const mockResult = {
        rows: [
          {
            action: LogAction.VIEWED_LOGS,
            count: 15,
            first_activity: new Date(),
            last_activity: new Date(),
            unique_users: 3
          },
          {
            action: LogAction.VIEWED_SENSOR_DATA,
            count: 10,
            first_activity: new Date(),
            last_activity: new Date(),
            unique_users: 2
          }
        ]
      };

      // Mock the database query function
      (pool.query as jest.Mock).mockResolvedValue(mockResult);

      // Call the function
      const days = 7;
      const result = await getLogAnalytics(days);

      // Assertions
      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockResult.rows);
      expect(result.length).toBe(2);
    });
  });
}); 