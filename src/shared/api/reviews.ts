import { ReviewFormData } from '../types';
import { httpClient } from './httpClient';
import { CompanyReviewsResponse, ReviewActionResponse, ReviewCreateResponse } from './types';

export interface ModerationAction {
    moderation_comment: string;
    status: 'approved' | 'rejected';
}

export class ReviewApi {
    static async createReview(reviewData: ReviewFormData): Promise<ReviewCreateResponse> {
        const apiRequest = {
            benefit_type_ids: reviewData.benefit_type_ids || [],
            category_ratings: reviewData.category_ratings || {},
            city_id: reviewData.city_id,
            company_id: reviewData.company_id,
            cons: reviewData.cons,
            employment_period_id: reviewData.employment_period_id,
            employment_type_id: reviewData.employment_type_id,
            is_former_employee: reviewData.is_former_employee,
            position: reviewData.position,
            pros: reviewData.pros,
            is_recommended: reviewData.is_recommended
        };

        return httpClient.post<ReviewCreateResponse>('/reviews', apiRequest);
    }

    static async markAsUseful(reviewId: number): Promise<ReviewActionResponse> {
        return httpClient.post<ReviewActionResponse>(`/reviews/${reviewId}/useful`, {});
    }

    static async removeUsefulMark(reviewId: number): Promise<ReviewActionResponse> {
        return httpClient.delete<ReviewActionResponse>(`/reviews/${reviewId}/useful`);
    }

    static async getUserReviews(status: string = '', page = 1, limit = 10): Promise<CompanyReviewsResponse> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        if (status) {
            params.append('status', status);
        }

        return httpClient.get<CompanyReviewsResponse>(`/user/reviews?${params.toString()}`);
    }
    
    static async getPendingReviews(page = 1, limit = 10): Promise<CompanyReviewsResponse> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        return httpClient.get<CompanyReviewsResponse>(`/reviews/moderation/pending?${params.toString()}`);
    }
    
    static async approveReview(reviewId: number, data: ModerationAction): Promise<ReviewActionResponse> {
        return httpClient.put<ReviewActionResponse>(`/reviews/${reviewId}/approve`, data);
    }
    
    static async rejectReview(reviewId: number, data: ModerationAction): Promise<ReviewActionResponse> {
        return httpClient.put<ReviewActionResponse>(`/reviews/${reviewId}/reject`, data);
    }
} 