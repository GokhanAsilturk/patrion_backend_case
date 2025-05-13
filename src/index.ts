import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import config from './config/config';
import routes from './routes';
import { createUsersTable } from './models/user.model';

// Environment variables
dotenv.config();

// Express app
const app: Application = express();
const PORT = config.port;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database tables
const initDatabase = async () => {
  try {
    await createUsersTable();
    console.log('Veritabanı tabloları başarıyla oluşturuldu');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Veritabanı tabloları oluşturulurken hata:', errorMessage);
  }
};

// Routes
app.use('/api', routes);

app.get('/', (_req: Request, res: Response) => {
  res.send('Patrion Backend Case API - Hoş Geldiniz!');
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Initialize database
  await initDatabase();
});

export default app; 