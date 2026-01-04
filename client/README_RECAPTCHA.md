# Configuration reCAPTCHA

Ce document explique comment configurer reCAPTCHA pour le site E-perfume.

## Intégration complète

reCAPTCHA est maintenant **pleinement intégré** dans le projet :

1. **Composant ReCaptcha** : `client/src/components/ReCaptcha.jsx`
   - Utilise `react-google-recaptcha`
   - Affiche automatiquement reCAPTCHA si la clé est configurée
   - Affiche un message si la clé n'est pas configurée (mode développement)

2. **Schémas Zod** : `client/src/schemas/validationSchemas.js`
   - Le champ `recaptchaToken` est **obligatoire** dans les schémas `registerSchema` et `loginSchema`
   - La validation Zod vérifie que le token est présent

3. **Formulaires** :
   - **RegisterScreen** : Intègre le composant ReCaptcha avec gestion du token
   - **LoginScreen** : Intègre le composant ReCaptcha avec gestion du token

4. **Backend** :
   - Fonction utilitaire `server/utils/verifyRecaptcha.js` pour vérifier le token auprès de Google
   - Validation reCAPTCHA intégrée dans `registerUser` et `authUser` (userController.js)
   - Si `RECAPTCHA_SECRET_KEY` n'est pas configuré, la vérification est ignorée (mode développement)

## Étapes pour activer reCAPTCHA

### 1. Obtenir les clés reCAPTCHA

1. Aller sur [Google reCAPTCHA Console](https://www.google.com/recaptcha/admin)
2. Créer un nouveau site
3. Choisir le type reCAPTCHA (v2 Checkbox recommandé)
4. Ajouter votre domaine (ex: `localhost` pour le développement, votre domaine en production)
5. Copier la **Site Key** et la **Secret Key**

### 2. Configurer les variables d'environnement

**Client** : Créer ou modifier `.env` dans le dossier `client/` :

```env
VITE_RECAPTCHA_SITE_KEY=votre_site_key_ici
```

**Serveur** : Ajouter dans `.env` du dossier `server/` :

```env
RECAPTCHA_SECRET_KEY=votre_secret_key_ici
```

### 3. Redémarrer les serveurs

Après avoir ajouté les variables d'environnement, redémarrer :
- Le serveur de développement client (`npm run dev`)
- Le serveur backend (`npm start` ou `npm run dev`)

## Fonctionnement

### Côté client

1. Le composant `ReCaptcha` vérifie si `VITE_RECAPTCHA_SITE_KEY` est défini
2. Si la clé est présente, reCAPTCHA s'affiche et génère un token
3. Le token est stocké dans l'état du composant (RegisterScreen/LoginScreen)
4. Lors de la soumission du formulaire, le token est validé avec Zod
5. Le token est envoyé au backend avec les autres données

### Côté serveur

1. Les routes `/api/users` (register) et `/api/users/login` reçoivent le token
2. La fonction `verifyRecaptcha` vérifie le token auprès de Google
3. Si `RECAPTCHA_SECRET_KEY` n'est pas configuré, la vérification retourne `true` (mode développement)
4. Si le token est invalide, une erreur est renvoyée au client

## Mode développement

- Si `VITE_RECAPTCHA_SITE_KEY` n'est pas configuré, le composant affiche un message mais ne bloque pas la soumission
- Si `RECAPTCHA_SECRET_KEY` n'est pas configuré, la vérification backend est ignorée (mais un avertissement est affiché dans les logs)
- **Attention** : En mode développement, le token reCAPTCHA est toujours requis dans la validation Zod, donc si reCAPTCHA n'est pas configuré, les formulaires ne fonctionneront pas. Pour le développement sans reCAPTCHA, vous pouvez temporairement rendre le token optionnel dans les schémas Zod.

## Production

En production, assurez-vous d'avoir :
- `VITE_RECAPTCHA_SITE_KEY` configuré dans l'environnement du client (Vercel, etc.)
- `RECAPTCHA_SECRET_KEY` configuré dans l'environnement du serveur (Render, etc.)
- Les domaines configurés dans Google reCAPTCHA Console

## Notes techniques

- La bibliothèque `react-google-recaptcha` est installée et utilisée
- La bibliothèque `axios` est installée côté serveur pour faire les requêtes à Google
- Le token reCAPTCHA est obligatoire dans les schémas Zod pour `registerSchema` et `loginSchema`
- Les erreurs de validation reCAPTCHA sont affichées à l'utilisateur dans les formulaires
