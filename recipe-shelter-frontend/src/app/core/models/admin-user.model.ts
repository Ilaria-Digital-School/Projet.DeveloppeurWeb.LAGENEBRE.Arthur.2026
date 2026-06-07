export type AdminUserStatus = 'inactive' | 'active' | 'banned';

export interface AdminBannedUser {
    id: number;
    username: string;
    mail: string;
    status: AdminUserStatus;
    bannedAt: Date | null;
    bannedReason: string | null;
    bannedByUsername: string | null;
}

export interface AdminUserModerationLog {
    id: number;
    adminId: number;
    adminUsername?: string | null;
    action: 'ban' | 'unban';
    reason: string;
    createdAt: string;
}

export interface AdminUser {
    id: number;
    username: string;
    email: string;
    status: AdminUserStatus;
    createdAt: string;
    updatedAt: string;
    banReason: string | null;
    bannedAt: Date | null;
    bannedByUserId: number | null;
    moderationLogs: AdminUserModerationLog[];
}

export interface AdminUserModerationPayload {
    reason: string;
}
