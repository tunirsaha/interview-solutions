import { ApiResponse } from "./api-response.interface";

export interface Country {
    flag: string;
    name: string;
}

export interface CountryResponse extends ApiResponse {
    data: Country[];
}