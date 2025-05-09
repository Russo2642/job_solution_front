import { httpClient } from './httpClient';
import { IndustriesResponse } from './types';

export class IndustryApi {
    static async getIndustries(page = 1, limit = 100): Promise<IndustriesResponse> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        return httpClient.get<IndustriesResponse>(`/industries?${params.toString()}`);
    }
} 