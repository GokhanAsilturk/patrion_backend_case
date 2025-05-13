import { UserInput, UserLogin, UserResponse } from '../types/user';
import * as userModel from '../models/user.model';
import { generateToken } from '../utils/jwt.utils';

/**
 * Kullanıcı kaydı yapar
 */
export const register = async (userData: UserInput): Promise<UserResponse> => {
  try {
    // Şifreyi hash'le (normalde bcrypt kullanılır)
    const hashedPassword = userData.password; // Bu sadece örnek, gerçek uygulamada şifre hashlenmeli!
    
    // Kullanıcıyı veritabanına kaydet
    const user = await userModel.createUser({
      ...userData,
      password: hashedPassword
    });

    // JWT token oluştur
    const token = generateToken(user);

    // Hassas bilgileri çıkar ve yanıt döndür
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      token
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
      throw new Error('Kullanıcı bulunamadı');
    }

    // Şifre kontrolü yap (normalde bcrypt.compare kullanılır)
    const isValidPassword = credentials.password === user.password; // Bu sadece örnek!
    
    if (!isValidPassword) {
      throw new Error('Geçersiz şifre');
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