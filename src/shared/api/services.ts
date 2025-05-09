export interface Tokens {
    access_token: string;
    refresh_token: string;
}

export const TokenService = {
    getAccessToken: (): string | null => {
        return localStorage.getItem('access_token');
    },

    getRefreshToken: (): string | null => {
        return localStorage.getItem('refresh_token');
    },

    setTokens: (tokens: Tokens): void => {
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
    },

    clearTokens: (): void => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
};

export const UserService = {
    getUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    setUser: (user: any): void => {
        localStorage.setItem('user', JSON.stringify(user));
    },

    clearUser: (): void => {
        localStorage.removeItem('user');
    }
};

export const isAuthenticated = (): boolean => {
    return !!TokenService.getAccessToken() && !!TokenService.getRefreshToken();
}; 