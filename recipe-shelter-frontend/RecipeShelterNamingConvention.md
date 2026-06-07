# Recipe Shelter - Convention de nommage

> Référence de nommage et de structure pour le projet Recipe Shelter.

Ce document décrit les conventions actuellement appliquées dans le codebase. Il
sert de base pour ajouter ou modifier des pages, composants, services, modèles et
routes sans casser la cohérence du projet.

## Préfixe global

Le préfixe Angular du projet est :

```text
rs
```

Tous les selectors de composants applicatifs doivent commencer par `rs-`.

Exemples :

```html
<rs-header></rs-header>
<rs-auth-shell></rs-auth-shell>
<rs-recipe-card></rs-recipe-card>
```

## Règles générales

| Élément | Convention |
| ------- | ---------- |
| Fichiers et dossiers | `kebab-case` |
| Classes TypeScript | `PascalCase` |
| Interfaces et types exportés | `PascalCase` |
| Selectors Angular | `rs-*` en `kebab-case` |
| Routes | `kebab-case` |
| Services | suffixe `Service` |
| Guards | suffixe `Guard` ou fichier `*.guard.ts` |
| Interceptors | suffixe `Interceptor` ou fichier `*.interceptor.ts` |
| Tests unitaires | fichier `*.spec.ts` à côté du code testé |

## Structure du projet

```text
src/app/
  core/
    guards/
    interceptors/
    models/
    services/
    utils/
  layouts/
    footer/
    header/
    layout/
  pages/
    admin/
    about/
    auth/
    contact/
    favorite/
    home/
    legal/
    profile/
    recipes/
    search/
    users/
  shared/
    article/
    auth-shell/
    category-icon/
    components/
    layouts/
    recipe-card/
    styles/
    validators/
```

## Rôle des dossiers

### `core`

Contient les éléments transverses de l'application :

- guards d'accès
- interceptors HTTP
- modèles et types partagés
- services applicatifs
- helpers et utilitaires

Exemples :

- `AuthService`
- `SessionService`
- `RecipesService`
- `AdminRecipesService`
- `auth.guard.ts`
- `auth.interceptor.ts`
- `recipe-status.ts`

### `layouts`

Contient les composants de structure globale :

- `Header`
- `Footer`
- `Layout`

### `pages`

Contient les pages routées de l'application, organisées par domaine fonctionnel.

Exemples :

- `pages/auth`
- `pages/recipes`
- `pages/favorite`
- `pages/admin`
- `pages/users`
- `pages/legal`

Chaque dossier de page peut contenir :

- le composant de page
- ses fichiers `.html`, `.css` et `.spec.ts`
- un fichier `*.routes.ts` quand plusieurs routes sont regroupées
- des sous-composants locaux quand ils ne sont pas réutilisables ailleurs

### `shared`

Contient les composants, layouts, styles et validators réutilisables.

Exemples :

- `recipe-card`
- `auth-shell`
- `category-icon`
- `components/pagination-controls`
- `layouts/recipe-list-shell`
- `styles/components`
- `validators`

## Conventions de composants

### Selectors

Format préféré :

```text
rs-<feature>-<role>
```

Le selector doit rester descriptif, stable et aligné avec le nom du dossier.

Exemples :

- `rs-header`
- `rs-footer`
- `rs-auth-shell`
- `rs-recipe-list`
- `rs-recipe-form`
- `rs-recipe-card`
- `rs-pagination-controls`
- `rs-admin-comments-list`

### Noms de classes

Le codebase utilise deux formes légitimes :

- nom court pour les pages et layouts simples : `Home`, `About`, `Profile`,
  `Header`
- nom explicite pour les composants de domaine ou partagés : `RecipeList`,
  `RecipeForm`, `RecipeCard`, `PaginationControls`

Règle pratique :

- conserver les noms déjà présents pour éviter les refactors inutiles
- choisir un nom explicite dès qu'un dossier ou un contexte peut devenir ambigu
- utiliser un suffixe comme `Component` seulement si cela améliore la clarté ou
  si le composant existant suit déjà cette convention

### Fichiers d'un composant

Les fichiers restent dans le dossier du composant et reprennent son nom en
`kebab-case`.

Exemple :

```text
recipe-card/
  recipe-card.ts
  recipe-card.html
  recipe-card.css
  recipe-card.spec.ts
```

## Services et accès aux données

Les services Angular sont placés dans `core/services`.

Exemples :

- `AuthService`
- `UserService`
- `RecipesService`
- `FavoritesService`
- `AdminDashboardService`
- `AdminCommentsService`

Convention :

- un service porte le suffixe `Service`
- un service HTTP centralise les appels API liés à son domaine
- les URLs d'API utilisent `environment.apiBaseUrl`
- les conversions entre formulaire, API et modèle restent proches du service ou
  du composant responsable du domaine

Si le projet grossit fortement, une évolution vers des dossiers par domaine peut
être envisagée, mais ce n'est pas la structure actuelle.

## Modèles et types

Les types partagés sont placés dans `core/models`.

Exemples :

- `LoginRequest`
- `RegisterRequest`
- `AuthSuccessResponse`
- `ApiErrorResponse`
- `PublicRecipeDetail`
- `PaginatedResponse`

Convention :

- types et interfaces en `PascalCase`
- noms orientés métier ou contrat API
- suffixes utiles quand ils clarifient le rôle : `Request`, `Response`,
  `Payload`, `Params`

## Routes

Les routes sont en `kebab-case` et regroupées par domaine dans des fichiers
`*.routes.ts`.

Exemples de fichiers :

- `auth.routes.ts`
- `recipes.routes.ts`
- `favorite.routes.ts`
- `legal.routes.ts`
- `admin.routes.ts`

Exemples de routes :

```text
/
/search
/recipes
/recipes/search
/recipes/:slug
/users/:username
/sign-in
/auth/validate-email
/me/favorites
/me/recipes/list
/me/recipes/submit
/admin/dashboard
/admin/comments/soft-deleted
/mentions-legales
```

Convention :

- routes publiques : nom métier direct (`/recipes`, `/contact`)
- routes utilisateur connecté : préfixe `/me/...`
- routes d'administration : préfixe `/admin/...`
- segments dynamiques explicites : `:slug`, `:id`, `:username`

## CSS et design system

Le projet utilise le préfixe `rs-` pour les classes CSS applicatives.

Exemples :

```css
.rs-btn {}
.rs-main {}
.rs-auth-card {}
.rs-footer-link {}
```

Les styles partagés sont rangés dans :

```text
shared/styles/
```

Convention :

- classes applicatives en `rs-*`
- styles propres au composant dans son fichier `.css`
- styles réutilisables dans `shared/styles`
- pas de styles globaux pour un besoin strictement local

## Règle de cohérence

Avant d'ajouter une nouvelle fonctionnalité, vérifier qu'elle suit la structure
actuelle du repo :

- `core` pour le transverse
- `layouts` pour la structure globale
- `pages` pour les vues routées
- `shared` pour le réutilisable

Si la convention évolue, mettre à jour ce document et le README dans la même
modification.
