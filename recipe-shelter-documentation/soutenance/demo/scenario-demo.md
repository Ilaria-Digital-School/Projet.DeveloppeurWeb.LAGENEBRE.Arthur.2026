# Scénario de démonstration

Base de scénario pour une démonstration locale de **Recipe Shelter**.

> Pré-requis : frontend lancé sur `http://localhost:4200`, backend lancé sur `http://localhost:3000`, base de données de démonstration chargée. Sinon le site déployé sur internet avec la base de données de démonstration chargée.
>
> Mot de passe commun des comptes de test : `Password123!`

| Ordre de démonstration | Compte utilisé | Page à ouvrir | Fonctionnalité montrée | Résultat attendu | Plan B si une étape échoue |
| --- | --- | --- | --- | --- | --- |
| 1 - Compte inactif | `paul.bernard@gmail.com` | `/sign-in` | Tentative de connexion avec un compte non validé. **Insister sur le contrôle d'accès par statut** : selon le statut du compte, l'API renvoie un code d'erreur différent et l'interface affiche un message adapté. Un compte **inactif** est refusé avec le message « Votre compte n'est pas encore activé. » et un lien **« Renvoyer le lien d'activation »** apparaît. Annoncer dès maintenant que le compte **banni** (étape 2) sera lui aussi refusé, mais avec un **message différent**. | La connexion est refusée. Le message indique que le compte doit être validé avant accès, et le lien de renvoi de l'e-mail d'activation est proposé. | Si le message n'apparaît pas clairement, expliquer le statut du compte depuis `soutenance/demo/comptes-test.md` et passer directement au compte banni. |
| 2 - Compte banni | `spammer42@outlook.com` | `/sign-in` | Tentative de connexion avec un compte suspendu, pour **montrer le contraste avec l'étape 1**. | La connexion est refusée avec un message **distinct de celui du compte inactif** : « Votre compte a été suspendu. ». Contrairement au compte inactif, **aucun lien de réactivation n'est proposé aujourd'hui** : un compte banni reste bloqué et ne peut pas accéder aux pages protégées. **Évolution prévue** : ajouter un lien spécifique **« Demander un déban »**, sur le modèle du lien « Renvoyer le lien d'activation » déjà présent pour les comptes inactifs — la table `UserModerationLogs` historise d'ailleurs déjà les actions `ban` / `unban`, ce qui rend ce parcours réaliste. | Si la session précédente interfère, vider la session ou utiliser une fenêtre privée, puis relancer la tentative. Si besoin, montrer côté code la différence de codes d'erreur (`EMAIL_NOT_VALIDATED` vs `USER_BANNED`). |
| 3 - Login utilisateur | `sophie.leclerc@yahoo.fr` | `/sign-in` | Connexion d'un utilisateur actif. | L'utilisateur est connecté, le menu compte apparaît dans l'en-tête et les pages protégées deviennent accessibles. | Vérifier que le backend et la base de démo sont lancés. Si besoin, montrer la capture `soutenance/frontend/Screenshots/10-login.png`, puis reprendre avec une session déjà ouverte. |
| 4 - Recherche recette | `sophie.leclerc@yahoo.fr` | `/search` | Recherche par texte avec le terme **« chocolat »**, filtré par catégorie **Boissons**. | Les critères sont appliqués, l'URL reçoit les query params (`?q=chocolat&category=boissons`) et la liste affiche uniquement les recettes publiées correspondantes (dont *Le vrai chocolat chaud maison*). | Retirer le filtre catégorie et chercher uniquement « chocolat ». Si la recherche échoue, ouvrir `/recipes` pour montrer la liste publique. |
| 5 - Favoris | `sophie.leclerc@yahoo.fr` | `/recipes` puis `/me/favorites` | Ajout d'une recette aux favoris depuis une carte recette, puis consultation de la liste des favoris. | L'icône de favori change d'état et la recette ajoutée apparaît dans `Mes favoris`. | Si la recette est déjà favorite, la retirer puis la rajouter. Si l'ajout échoue, ouvrir `/me/favorites` pour montrer les favoris déjà présents en base. |
| 6 - Création recette | `sophie.leclerc@yahoo.fr` | `/me/recipes/submit` | Création d'une recette à partir d'un **brouillon pré-rempli à 90%** (titre, ingrédients, étapes déjà saisis avant la soutenance) et enregistrement en brouillon. | Le message `Brouillon enregistré.` apparaît, la recette obtient un identifiant et elle est retrouvable dans `/me/recipes/list` avec le statut brouillon. | Utiliser directement le brouillon existant depuis `/me/recipes/list` et cliquer sur `Modifier`. |
| 7 - Soumission recette | `sophie.leclerc@yahoo.fr` | `/me/recipes/submit/:id` | Checklist de publication et soumission d'une recette à la modération. | La recette passe au statut `En attente`, l'utilisateur est redirigé vers `/me/recipes/list` et la recette n'est pas encore publiée publiquement. | Si la checklist bloque, utiliser un brouillon complet déjà préparé. Sinon, montrer les messages de validation qui expliquent les champs requis. |
| 8 - SSR Angular | — | N'importe quelle page (ex : `/recipes/le-vrai-chocolat-chaud-maison`) | Clic droit → **Afficher la source de la page** dans le navigateur. Montrer que le HTML livré au navigateur contient déjà le contenu de la recette (titre, ingrédients) — preuve que le rendu est effectué côté serveur avant l'hydratation Angular. | Le code source contient le contenu textuel de la page, contrairement à une SPA classique qui ne livrerait qu'un `<app-root></app-root>` vide. | Si le jury ne voit pas clairement la différence, ouvrir l'onglet Network de DevTools et montrer la réponse HTML initiale du serveur qui contient déjà le contenu. |
| 9 - Login admin | `admin_demo@recipe-shelter.fr` | `/sign-in` puis `/admin/dashboard` | Connexion administrateur et accès au tableau de bord protégé. | Le tableau de bord admin affiche l'état serveur, les compteurs de recettes en attente, commentaires modérés, commentaires supprimés et utilisateurs suspendus. | Si une session utilisateur est encore active, se déconnecter ou utiliser une fenêtre privée. Si l'accès admin est refusé, vérifier que le compte utilisé est bien `admin_demo@recipe-shelter.fr`. |
| 10 - Validation recette | `admin_demo@recipe-shelter.fr` | `/admin/recipes` puis `/admin/recipes/:id` | Review de la recette soumise à l'étape 7 et approbation par l'administrateur. | La recette disparaît de la liste des recettes en attente, passe au statut publié et devient visible côté public. | Si la recette créée pendant la démo n'apparaît pas, utiliser une recette déjà en attente. En cas d'erreur d'approbation, montrer la fiche de review et les actions disponibles : approuver, refuser, archiver, supprimer. |
| 11 - Modération commentaire | `admin_demo@recipe-shelter.fr` | `/admin/comments/moderated` ou `/admin/comments/soft-deleted` | Gestion des commentaires modérés ou supprimés : annuler la modération, restaurer ou supprimer définitivement. | L'action confirmée retire le commentaire de la file courante et les compteurs admin sont mis à jour au retour sur `/admin/dashboard`. | Si aucune donnée n'est disponible, ouvrir l'autre file de commentaires. Sinon, utiliser la collection Postman `soutenance/backend/postman/admin-comments.postman_collection.json` pour montrer les routes admin. |
| 12 - Déconnexion | Compte connecté | Depuis l'en-tête, sur n'importe quelle page | Déconnexion via le menu compte. | La session est supprimée, le lien `Connexion` réapparaît et les pages protégées redirigent vers `/sign-in`. | Si le menu n'est pas accessible, ouvrir `/sign-in` dans une fenêtre privée pour montrer l'état non connecté, puis vider la session du navigateur avant de reprendre. |

## Comptes de test

Tous les comptes de la démonstration sont présents dans la base de démo (`database/seed_demo.sql`) et partagent le mot de passe `Password123!`.

| Compte | Email | Statut en base | Rôle | Utilisé aux étapes |
| --- | --- | --- | --- | --- |
| Compte inactif | `paul.bernard@gmail.com` | `inactive` | Utilisateur | 1 |
| Compte banni | `spammer42@outlook.com` | `banned` | Utilisateur | 2 |
| Utilisateur actif | `sophie.leclerc@yahoo.fr` | `active` | Utilisateur | 3 à 8 |
| Administrateur | `admin_demo@recipe-shelter.fr` | `active` | Administrateur | 9 à 11 |

## Messages d'erreur de connexion (étapes 1 et 2)

Le back-end distingue les deux statuts et renvoie un code d'erreur différent, traduit en message par le front :

| Statut du compte | Code API | Message affiché | Lien proposé |
| --- | --- | --- | --- |
| Inactif (non validé) | `EMAIL_NOT_VALIDATED` | « Votre compte n'est pas encore activé. » | « Renvoyer le lien d'activation » |
| Banni (suspendu) | `USER_BANNED` | « Votre compte a été suspendu. » | Aucun pour l'instant — *évolution prévue : « Demander un déban »* |

## Notes rapides

- **Préparer avant la soutenance** : avoir un brouillon de recette à 90% rempli dans `/me/recipes/list`, au moins une recette en attente de validation et au moins un commentaire modéré.
- **Étapes 1 et 2** : c'est le même formulaire de connexion mais deux statuts différents. Insister sur le fait que le refus n'est pas générique : le message change selon le statut (inactif vs banni), preuve d'un contrôle d'accès fin côté serveur.
- **Étape 4** : utiliser exactement le terme « chocolat » + catégorie « Boissons » — c'est le critère de recherche testé et validé en amont (la recette *Le vrai chocolat chaud maison* est publiée dans cette catégorie).
- **Étape 8 (SSR)** : tester le « Afficher la source » en amont pour identifier clairement la zone du HTML qui montre le contenu pré-rendu. Préparer éventuellement une capture d'écran de comparaison (SPA classique vide vs Recipe Shelter avec contenu).
- Garder `/me/recipes/list` ouvert en onglet de secours pour retrouver rapidement le brouillon ou la recette soumise.
- Les captures du dossier `soutenance/frontend/Screenshots/` peuvent servir de filet de sécurité si un service local tombe pendant la démonstration.
- **Durée estimée** : 20 à 25 minutes en comptant les transitions et les commentaires. Prévoir un chronomètre.
