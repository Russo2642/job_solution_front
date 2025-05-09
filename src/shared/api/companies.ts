import { httpClient } from './httpClient';
import { 
    CompaniesFilter, 
    CompaniesResponse, 
    CompanyDetailsResponse, 
    CompanyReviewsResponse 
} from './types';

export class CompanyApi {
    static async getCompanies(filters?: CompaniesFilter): Promise<CompaniesResponse> {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            sort_by = 'rating', 
            sort_order = 'desc',
            industryIds = [],
            cityIds = [],
            minRating,
            maxRating
        } = filters || {};

        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        params.append('sort_by', sort_by);
        params.append('sort_order', sort_order);
        
        if (search) params.append('search', search);
        if (minRating !== undefined) params.append('min_rating', minRating.toString());
        if (maxRating !== undefined) params.append('max_rating', maxRating.toString());
        
        industryIds.forEach(id => params.append('industry_ids[]', id.toString()));
        cityIds.forEach(id => params.append('city_ids[]', id.toString()));

        return httpClient.get<CompaniesResponse>(`/companies?${params.toString()}`);
    }

    static async getCompanyDetails(slug: string): Promise<CompanyDetailsResponse> {
        return httpClient.get<CompanyDetailsResponse>(`/companies/${slug}`);
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

        return httpClient.get<CompanyReviewsResponse>(`/companies/${companyId}/reviews?${params.toString()}`);
    }
} 