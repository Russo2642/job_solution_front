import { CategoryRating, City, Company, Industry } from '../types';
import { ReviewWithDetails } from '../types';
import { User } from '../types';
import { Tokens } from './services';

export interface Pagination {
    limit: number;
    page: number;
    pages: number;
    total: number;
}

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

export interface CompaniesFilter {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    industryIds?: number[];
    cityIds?: number[];
    minRating?: number;
    maxRating?: number;
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

export interface CompaniesResponse {
    data: {
        companies: Company[];
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

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface ReviewCreateResponse {
    data: {
        review: ReviewWithDetails;
    };
    success: boolean;
}

export interface ReviewActionResponse {
    data: {
        message: string;
    };
    success: boolean;
} 