import { Routes } from '@angular/router';

export const legalRoutes: Routes = [
    {
        path: 'terms',
        loadComponent: () => import('./terms/terms').then(m => m.Terms),
        title: 'CGU'
    },
    {
        path: 'privacy',
        loadComponent: () => import('./privacy/privacy').then(m => m.Privacy),
        title: 'Confidentialité'
    },
    {
        path: 'mentions-legales',
        loadComponent: () => import('./mentions-legales/mentions-legales').then(m => m.MentionsLegales),
        title: 'Mentions légales'
    }
];