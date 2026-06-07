export const ROLE_IDS = {
    ADMIN: 1,
    USER: 2,
} as const;

export interface LoginRequest {
    mail: string;
    password: string;
}

export interface RegisterRequest {
    mail: string;
    username: string;
    password: string;
}

export type UserStatus = 'inactive' | 'active' | 'banned';

export interface AuthUser {
    userId: number;
    username: string;
    roleId: number;
    status?: UserStatus;
}

export interface AuthSuccessResponse {
    user?: User;
    message?: string;
}

export interface RegisterResponse {
    user?: User;
    message?: string;
}

export interface MeResponse {
    auth: AuthUser;
}

export interface User {
    id: number;
    mail: string;
    username: string;
    roleId: number;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}

export interface ApiErrorResponse {
    error: {
        message: string;
        code: string;
    };
}

export interface ForgotPasswordResponse {
    ok: boolean;
    message: string;
}

export interface ValidateEmailResponse {
    ok: boolean;
    message?: string;
}

export interface ResendValidationEmailResponse {
    ok: boolean;
    message?: string;
}
