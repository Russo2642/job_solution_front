import { ReviewFormData } from '../types';
import { httpClient } from './httpClient';
import { CompanyReviewsResponse, ReviewActionResponse, ReviewCreateResponse } from './types';

export class ReviewApi {
    static async createReview(reviewData: ReviewFormData): Promise<ReviewCreateResponse> {
        console.log('Подготовка данных для отправки отзыва:', reviewData);

        try {
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

            console.log('Данные для отправки на сервер:', apiRequest);

            const response = await httpClient.post<ReviewCreateResponse>('/reviews', apiRequest);

            console.log('Успешный ответ от сервера:', response);
            return response;
        } catch (error) {
            console.error('Ошибка при отправке отзыва:', error);
            throw error;
        }
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
} 