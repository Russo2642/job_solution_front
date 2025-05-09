import { httpClient } from './httpClient';
import { CitiesResponse } from './types';

export class CityApi {
    static async getCities(page = 1, limit = 100): Promise<CitiesResponse> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        return httpClient.get<CitiesResponse>(`/cities?${params.toString()}`);
    }
} 