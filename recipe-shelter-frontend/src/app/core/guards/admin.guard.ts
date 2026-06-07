import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { getApiErrorCode, isAuthStatusErrorCode } from '../utils/auth-errors';
import { ROLE_IDS } from '../models/auth.model';

export const adminGuard: CanActivateFn = (_route, state) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (isPlatformServer(platformId))
    return true;

  return authService.me().pipe(
    map(({ auth }) => {
      sessionService.setAuthUser(auth);

      return auth.roleId === ROLE_IDS.ADMIN ? true : router.createUrlTree(['/']);
    }),
    catchError((error) => {
      const code = getApiErrorCode(error);
      const queryParams = isAuthStatusErrorCode(code) ? { status: code, redirectTo: state.url } : { redirectTo: state.url };

      sessionService.clear();
      return of(router.createUrlTree(['/sign-in'], { queryParams }));
    })
  );
};
