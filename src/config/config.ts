import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'patrion_case',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'patrion_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};

export default config; 