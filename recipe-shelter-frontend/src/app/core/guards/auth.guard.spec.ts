import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  it('should redirect unauthenticated users to sign in with redirectTo', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: AuthService, useValue: { me: () => throwError(() => ({ status: 401 })) } },
        { provide: SessionService, useValue: { clear: vi.fn(), setAuthUser: vi.fn() } }
      ]
    });

    const result = await new Promise<unknown>((resolve) => {
      const guardResult = TestBed.runInInjectionContext(() => authGuard({} as never, { url: '/profile' } as RouterStateSnapshot));
      (guardResult as { subscribe: (next: (value: unknown) => void) => void }).subscribe(resolve);
    });

    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/sign-in?redirectTo=%2Fprofile');
  });
});
