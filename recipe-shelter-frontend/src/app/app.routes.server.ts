import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'profile',
    renderMode: RenderMode.Client
  },
  {
    path: 'me/recipes/submit',
    renderMode: RenderMode.Client
  },
  {
    path: 'me/recipes/submit/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'me/recipes/list',
    renderMode: RenderMode.Client
  },
  {
    path: 'me/favorites',
    renderMode: RenderMode.Client
  },
  {
    path: 'users/:username',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/recipes',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/recipes/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/comments/moderated',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/comments/soft-deleted',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/users/banned',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin/users/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'auth/validate-email',
    renderMode: RenderMode.Client
  },
  {
    path: 'auth/resend-validation-email',
    renderMode: RenderMode.Client
  },
  {
    path: 'recipes/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
