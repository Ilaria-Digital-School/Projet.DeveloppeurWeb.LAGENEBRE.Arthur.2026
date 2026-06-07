import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SessionService } from '../services/session.service';
import { PRESERVE_SESSION_ON_UNAUTHORIZED } from './auth.context';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const session = inject(SessionService);

    if (!isApiRequest(req.url))
        return next(req);

    return next(
        req.clone({
            credentials: 'include',
        })
    ).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401 && !req.context.get(PRESERVE_SESSION_ON_UNAUTHORIZED))
                session.clear();

            return throwError(() => error);
        })
    );
};

function isApiRequest(url: string): boolean {
    return url.startsWith(environment.apiBaseUrl) || url.startsWith('/api/');
}
