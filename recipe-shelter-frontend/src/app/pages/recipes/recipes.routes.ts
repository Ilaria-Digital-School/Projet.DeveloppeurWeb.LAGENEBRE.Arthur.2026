import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const recipesRoutes: Routes = [
    {
        path: 'recipes',
        loadComponent: () => import('./list/recipe-list').then(m => m.RecipeList),
        title: 'Recettes'
    },
    {
        path: 'recipes/search',
        loadComponent: () => import('../search/search').then(m => m.Search),
        title: 'Recherche'
    },
    {
        path: 'recipes/:slug',
        loadComponent: () => import('./detail/recipe-detail').then(m => m.RecipeDetail),
        title: 'Recette'
    },
    {
        path: 'me/recipes/submit',
        loadComponent: () => import('./recipe-form/recipe-form').then(m => m.RecipeForm),
        canActivate: [authGuard],
        title: 'Création de recette'
    },
    {
        path: 'me/recipes/submit/:id',
        loadComponent: () => import('./recipe-form/recipe-form').then(m => m.RecipeForm),
        canActivate: [authGuard],
        title: 'Création de recette'
    },
    {
        path: 'me/recipes/list',
        loadComponent: () => import('./my-recipes/my-recipes').then(m => m.MyRecipes),
        canActivate: [authGuard],
        title: 'Mes recettes'
    }
];
