export interface UserResponse {
    id: string;
    email: string;
    name: string;
    phoneNumber: string;
    imageUrl?: string;
    role: string;
    userName: string;
    cccd?: string;
    accountType?: string;
}

export interface UserRequest {
    name: string;
    userName: string;
    phoneNumber: string;
    password: string;
    role: string;
    email?: string;
    cccd?: string;
    imageUrl?: string;
    accountType?: string;
}
