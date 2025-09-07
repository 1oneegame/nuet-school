import jwt from 'jsonwebtoken';
import { authAPI } from '@/utils/api';

interface TokenData {
  userId: string;
  email: string;
  role: string;
  hasStudentAccess: boolean;
  exp: number;
  iat: number;
}

class AuthManager {
  private static instance: AuthManager;
  private token: string | null = null;
  private user: any = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAuth();
    }
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private initializeAuth() {
    this.token = this.getStoredToken();
    if (this.token) {
      const userData = this.getStoredUser();
      if (userData) {
        this.user = userData;
        this.scheduleTokenRefresh();
      }
    }
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const localToken = localStorage.getItem('token');
    if (localToken) return localToken;
    
    const cookieToken = this.getCookieToken();
    if (cookieToken) {
      localStorage.setItem('token', cookieToken);
      return cookieToken;
    }
    
    return null;
  }

  private getCookieToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token') {
        return value;
      }
    }
    return null;
  }

  private getStoredUser(): any {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  private scheduleTokenRefresh() {
    if (!this.token) return;

    try {
      const decoded = jwt.decode(this.token) as TokenData;
      if (!decoded || !decoded.exp) return;

      const now = Math.floor(Date.now() / 1000);
      const expiresIn = decoded.exp - now;
      
      if (expiresIn <= 0) {
        this.logout();
        return;
      }

      const refreshTime = Math.max(0, (expiresIn - 3600) * 1000);

      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
      }

      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);

    } catch (error) {
      console.error('Ошибка при планировании обновления токена:', error);
    }
  }

  private async refreshToken() {
    try {
      const { data } = await authAPI.refresh();
      if (data?.token) {
        this.setAuth(data.token, data.user);
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      this.logout();
    }
  }

  setAuth(token: string, user: any) {
    this.token = token;
    this.user = user;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Strict`;
    }
    
    this.scheduleTokenRefresh();
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): any {
    return this.user;
  }

  isAuthenticated(): boolean {
    if (!this.token) return false;
    
    try {
      const decoded = jwt.decode(this.token) as TokenData;
      if (!decoded || !decoded.exp) return false;
      
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp > now;
    } catch (error) {
      return false;
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }

  async checkAuthStatus(): Promise<boolean> {
    if (!this.token) return false;
    
    try {
      await authAPI.verify();
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }
}

export const authManager = AuthManager.getInstance();
