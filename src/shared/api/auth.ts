import { httpClient } from './httpClient';
import { 
    AuthResponse, 
    LoginRequest, 
    LogoutRequest, 
    LogoutResponse, 
    RefreshResponse, 
    RefreshTokenRequest, 
    RegisterRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse
} from './types';

export class AuthApi {
    static async register(data: RegisterRequest): Promise<AuthResponse> {
        return httpClient.post<AuthResponse>('/auth/register', data);
    }

    static async login(data: LoginRequest): Promise<AuthResponse> {
        return httpClient.post<AuthResponse>('/auth/login', data);
    }

    static async logout(data: LogoutRequest): Promise<LogoutResponse> {
        return httpClient.post<LogoutResponse>('/auth/logout', data);
    }

    static async refresh(data: RefreshTokenRequest): Promise<RefreshResponse> {
        return httpClient.post<RefreshResponse>('/auth/refresh', data);
    }
    
    static async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
        return httpClient.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    }
} 