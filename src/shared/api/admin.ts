import { ApiClient, API_BASE_URL } from './index';

export interface AdminStatistics {
  users_count: number;
  companies_count: number;
  reviews_count: number;
  pending_reviews: number;
  approved_reviews: number;
  rejected_reviews: number;
  cities_count: number;
  industries_count: number;
  benefit_types_count: number;
  rating_categories_count: number;
  employment_types_count: number;
  employment_periods_count: number;
}

export interface AdminUser {
  id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AdminCompany {
  id: number;
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  city_id: number;
  industries: number[];
  created_at: string;
  updated_at: string;
}

export interface AdminReview {
  id: number;
  user_id: number;
  company_id: number;
  position: string;
  employment_type_id: number;
  employment_period_id: number;
  city_id: number;
  rating: number;
  pros: string;
  cons: string;
  is_former_employee: boolean;
  is_recommended: boolean;
  status: string;
  moderation_comment: {
    String: string;
    Valid: boolean;
  };
  useful_count: number;
  created_at: string;
  updated_at: string;
  approved_at: {
    Time: string;
    Valid: boolean;
  };
}

export interface CategoryRating {
  category_id: number;
  category: string;
  rating: number;
}

export interface Benefit {
  benefit_type_id: number;
  benefit: string;
}

export interface AdminReviewDetail {
  review: AdminReview;
  category_ratings?: CategoryRating[];
  benefits?: Benefit[];
  company: {
    company: AdminCompany;
    category_ratings?: any;
    industries: {
      id: number;
      name: string;
      color: string;
    }[];
    city: {
      id: number;
      name: string;
      region: string;
      country: string;
    };
  };
  city: {
    id: number;
    name: string;
    region: string;
    country: string;
  };
  employment_type: {
    id: number;
    name: string;
    description: string;
  };
  employment_period: {
    id: number;
    name: string;
    description: string;
  };
  is_marked_as_useful: boolean;
}

export interface AdminReviewsResponse {
  pagination: {
    limit: number;
    page: number;
    pages: number;
    total: number;
  };
  reviews: AdminReviewDetail[];
}

export interface AdminCreateCompanyRequest {
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  city_id: number;
  industries: number[];
}

export interface UpdateCompanyRequest extends AdminCreateCompanyRequest {}

export interface AdminUsersResponse {
  pagination: {
    limit: number;
    page: number;
    pages: number;
    total: number;
  };
  users: AdminUser[];
}

export interface AdminCompaniesResponse {
  pagination: {
    limit: number;
    page: number;
    pages: number;
    total: number;
  };
  companies: {
    company: AdminCompany;
    industries?: { id: number; name: string; color: string }[];
  }[];
}

export interface AdminUserResponse {
  data: AdminUser;
  success: boolean;
}

export interface AdminCompanyResponse {
  data: {
    company: AdminCompany;
    industries: { id: number; name: string; color: string }[];
    city: { id: number; name: string; region: string; country: string };
  };
  success: boolean;
}

export interface AdminStatisticsResponse {
  data: AdminStatistics;
  success: boolean;
}

export interface AdminUsersListResponse {
  data: AdminUsersResponse;
  success: boolean;
}

export interface AdminCompaniesListResponse {
  data: AdminCompaniesResponse;
  success: boolean;
}

export interface AdminReviewsListResponse {
  data: AdminReviewsResponse;
  success: boolean;
}

export interface ModerationAction {
  moderation_comment: string;
  status: string;
}

export interface UpdateUserRoleRequest {
  role: 'user' | 'moderator' | 'admin';
}

export const AdminApi = {
  getStatistics: async (): Promise<AdminStatisticsResponse> => {
    return ApiClient.request<AdminStatisticsResponse>(`${API_BASE_URL}/admin/statistics`);
  },

  getUsers: async (page: number, limit: number): Promise<AdminUsersListResponse> => {
    return ApiClient.request<AdminUsersListResponse>(`${API_BASE_URL}/admin/users?page=${page}&limit=${limit}`);
  },

  getUser: async (id: number): Promise<AdminUserResponse> => {
    return ApiClient.request<AdminUserResponse>(`${API_BASE_URL}/admin/users/${id}`);
  },

  deleteUser: async (id: number): Promise<{ success: boolean }> => {
    return ApiClient.request<{ success: boolean }>(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  updateUserRole: async (id: number, data: UpdateUserRoleRequest): Promise<AdminUserResponse> => {
    return ApiClient.request<AdminUserResponse>(`${API_BASE_URL}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  getCompanies: async (page: number, limit: number): Promise<AdminCompaniesListResponse> => {
    return ApiClient.request<AdminCompaniesListResponse>(`${API_BASE_URL}/companies?page=${page}&limit=${limit}`);
  },

  getCompany: async (id: number): Promise<AdminCompanyResponse> => {
    return ApiClient.request<AdminCompanyResponse>(`${API_BASE_URL}/companies/${id}`);
  },

  createCompany: async (data: AdminCreateCompanyRequest): Promise<AdminCompanyResponse> => {
    return ApiClient.request<AdminCompanyResponse>(`${API_BASE_URL}/admin/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  updateCompany: async (id: number, data: UpdateCompanyRequest): Promise<AdminCompanyResponse> => {
    return ApiClient.request<AdminCompanyResponse>(`${API_BASE_URL}/admin/companies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  deleteCompany: async (id: number): Promise<{ success: boolean }> => {
    return ApiClient.request<{ success: boolean }>(`${API_BASE_URL}/admin/companies/${id}`, {
      method: 'DELETE',
    });
  },

  getPendingReviews: async (page: number, limit: number): Promise<AdminReviewsListResponse> => {
    return ApiClient.request<AdminReviewsListResponse>(`${API_BASE_URL}/admin/reviews/moderation/pending?page=${page}&limit=${limit}`);
  },

  getApprovedReviews: async (page: number, limit: number): Promise<AdminReviewsListResponse> => {
    return ApiClient.request<AdminReviewsListResponse>(`${API_BASE_URL}/admin/reviews/moderation/approved?page=${page}&limit=${limit}`);
  },

  getRejectedReviews: async (page: number, limit: number): Promise<AdminReviewsListResponse> => {
    return ApiClient.request<AdminReviewsListResponse>(`${API_BASE_URL}/admin/reviews/moderation/rejected?page=${page}&limit=${limit}`);
  },

  approveReview: async (id: number, data: ModerationAction): Promise<{ success: boolean }> => {
    return ApiClient.request<{ success: boolean }>(`${API_BASE_URL}/admin/reviews/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  rejectReview: async (id: number, data: ModerationAction): Promise<{ success: boolean }> => {
    return ApiClient.request<{ success: boolean }>(`${API_BASE_URL}/admin/reviews/${id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }
}; 