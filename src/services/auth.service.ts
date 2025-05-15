import { UserInput, UserLogin, UserResponse } from '../types/user';
import * as userModel from '../models/user.model';
import { generateToken } from '../utils/jwt.utils';
import bcrypt from 'bcrypt';

/**
 * Kullanıcı kaydı yapar
 */
export const register = async (userData: UserInput): Promise<UserResponse> => {
  try {
    // Kullanıcının zaten kayıtlı olup olmadığını kontrol et
    const existingUser = await userModel.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('Bu email adresi zaten kayıtlı');
    }
    
    // Şifreyi hash'le
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    // İstek gövdesinde full_name kullanılıyorsa, fullName'e dönüştür
    const { full_name, ...rest } = userData as any;
    const userDataWithCorrectFields = {
      ...rest,
      fullName: full_name || userData.fullName,
      password: hashedPassword
    };
    
    // Kullanıcıyı veritabanına kaydet
    const user = await userModel.createUser(userDataWithCorrectFields);

    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword
    };
  } catch (error) {
    console.error('Kullanıcı kaydı sırasında hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
};

/**
 * Kullanıcı girişi yapar
 */
export const login = async (credentials: UserLogin): Promise<UserResponse> => {
  try {
    // Email ile kullanıcıyı bul
    const user = await userModel.findUserByEmail(credentials.email);
    
    if (!user) {
      throw new Error('Geçersiz kullanıcı adı veya şifre');
    }

    // Şifre kontrolü yap
    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Geçersiz kullanıcı adı veya şifre');
    }

    // JWT token oluştur
    const token = generateToken(user);

    // Hassas bilgileri çıkar ve token ile yanıt döndür
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      token
    };
  } catch (error) {
    console.error('Giriş sırasında hata:', error instanceof Error ? error.message : 'Bilinmeyen hata');
    throw error;
  }
}; 