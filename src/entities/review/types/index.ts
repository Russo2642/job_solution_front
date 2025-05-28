import { City } from '../../company/types';

export interface Review {
  id: number;
  user_id: number;
  company_id: number;
  position: string;
  employment: string;
  employment_period: string;
  city: string;
  city_id: number;
  rating: number;
  pros: string;
  cons: string;
  status: string;
  moderation_comment?: {
    String: string;
    Valid: boolean;
  };
  useful_count: number;
  created_at: string;
  updated_at: string;
  approved_at?: {
    Time: string;
    Valid: boolean;
  };
  is_marked_as_useful?: boolean;
  date?: string;
  isFormerEmployee?: boolean;
  is_former_employee?: boolean;
  employmentTerm?: string;
  location?: string;
  benefits?: string[];
  is_recommended?: boolean;
}

export interface CategoryRating {
  category_id?: number;
  category: string;
  rating: number;
}

export interface Benefit {
  benefit_type_id?: number;
  benefit: string;
}

export interface EmploymentType {
  id: number;
  name: string;
  description: string;
}

export interface EmploymentPeriod {
  id: number;
  name: string;
  description: string;
}

export interface CompanyInfo {
  company: {
    id: number;
    name: string;
    slug: string;
    size: string;
    logo: string;
    website: string;
    email: string;
    phone: string;
    address: string;
    city_id: number;
    reviews_count: number;
    average_rating: number;
    created_at: string;
    updated_at: string;
  };
  category_ratings: CategoryRating[];
  industries: {
    id: number;
    name: string;
  }[];
  city: City;
}

export interface ReviewWithDetails {
  review: Review;
  category_ratings: CategoryRating[];
  benefits: Benefit[];
  city: City;
  is_marked_as_useful: boolean;
  employment_type?: EmploymentType;
  employment_period?: EmploymentPeriod;
  company?: CompanyInfo;
}

export interface ReviewFormData {
  company_id: number;
  position: string;
  city_id: number;
  pros: string;
  cons: string;
  
  is_former_employee: boolean;
  employment_period_id: number;
  employment_type_id: number;
  benefit_type_ids: number[];
  category_ratings: { [key: string]: number };
  is_recommended: boolean;
  
  employment_status?: string;
  employment_period?: string;
  salary?: number;
  is_salary_before_tax?: boolean;
  overall_rating?: number;
  category_ratings_array?: {
    category_id: number;
    rating: number;
  }[];
  salary_rating?: number;
  team_rating?: number;
  management_rating?: number;
  workplace_rating?: number;
  career_rating?: number;
  advice_to_management?: string;
  recommend_to_friend?: boolean;
  business_outlook?: boolean;
  proof_documents?: File[];
} 