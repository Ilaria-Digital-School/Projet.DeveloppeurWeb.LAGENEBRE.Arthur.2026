import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthSuccessResponse, ForgotPasswordResponse, LoginRequest, MeResponse, RegisterRequest, RegisterResponse, ResendValidationEmailResponse, ValidateEmailResponse } from '../models/auth.model';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiBaseUrl;

    login(payload: LoginRequest): Observable<AuthSuccessResponse> {
        return this.http.post<AuthSuccessResponse>(`${this.baseUrl}/auth/login`, payload);
    }

    logout(): Observable<{ message?: string }> {
        return this.http.post<{ message?: string }>(`${this.baseUrl}/auth/logout`, {});
    }

    register(payload: RegisterRequest): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, payload);
    }

    me(): Observable<MeResponse> {
        return this.http.get<MeResponse>(`${this.baseUrl}/auth/me`);
    }

    forgotPassword(mail: string): Observable<ForgotPasswordResponse> {
        return this.http.post<ForgotPasswordResponse>(`${this.baseUrl}/auth/forgot-password`, { mail });
    }

    resetPassword(token: string, password: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/auth/reset-password`, { token, password } );
    }

    validateEmail(token: string): Observable<ValidateEmailResponse> {
        return this.http.post<ValidateEmailResponse>(`${this.baseUrl}/auth/validate-email`, { token });
    }

    resendValidationEmail(mail: string): Observable<ResendValidationEmailResponse> {
        return this.http.post<ResendValidationEmailResponse>(`${this.baseUrl}/auth/resend-validation-email`, { mail });
    }
}
