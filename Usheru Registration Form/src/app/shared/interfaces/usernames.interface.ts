import { ApiResponse } from "./api-response.interface";

export interface UserName {
    id: number;
    username: string;
}

export class UserNameNotFound {
    id: number;
    username: string;
    constructor() {
        this.id = 0;
        this.username = ''
    }
}

export interface UserNameResponse extends ApiResponse {
    data: UserName[];
}