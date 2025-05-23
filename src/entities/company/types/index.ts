import { Review } from '../../review/types';

export interface Company {
  id: number;
  name: string;
  slug: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  logo: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  city_id: number;
  reviews_count: number;
  average_rating: number;
  recommendation_percentage?: number;
  founded_year?: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryRating {
  category: string;
  rating: number;
}

export interface Industry {
  id: number;
  name: string;
  color?: string;
  textColor?: string;
}

export interface City {
  id: number;
  name: string;
  region: string;
  country: string;
}

export interface CompanyWithDetails {
  company: Company;
  category_ratings: CategoryRating[];
  industries: Industry[];
  city: City;
}

export interface CompanySizes {
  small: string;
  medium: string;
  large: string;
  enterprise: string;
}

export interface Pagination {
  limit: number;
  page: number;
  pages: number;
  total: number;
}

export interface CompaniesResponse {
  data: {
    companies: CompanyWithDetails[];
    company_sizes: CompanySizes;
    pagination: Pagination;
  };
  success: boolean;
}

export interface CompaniesFilter {
  search?: string;
  industries?: number[];
  size?: string;
  city_id?: number;
  sort_by?: 'rating' | 'reviews_count' | 'created_at' | 'name';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CompanyDetails extends Company {
  contacts: {
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  ratings: {
    workConditions: number;
    management: number;
    restConditions: number;
    salaryLevel: number;
    careerGrowth: number;
    team: number;
  };
  reviews: Review[];
  similarCompanies?: Company[];
}

export interface FilterParams {
  location?: string;
  industry?: string;
  companySize?: string;
} 