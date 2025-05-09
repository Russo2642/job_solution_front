const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE_URL = isLocalhost ? 'http://localhost:8080/api' : 'http://77.240.38.137:8080/api';

import {
    CategoryRating,
    City,
    CompaniesFilter,
    CompaniesResponse,
    Company,
    Industry,
    Pagination
} from '../../entities/company/types';

import { ReviewWithDetails } from '../../entities/review/types';

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

export interface RegisterRequest {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
    phone: string;
}

export interface LoginRequest {
    email: string;
    password: string;
    remember_me?: boolean;
}

export interface RefreshTokenRequest {
    refresh_token: string;
}

export interface LogoutRequest {
    refresh_token: string;
}

export interface Tokens {
    access_token: string;
    refresh_token: string;
}

export interface User {
    id: number;
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    created_at: string;
}

export interface AuthResponse {
    data: {
        tokens: Tokens;
        user: User;
    };
    success: boolean;
}

export interface LogoutResponse {
    data: {
        message: string;
    };
    success: boolean;
}

export interface RefreshResponse {
    data: {
        tokens: Tokens;
    };
    success: boolean;
}

export interface CitiesResponse {
    data: {
        cities: City[];
        pagination: Pagination;
    };
    success: boolean;
}

export interface IndustriesResponse {
    data: {
        industries: Industry[];
        pagination: Pagination;
    };
    success: boolean;
}

export interface CompanyDetailsResponse {
    data: {
        company: Company;
        category_ratings: CategoryRating[];
        industries: Industry[];
        city: City;
    };
    success: boolean;
}

export interface CompanyReviewsResponse {
    data: {
        reviews: ReviewWithDetails[];
        pagination: Pagination;
    };
    success: boolean;
}

export const getErrorMessage = (status: number, message?: string): string => {
    switch (status) {
        case 400:
            return 'Неверные данные запроса';
        case 401:
            return 'Неверный логин или пароль';
        case 403:
            return 'Доступ запрещен';
        case 404:
            return 'Ресурс не найден';
        case 422:
            return 'Ошибка валидации данных';
        case 429:
            return 'Слишком много запросов. Пожалуйста, попробуйте позже';
        case 500:
            return 'Внутренняя ошибка сервера';
        case 502:
        case 503:
        case 504:
            return 'Сервер временно недоступен. Пожалуйста, попробуйте позже';
        default:
            return message || `Ошибка запроса: ${status}`;
    }
};

export class ApiClient {
    static async request<T>(url: string, options: RequestInit = {}): Promise<T> {
        const headers: Record<string, string> = {
            'Accept': 'application/json',
            ...(options.headers as Record<string, string> || {})
        };

        const accessToken = TokenService.getAccessToken();
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const requestOptions: RequestInit = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(url, requestOptions);

            if (response.ok) {
                return await response.json();
            }

            if (response.status === 401) {
                const refreshToken = TokenService.getRefreshToken();

                if (!refreshToken) {
                    throw new Error('Неверный логин или пароль');
                }

                try {
                    const newAccessToken = await ApiClient.refreshTokenAndRetry(refreshToken);

                    headers['Authorization'] = `Bearer ${newAccessToken}`;

                    const retryResponse = await fetch(url, {
                        ...requestOptions,
                        headers,
                    });

                    if (!retryResponse.ok) {
                        const errorMessage = getErrorMessage(retryResponse.status);
                        throw new Error(errorMessage);
                    }

                    return await retryResponse.json();
                } catch (refreshError) {
                    TokenService.clearTokens();
                    UserService.clearUser();
                    throw new Error('Сессия истекла. Пожалуйста, войдите снова');
                }
            }

            const errorData = await response.json().catch(() => ({}));
            const serverMessage = errorData.message || errorData.error || null;
            const errorMessage = getErrorMessage(response.status, serverMessage);
            throw new Error(errorMessage);
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('network')) {
                throw new Error('Ошибка соединения с сервером. Проверьте подключение к интернету');
            }
            console.error('API ошибка:', error);
            throw error;
        }
    }

    static async refreshTokenAndRetry(refreshToken: string): Promise<string> {
        if (isRefreshing) {
            return new Promise<string>((resolve) => {
                refreshQueue.push((token: string) => {
                    resolve(token);
                });
            });
        }

        isRefreshing = true;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Не удалось обновить токен');
            }

            const data = await response.json();
            const newTokens = data.data.tokens;

            TokenService.setTokens(newTokens);

            refreshQueue.forEach(callback => callback(newTokens.access_token));
            refreshQueue = [];

            return newTokens.access_token;
        } finally {
            isRefreshing = false;
        }
    }
}

export class AuthApi {
    static async register(data: RegisterRequest): Promise<AuthResponse> {
        return ApiClient.request<AuthResponse>(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    static async login(data: LoginRequest): Promise<AuthResponse> {
        return ApiClient.request<AuthResponse>(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    static async logout(data: LogoutRequest): Promise<LogoutResponse> {
        return ApiClient.request<LogoutResponse>(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    static async refresh(data: RefreshTokenRequest): Promise<RefreshResponse> {
        return ApiClient.request<RefreshResponse>(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }
}

export class TokenService {
    static setTokens(tokens: Tokens): void {
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
    }

    static getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    }

    static getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    static clearTokens(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
}

export class UserService {
    static setUser(user: User): void {
        localStorage.setItem('user', JSON.stringify(user));
    }

    static getUser(): User | null {
        const userJson = localStorage.getItem('user');
        if (userJson) {
            return JSON.parse(userJson);
        }
        return null;
    }

    static clearUser(): void {
        localStorage.removeItem('user');
    }
}

export const isAuthenticated = (): boolean => {
    return !!TokenService.getAccessToken();
};

export class CompanyApi {
    static async getCompanies(filters?: CompaniesFilter): Promise<CompaniesResponse> {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.search && filters.search.trim()) {
                params.append('search', filters.search.trim());
            }
            if (filters.industries && filters.industries.length > 0) {
                params.append('industries', filters.industries.join(','));
            }
            if (filters.size) {
                params.append('size', filters.size);
            }
            if (filters.city_id) {
                params.append('city_id', filters.city_id.toString());
            }
            if (filters.sort_by) {
                params.append('sort_by', filters.sort_by);
            }
            if (filters.sort_order) {
                params.append('sort_order', filters.sort_order);
            }
            if (filters.page) {
                params.append('page', filters.page.toString());
            }
            if (filters.limit) {
                params.append('limit', filters.limit.toString());
            }
        }

        const queryString = params.toString();
        const url = `${API_BASE_URL}/companies${queryString ? `?${queryString}` : ''}`;

        return ApiClient.request<CompaniesResponse>(url);
    }

    static async getCompanyDetails(slug: string): Promise<CompanyDetailsResponse> {
        const url = `${API_BASE_URL}/companies/${slug}`;
        return ApiClient.request<CompanyDetailsResponse>(url);
    }

    static async getCompanyReviews(
        companyId: number,
        page = 1,
        limit = 5,
        sortBy?: string,
        sortOrder?: string,
        cityId?: number,
        minRating?: number,
        maxRating?: number,
        isFormerEmployee?: boolean
    ): Promise<CompanyReviewsResponse> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        if (sortBy) params.append('sort_by', sortBy);
        if (sortOrder) params.append('sort_order', sortOrder);
        if (cityId) params.append('city_id', cityId.toString());
        if (minRating !== undefined) params.append('min_rating', minRating.toString());
        if (maxRating !== undefined) params.append('max_rating', maxRating.toString());
        if (isFormerEmployee !== undefined) params.append('is_former_employee', isFormerEmployee.toString());

        const url = `${API_BASE_URL}/reviews/company/${companyId}?${params.toString()}`;
        return ApiClient.request<CompanyReviewsResponse>(url);
    }
}

export class CityApi {
    static async getCities(page = 1, limit = 100): Promise<CitiesResponse> {
        const url = `${API_BASE_URL}/cities?page=${page}&limit=${limit}`;
        return ApiClient.request<CitiesResponse>(url);
    }
}

export class IndustryApi {
    static async getIndustries(page = 1, limit = 100): Promise<IndustriesResponse> {
        const url = `${API_BASE_URL}/industries?page=${page}&limit=${limit}`;
        return ApiClient.request<IndustriesResponse>(url);
    }
}

export class ReviewApi {
    static async createReview(reviewData: any): Promise<any> {
        const url = `${API_BASE_URL}/reviews`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${TokenService.getAccessToken()}`
                },
                body: JSON.stringify(reviewData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Детальная информация об ошибке:', errorText);

                try {
                    const errorJson = JSON.parse(errorText);
                    console.error('Ошибка в формате JSON:', errorJson);

                    if (errorJson.message) {
                        throw new Error(`Ошибка API: ${errorJson.message}`);
                    }
                } catch (jsonError) {
                }

                throw new Error(`Ошибка запроса: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при создании отзыва в ReviewApi:', error);
            console.error('Данные для создания отзыва:', JSON.stringify(reviewData, null, 2));
            throw error;
        }
    }

    static async markAsUseful(reviewId: number): Promise<any> {
        const url = `${API_BASE_URL}/reviews/${reviewId}/useful`;
        return ApiClient.request(url, {
            method: 'POST',
        });
    }

    static async removeUsefulMark(reviewId: number): Promise<any> {
        const url = `${API_BASE_URL}/reviews/${reviewId}/useful`;
        return ApiClient.request(url, {
            method: 'DELETE',
        });
    }

    static async getUserReviews(status: string = '', page = 1, limit = 10): Promise<CompanyReviewsResponse> {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        return ApiClient.request<CompanyReviewsResponse>(
            `${API_BASE_URL}/users/me/reviews?${params.toString()}`
        );
    }
}

export * from './auth';
export * from './companies';
export * from './cities';
export * from './industries';
export * from './reviews';

export * from './types';

export * from './services';

export * from './httpClient';