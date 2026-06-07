import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  it('should redirect authenticated non-admin users home', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: AuthService, useValue: { me: () => of({ auth: { userId: 2, username: 'jane', roleId: 2, status: 'active' } }) } },
        { provide: SessionService, useValue: { setAuthUser: vi.fn(), clear: vi.fn() } }
      ]
    });

    const result = await new Promise<unknown>((resolve) => {
      const guardResult = TestBed.runInInjectionContext(() => adminGuard({} as never, { url: '/admin/dashboard' } as RouterStateSnapshot));
      (guardResult as { subscribe: (next: (value: unknown) => void) => void }).subscribe(resolve);
    });

    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/');
  });
});
