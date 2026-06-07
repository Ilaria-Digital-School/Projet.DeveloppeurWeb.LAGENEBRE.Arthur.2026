import { inject, Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

const META_DESCRIPTIONS: Record<string, string> = {
  // Homepage
  '': 'Découvrez des milliers de recettes de cuisine sur Recipe Shelter : recettes faciles, rapides et gourmandes à partager, noter et sauvegarder pour tous les niveaux.',

  // Recettes
  'Recettes': 'Parcourez toutes les recettes publiées sur Recipe Shelter et trouvez votre prochaine inspiration culinaire.',
  'Recherche': 'Recherchez parmi des milliers de recettes sur Recipe Shelter par ingrédient, catégorie ou temps de préparation.',
  'Création de recette': 'Partagez votre recette avec la communauté Recipe Shelter.',
  'Mes recettes': 'Retrouvez toutes vos recettes publiées et en cours de rédaction sur Recipe Shelter.',

  // Compte
  'Mon profil': 'Gérez votre profil sur Recipe Shelter.',
  'Mes favoris': 'Retrouvez toutes les recettes que vous avez sauvegardées sur Recipe Shelter.',
  'Profil utilisateur': 'Découvrez le profil et les recettes de cet utilisateur sur Recipe Shelter.',

  // Auth
  'Se connecter': 'Connectez-vous à votre compte Recipe Shelter pour accéder à vos recettes et favoris.',
  'Créer un compte': 'Rejoignez la communauté Recipe Shelter et commencez à partager vos recettes.',
  'Mot de passe oublié': 'Réinitialisez votre mot de passe Recipe Shelter en quelques étapes.',
  'Réinitialiser le mot de passe': 'Choisissez un nouveau mot de passe pour votre compte Recipe Shelter.',
  'Validation de l\'email': 'Validez votre adresse email pour activer votre compte Recipe Shelter.',
  'Renvoyer l\'email de vérification': 'Recevez un nouvel email de vérification pour activer votre compte Recipe Shelter.',

  // Légal
  'CGU': 'Consultez les conditions générales d\'utilisation de Recipe Shelter.',
  'Confidentialité': 'Consultez la politique de confidentialité de Recipe Shelter.',
  'Mentions légales': 'Consultez les mentions légales de Recipe Shelter.',

  // Contact / À propos
  'Contact': 'Contactez l\'équipe Recipe Shelter pour toute question ou suggestion.',
  'À propos': 'Découvrez l\'histoire et la mission de Recipe Shelter.',

  // Admin
  'Tableau de bord': 'Tableau de bord d\'administration Recipe Shelter.',
  'Recettes en attente': 'Gérez les recettes en attente de validation sur Recipe Shelter.',
  'Révision de recette': 'Révisez et validez une recette soumise sur Recipe Shelter.',
  'Commentaires modérés': 'Consultez les commentaires modérés sur Recipe Shelter.',
  'Commentaires supprimés': 'Consultez les commentaires supprimés sur Recipe Shelter.',
  'Utilisateurs bannis': 'Gérez les utilisateurs bannis sur Recipe Shelter.',
};

@Injectable({ providedIn: 'root' })
export class MetaService {
  private readonly meta = inject(Meta);

  setDescriptionForPage(pageTitle: string | undefined): void {
    const key = pageTitle ?? '';
    const description = META_DESCRIPTIONS[key] ?? META_DESCRIPTIONS[''];

    this.meta.updateTag({ name: 'description', content: description });
  }

  setDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
  }
}
