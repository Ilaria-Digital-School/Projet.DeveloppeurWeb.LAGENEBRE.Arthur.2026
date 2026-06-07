import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

export const adminRoutes: Routes = [
    {
        path: 'admin/dashboard',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
        canActivate: [adminGuard],
        title: 'Tableau de bord'
    },
    {
        path: 'admin/recipes',
        loadComponent: () => import('./pending/pending').then(m => m.Pending),
        canActivate: [adminGuard],
        title: 'Recettes en attente'
    },
    {
        path: 'admin/recipes/:id',
        loadComponent: () => import('./review/review').then(m => m.Review),
        canActivate: [adminGuard],
        title: 'Révision de recette'
    },
    {
        path: 'admin/comments/moderated',
        loadComponent: () => import('./comments/comments-page/comments-page').then(m => m.CommentsPage),
        canActivate: [adminGuard],
        data: { commentsView: 'moderated' },
        title: 'Commentaires modérés'
    },
    {
        path: 'admin/comments/soft-deleted',
        loadComponent: () => import('./comments/comments-page/comments-page').then(m => m.CommentsPage),
        canActivate: [adminGuard],
        data: { commentsView: 'softDeleted' },
        title: 'Commentaires supprimés'
    },
    {
        path: 'admin/users/banned',
        loadComponent: () => import('./users/banned-users/banned-users').then(m => m.BannedUsers),
        canActivate: [adminGuard],
        title: 'Utilisateurs bannis'
    },
    {
        path: 'admin/users/:id',
        loadComponent: () => import('./users/user-detail/user-detail').then(m => m.UserDetail),
        canActivate: [adminGuard],
        title: 'Profil utilisateur'
    }
];
