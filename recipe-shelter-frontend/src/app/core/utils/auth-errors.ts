type ErrorRecord = Record<string, unknown>;

export type AuthStatusErrorCode = 'EMAIL_NOT_VALIDATED' | 'USER_BANNED';

const API_ERROR_MESSAGES_BY_CODE: Partial<Record<string, string>> = {
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect.',
    EMAIL_NOT_VALIDATED: `Votre compte n'est pas encore activé.`,
    USER_BANNED: `Votre compte a été suspendu.`,
};

const API_ERROR_MESSAGES_BY_TEXT: Partial<Record<string, string>> = {
    'invalid credentials': 'Email ou mot de passe incorrect.',
};

function asRecord(value: unknown): ErrorRecord | null {
    return typeof value === 'object' && value !== null ? value as ErrorRecord : null;
}

function getApiErrorPayload(error: unknown): ErrorRecord | null {
    const root = asRecord(error);
    const body = asRecord(root?.['error']) ?? root;
    const nested = asRecord(body?.['error']);

    return nested ?? body;
}

export function getApiErrorCode(error: unknown): string | null {
    const payload = getApiErrorPayload(error);
    const code = payload?.['code'];

    return typeof code === 'string' ? code : null;
}

export function getApiErrorMessage(error: unknown): string | null {
    const payload = getApiErrorPayload(error);
    const code = payload?.['code'];

    if (typeof code === 'string' && API_ERROR_MESSAGES_BY_CODE[code])
        return API_ERROR_MESSAGES_BY_CODE[code];

    const message = payload?.['message'];

    if (typeof message !== 'string')
        return null;

    return API_ERROR_MESSAGES_BY_TEXT[message.trim().toLowerCase()] ?? message;
}

export function isAuthStatusErrorCode(code: string | null): code is AuthStatusErrorCode {
    return code === 'EMAIL_NOT_VALIDATED' || code === 'USER_BANNED';
}

export function getAuthStatusMessage(code: AuthStatusErrorCode): string {
    return API_ERROR_MESSAGES_BY_CODE[code] ?? `Une erreur est survenue lors de l'authentification.`;
}
