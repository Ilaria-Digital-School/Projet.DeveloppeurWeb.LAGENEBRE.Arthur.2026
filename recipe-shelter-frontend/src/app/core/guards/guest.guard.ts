import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';

export const guestGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (isPlatformServer(platformId))
    return true;

  if (sessionService.isAuthenticated())
    return router.createUrlTree(['/']);

  return inject(AuthService).me().pipe(
    map(({ auth }) => {
      sessionService.setAuthUser(auth);
      return router.createUrlTree(['/']);
    }),
    catchError(() => {
      sessionService.clear();
      return of(true);
    })
  );
};
