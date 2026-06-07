import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const favoriteRoutes: Routes = [
    {
        path: 'me/favorites',
        loadComponent: () => import('./favorite-list/favorite-list').then(m => m.FavoriteList),
        canActivate: [authGuard],
        title: 'Mes favoris'
    }
];
