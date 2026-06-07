import { Injectable, computed, signal } from '@angular/core';
import { ROLE_IDS, type AuthUser, type UserStatus } from '../models/auth.model';

export interface SessionUser {
    id: number;
    username: string;
    roleId?: number;
    role?: string;
    status?: UserStatus;
}

@Injectable({
    providedIn: 'root',
})
export class SessionService {
    private readonly _user = signal<SessionUser | null>(null);

    readonly user = computed(() => this._user());
    readonly isAuthenticated = computed(() => !!this._user());
    readonly isAdmin = computed(() => {
        const user = this._user();

        return this.isAuthenticated() && user?.roleId === ROLE_IDS.ADMIN;
    });

    setUser(user: SessionUser): void {
        this._user.set(user);
    }

    setAuthUser(auth: AuthUser): void {
        this.setUser({
            id: auth.userId,
            username: auth.username,
            roleId: auth.roleId,
            status: auth.status,
        });
    }

    updateUser(user: Partial<SessionUser>): void {
        const currentUser = this._user();

        if (!currentUser)
            return;

        this._user.set({
            ...currentUser,
            ...user,
        });
    }

    logout(): void {
        this.clear();
    }

    clear(): void {
        this._user.set(null);
    }
}
