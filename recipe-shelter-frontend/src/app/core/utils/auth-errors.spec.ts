import { getApiErrorCode, getApiErrorMessage, isAuthStatusErrorCode } from './auth-errors';

describe('auth-errors utils', () => {
  it('should read and translate common API auth errors', () => {
    expect(getApiErrorCode({ error: { error: { code: 'USER_BANNED' } } })).toBe('USER_BANNED');
    expect(isAuthStatusErrorCode('USER_BANNED')).toBe(true);
    expect(getApiErrorMessage({ error: { message: 'Invalid credentials' } })).toBe('Email ou mot de passe incorrect.');
  });
});
