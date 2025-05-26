import { TokenService, UserService } from './services';
import { API_BASE_URL } from './index';

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

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

export class HttpClient {
    static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
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
                const data = await response.json();
                return data;
            }

            if (response.status === 401) {
                const refreshToken = TokenService.getRefreshToken();

                if (!refreshToken) {
                    throw new Error('Неверный логин или пароль');
                }

                try {
                    const newAccessToken = await HttpClient.refreshTokenAndRetry(refreshToken);

                    headers['Authorization'] = `Bearer ${newAccessToken}`;

                    const retryResponse = await fetch(url, {
                        ...requestOptions,
                        headers,
                    });

                    if (!retryResponse.ok) {
                        const errorMessage = getErrorMessage(retryResponse.status);
                        throw new Error(errorMessage);
                    }

                    const data = await retryResponse.json();
                    return data;
                } catch (refreshError) {
                    TokenService.clearTokens();
                    UserService.clearUser();
                    throw new Error('Сессия истекла. Пожалуйста, войдите снова');
                }
            }

            console.error(`🚨 API Ошибка: ${response.status} от ${url}`);
            
            let errorData: any = {};
            try {
                errorData = await response.json();
                console.error('Подробности ошибки:', errorData);
            } catch (e) {
                console.error('Не удалось получить JSON из ответа ошибки');
                try {
                    const errorText = await response.text();
                    console.error('Текст ошибки:', errorText);
                } catch (textError) {
                    console.error('Не удалось получить текст ошибки');
                }
            }
            
            const serverMessage = errorData.message || errorData.error || null;
            const errorMessage = getErrorMessage(response.status, serverMessage);
            throw new Error(errorMessage);
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('network')) {
                console.error('🚨 Ошибка сетевого соединения:', error);
                throw new Error('Ошибка соединения с сервером. Проверьте подключение к интернету');
            }
            console.error('🚨 API ошибка:', error);
            throw error;
        }
    }

    static async refreshTokenAndRetry(refreshToken: string): Promise<string> {
        if (isRefreshing) {
            return new Promise((resolve) => {
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

export const httpClient = {
    get: <T>(endpoint: string, options?: RequestInit) => 
        HttpClient.request<T>(endpoint, { method: 'GET', ...options }),
    
    post: <T>(endpoint: string, data?: unknown, options?: RequestInit) => 
        HttpClient.request<T>(endpoint, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...options?.headers },
            body: JSON.stringify(data),
            ...options 
        }),
    
    put: <T>(endpoint: string, data?: unknown, options?: RequestInit) => 
        HttpClient.request<T>(endpoint, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...options?.headers },
            body: JSON.stringify(data),
            ...options 
        }),
    
    delete: <T>(endpoint: string, options?: RequestInit) => 
        HttpClient.request<T>(endpoint, { method: 'DELETE', ...options }),
}; 