# Compression d'images avec TinyPNG

Ce document explique comment utiliser le script de compression d'images pour optimiser les performances du site.

## Prérequis

1. **Clé API TinyPNG**
   - Créez un compte gratuit sur [TinyPNG](https://tinypng.com/)
   - Obtenez votre clé API sur [TinyPNG Developers](https://tinypng.com/developers)
   - Le plan gratuit permet 500 compressions par mois

2. **Configuration**
   - Ajoutez votre clé API dans le fichier `.env` du serveur :
   ```
   TINYPNG_API_KEY=votre_cle_api_ici
   ```

## Utilisation

### Compression d'un dossier

```bash
# Compresser les images dans client/public/images
node server/utils/compressImages.js client/public/images

# Compresser les images uploadées dans server/uploads
node server/utils/compressImages.js server/uploads

# Mode test (dry-run) - voir ce qui serait compressé sans modifier
node server/utils/compressImages.js client/public/images --dry-run
```

### Fonctionnalités

- ✅ Compression automatique de tous les formats supportés (PNG, JPG, JPEG, WEBP)
- ✅ Parcours récursif des sous-dossiers
- ✅ Création automatique de sauvegardes (fichiers `.backup`)
- ✅ Statistiques détaillées après compression
- ✅ Gestion des erreurs et limites de l'API

### Formats supportés

- PNG
- JPG / JPEG
- WEBP

### Limites

- Taille maximale par fichier : 5MB
- Limite du plan gratuit TinyPNG : 500 compressions/mois

## Intégration dans le workflow

### Option 1 : Compression manuelle avant déploiement

```bash
# Avant de déployer, compressez les nouvelles images
node server/utils/compressImages.js client/public/images
```

### Option 2 : Compression automatique lors de l'upload

Vous pouvez intégrer la compression dans votre route d'upload existante :

```javascript
const { compressImage } = require('../utils/compressImages');

// Après l'upload réussi
try {
  await compressImage(tempPath, finalPath);
  console.log('Image compressée avec succès');
} catch (error) {
  console.error('Erreur de compression, utilisation de l\'image originale');
}
```

## Bonnes pratiques

1. **Sauvegardes** : Le script crée automatiquement des fichiers `.backup`. Vous pouvez les supprimer après vérification.

2. **Compression initiale** : Compressez toutes les images une première fois, puis seulement les nouvelles images.

3. **Optimisation** : Utilisez aussi le format WebP quand possible pour une meilleure compression.

4. **Vérification** : Testez visuellement que la qualité reste acceptable après compression.

## Résolution de problèmes

### Erreur "TINYPNG_API_KEY n'est pas défini"
- Vérifiez que la variable est bien définie dans votre `.env`
- Redémarrez votre terminal/session après modification du `.env`

### Erreur "Fichier trop volumineux"
- Le fichier dépasse 5MB, compressez-le manuellement ou divisez-le

### Erreur "Erreur API TinyPNG (429)"
- Vous avez atteint la limite de 500 compressions/mois
- Attendez le mois suivant ou passez à un plan payant

### Images non compressées
- Vérifiez que le format est supporté (PNG, JPG, JPEG, WEBP)
- Vérifiez les permissions d'écriture sur les fichiers

## Alternatives

Si vous préférez une autre solution de compression :

- **ImageMagick** : Outil en ligne de commande
- **Sharp** : Bibliothèque Node.js pour le traitement d'images
- **Squoosh CLI** : Alternative open-source à TinyPNG




