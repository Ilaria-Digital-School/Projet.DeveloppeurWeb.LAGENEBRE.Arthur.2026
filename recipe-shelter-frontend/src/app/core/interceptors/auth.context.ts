import { HttpContextToken } from '@angular/common/http';

export const PRESERVE_SESSION_ON_UNAUTHORIZED = new HttpContextToken<boolean>(() => false);
