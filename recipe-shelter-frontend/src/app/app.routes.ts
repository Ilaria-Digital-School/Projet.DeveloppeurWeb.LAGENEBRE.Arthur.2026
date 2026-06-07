import { Routes } from '@angular/router';
import { Layout } from './layouts/layout/layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home').then(m => m.Home)
      },
      {
        path: 'search',
        loadComponent: () => import('./pages/search/search').then(m => m.Search),
        title: 'Recherche'
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact').then(m => m.Contact),
        title: 'Contact'
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about').then(m => m.About),
        title: 'À propos'
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
        canActivate: [authGuard],
        title: 'Mon profil'
      },
      {
        path: 'users/:username',
        loadComponent: () => import('./pages/users/profile/profile').then(m => m.Profile),
        title: 'Profil utilisateur'
      },
      {
        path: '',
        loadChildren: () => import('./pages/auth/auth.routes').then(m => m.authRoutes)
      },
      {
        path: '',
        loadChildren: () => import('./pages/recipes/recipes.routes').then(m => m.recipesRoutes)
      },
      {
        path: '',
        loadChildren: () => import('./pages/favorite/favorite.routes').then(m => m.favoriteRoutes)
      },
      {
        path: '',
        loadChildren: () => import('./pages/legal/legal.routes').then(m => m.legalRoutes)
      },
      {
        path: '',
        loadChildren: () => import('./pages/admin/admin.routes').then(m => m.adminRoutes)
      }
    ],
  },
  { path: '**', redirectTo: '' }
];
