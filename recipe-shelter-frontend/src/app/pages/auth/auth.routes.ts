import { Routes } from '@angular/router';
import { guestGuard } from '../../core/guards/guest.guard';

export const authRoutes: Routes = [
    {
        path: 'sign-in',
        loadComponent: () => import('./sign-in/sign-in').then(m => m.SignIn),
        canActivate: [guestGuard],
        title: 'Se connecter'
    },
    {
        path: 'sign-up',
        loadComponent: () => import('./sign-up/sign-up').then(m => m.SignUp),
        canActivate: [guestGuard],
        title: 'Créer un compte'
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./forgot-password/forgot-password').then(m => m.ForgotPassword),
        canActivate: [guestGuard],
        title: 'Mot de passe oublié'
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./reset-password/reset-password').then((m) => m.ResetPassword),
        canActivate: [guestGuard],
        title: 'Réinitialiser le mot de passe'
    },
    {
        path: 'auth/validate-email',
        loadComponent: () => import('./validate-email/validate-email').then((m) => m.ValidateEmail),
        title: 'Validation de l\'email'
    },
    {
        path: 'auth/resend-validation-email',
        loadComponent: () => import('./resend-validation-email/resend-validation-email').then((m) => m.ResendValidationEmail),
        title: 'Renvoyer l\'email de vérification'
    }
];
