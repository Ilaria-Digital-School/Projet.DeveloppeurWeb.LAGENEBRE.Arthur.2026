# Recipe Shelter

> Front-end Angular SSR pour Recipe Shelter, une application de partage,
> recherche, publication et modération de recettes.

Recipe Shelter est une application Angular organisée autour de composants
standalone, de routes lazy-loaded et d'un socle `core` pour les services,
l'authentification, les guards et les interceptors HTTP.

## Fonctionnalités

- Consultation des recettes publiques, récentes et les mieux notées
- Recherche de recettes avec pagination
- Détail d'une recette, commentaires et favoris
- Inscription, connexion, validation d'email et réinitialisation du mot de passe
- Profil utilisateur privé et profils publics par nom d'utilisateur
- Création, édition, soumission et archivage des recettes personnelles
- Espace favoris pour les utilisateurs connectés
- Formulaire de contact
- Espace d'administration pour les recettes, commentaires et utilisateurs
- Pages légales : conditions, confidentialité et mentions légales

## Stack

- Angular 21
- TypeScript 5.9
- Angular Router
- Angular Forms / Reactive Forms
- Signals Angular
- Angular SSR avec Express
- Bootstrap 5
- Bootstrap Icons
- ESLint, Stylelint, Husky et lint-staged

## Prérequis

- Node.js compatible avec Angular 21
- npm 11.6.0, version déclarée dans `package.json`
- API Recipe Shelter disponible en local ou en production

## Installation

```bash
npm install
```

## Configuration

Les URLs d'API sont configurées dans les fichiers d'environnement Angular :

```text
src/environments/environment.ts       -> http://localhost:3000/api/v1
src/environments/environment.prod.ts  -> https://api.recipe-shelter.fr/api/v1
```

Modifiez `apiBaseUrl` si votre backend tourne sur une autre adresse.

## Développement

```bash
npm start
```

L'application est servie par défaut sur `http://localhost:4200`.

## Scripts utiles

```bash
# Serveur de développement
npm start

# Build de production navigateur + serveur SSR
npm run build

# Build en mode watch
npm run watch

# Tests unitaires
npm run test

# Lint Angular / TypeScript / templates
npm run lint

# Lancer la build SSR générée
npm run serve:ssr:recipe-shelter
```

## Routes principales

### Public

- `/`
- `/search`
- `/recipes`
- `/recipes/search`
- `/recipes/:slug`
- `/users/:username`
- `/contact`
- `/about`

### Authentification

- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/reset-password`
- `/auth/validate-email`
- `/auth/resend-validation-email`

### Espace connecté

- `/profile`
- `/me/favorites`
- `/me/recipes/list`
- `/me/recipes/submit`
- `/me/recipes/submit/:id`

### Administration

- `/admin/dashboard`
- `/admin/recipes`
- `/admin/recipes/:id`
- `/admin/comments/moderated`
- `/admin/comments/soft-deleted`
- `/admin/users/banned`
- `/admin/users/:id`

### Légal

- `/terms`
- `/privacy`
- `/mentions-legales`

## Architecture

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

## Organisation du code

- Les composants sont standalone.
- Les domaines fonctionnels exposent leurs routes dans des fichiers `*.routes.ts`.
- `core` contient les services applicatifs, guards, interceptors, modèles et helpers.
- `shared` contient les composants réutilisables, layouts partagés, validators et styles communs.
- `layouts` contient l'habillage global de l'application.
- Le préfixe Angular du projet est `rs`.

## Authentification et API

Le front communique avec l'API définie par `environment.apiBaseUrl`.

Le socle d'authentification inclut :

- `AuthService` pour la connexion, l'inscription, le profil courant, la validation
  d'email et les parcours de mot de passe oublié
- `SessionService` pour la session JWT côté navigateur
- `authInterceptor` pour injecter le bearer token dans les requêtes HTTP
- `authGuard`, `guestGuard` et `adminGuard` pour protéger les pages

## Qualité

Le projet contient :

- une configuration ESLint pour TypeScript et les templates Angular
- une configuration Stylelint pour les feuilles CSS
- Husky et lint-staged pour les contrôles avant commit
- une suite de tests unitaires `*.spec.ts`
- un build SSR configuré via Angular et Express

## Conventions

- Fichiers : `kebab-case`
- Classes TypeScript : `PascalCase`
- Selectors Angular : `rs-*`
- Routes : `kebab-case`

Les conventions détaillées sont documentées dans
`RecipeShelterNamingConvention.md`.
