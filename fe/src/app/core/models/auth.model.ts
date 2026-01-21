import { UserResponse } from './user.model';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    userName: string;
    email: string;
    password: string;
    phoneNumber: string;
    role: string;
    cccd?: string;
    imageUrl?: string;
    accountType?: string;
}

export interface AuthenticationResponse {
    token: string;
    user: UserResponse;
    userId: string;
    email: string;
    role: string;
}
