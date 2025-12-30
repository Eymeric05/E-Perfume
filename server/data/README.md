# Script de Seed des Produits

Ce script permet de peupler la base de données avec des produits de parfums.

## Utilisation avec l'API FragranceFinder

Pour utiliser l'API FragranceFinder via RapidAPI :

1. **Obtenir une clé API** :
   - Créez un compte sur [RapidAPI](https://rapidapi.com)
   - Abonnez-vous à l'API [FragranceFinder](https://rapidapi.com/remote-skills-remote-skills-default/api/fragrancefinder-api)
   - Copiez votre clé API (X-RapidAPI-Key)

2. **Configurer la variable d'environnement** :
   - Créez un fichier `.env` dans le dossier `server/` (si ce n'est pas déjà fait)
   - Ajoutez votre clé API :
     ```
     RAPIDAPI_KEY=votre_cle_api_ici
     ```

3. **Exécuter le script** :
   ```bash
   cd server
   npm run seed
   ```

## Mode Fallback

Si la clé API n'est pas configurée ou si l'API échoue, le script utilisera automatiquement des données statiques de démonstration (10 parfums).

## Notes

- Le script supprime tous les produits existants avant d'ajouter les nouveaux
- Un utilisateur admin est créé automatiquement s'il n'existe pas (email: `admin@eparfume.com`, password: `admin123`)
- Les produits récupérés depuis l'API sont transformés pour correspondre au modèle Product de l'application

