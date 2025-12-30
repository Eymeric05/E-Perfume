/**
 * Script de compression d'images avec TinyPNG API
 * 
 * Ce script permet de compresser automatiquement les images
 * du projet pour optimiser les performances et réduire la taille des fichiers.
 * 
 * Utilisation:
 *   node server/utils/compressImages.js [dossier]
 * 
 * Exemples:
 *   node server/utils/compressImages.js client/public/images
 *   node server/utils/compressImages.js server/uploads
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

// Configuration
const TINYPNG_API_KEY = process.env.TINYPNG_API_KEY || '';
const SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Compresse une image via l'API TinyPNG
 */
function compressImage(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    if (!TINYPNG_API_KEY) {
      return reject(new Error('TINYPNG_API_KEY n\'est pas défini dans les variables d\'environnement'));
    }

    const fileBuffer = fs.readFileSync(inputPath);
    
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return reject(new Error(`Fichier trop volumineux: ${inputPath} (${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB)`));
    }

    const fileSizeBefore = fileBuffer.length;
    const options = {
      hostname: 'api.tinify.com',
      port: 443,
      path: '/shrink',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${TINYPNG_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Content-Length': fileBuffer.length
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 201) {
        const location = res.headers.location;
        const compressionCount = res.headers['compression-count'];
        
        // Télécharger l'image compressée
        https.get(location, (downloadRes) => {
          const chunks = [];
          downloadRes.on('data', (chunk) => chunks.push(chunk));
          downloadRes.on('end', () => {
            const compressedBuffer = Buffer.concat(chunks);
            const fileSizeAfter = compressedBuffer.length;
            const savings = ((1 - fileSizeAfter / fileSizeBefore) * 100).toFixed(2);
            
            fs.writeFileSync(outputPath, compressedBuffer);
            
            console.log(`✓ ${path.basename(inputPath)}: ${(fileSizeBefore / 1024).toFixed(2)}KB → ${(fileSizeAfter / 1024).toFixed(2)}KB (${savings}% réduction)`);
            resolve({
              input: inputPath,
              output: outputPath,
              before: fileSizeBefore,
              after: fileSizeAfter,
              savings: savings,
              compressionCount: compressionCount
            });
          });
        }).on('error', reject);
      } else {
        let errorData = '';
        res.on('data', (chunk) => errorData += chunk);
        res.on('end', () => {
          reject(new Error(`Erreur API TinyPNG (${res.statusCode}): ${errorData}`));
        });
      }
    });

    req.on('error', reject);
    req.write(fileBuffer);
    req.end();
  });
}

/**
 * Parcourt récursivement un dossier et compresse toutes les images
 */
async function compressDirectory(dirPath, options = {}) {
  const { 
    backup = true,
    dryRun = false,
    recursive = true 
  } = options;

  if (!fs.existsSync(dirPath)) {
    throw new Error(`Le dossier n'existe pas: ${dirPath}`);
  }

  const results = {
    processed: 0,
    skipped: 0,
    errors: [],
    savings: {
      totalBefore: 0,
      totalAfter: 0
    }
  };

  async function processDirectory(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory() && recursive) {
        await processDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        
        if (SUPPORTED_FORMATS.includes(ext)) {
          try {
            if (dryRun) {
              console.log(`[DRY RUN] Traiterait: ${fullPath}`);
              results.processed++;
            } else {
              // Créer une sauvegarde si demandé
              if (backup) {
                const backupPath = fullPath + '.backup';
                if (!fs.existsSync(backupPath)) {
                  fs.copyFileSync(fullPath, backupPath);
                }
              }

              // Compresser l'image
              const result = await compressImage(fullPath, fullPath);
              results.processed++;
              results.savings.totalBefore += result.before;
              results.savings.totalAfter += result.after;

              // Attendre un peu pour éviter de dépasser les limites de l'API
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (error) {
            console.error(`✗ Erreur lors de la compression de ${fullPath}:`, error.message);
            results.errors.push({ file: fullPath, error: error.message });
            results.skipped++;
          }
        } else {
          results.skipped++;
        }
      }
    }
  }

  await processDirectory(dirPath);

  // Afficher le résumé
  console.log('\n=== Résumé ===');
  console.log(`Images traitées: ${results.processed}`);
  console.log(`Images ignorées: ${results.skipped}`);
  if (results.errors.length > 0) {
    console.log(`Erreurs: ${results.errors.length}`);
  }
  
  if (!dryRun && results.processed > 0) {
    const totalSavings = ((1 - results.savings.totalAfter / results.savings.totalBefore) * 100).toFixed(2);
    console.log(`\nÉconomie totale: ${(results.savings.totalBefore / 1024 / 1024).toFixed(2)}MB → ${(results.savings.totalAfter / 1024 / 1024).toFixed(2)}MB (${totalSavings}% réduction)`);
  }

  return results;
}

// Point d'entrée du script
if (require.main === module) {
  const args = process.argv.slice(2);
  const dirPath = args[0] || 'client/public/images';
  const dryRun = args.includes('--dry-run');

  if (dryRun) {
    console.log('Mode DRY RUN activé - aucune modification ne sera effectuée\n');
  }

  console.log(`Compression des images dans: ${dirPath}\n`);

  if (!TINYPNG_API_KEY && !dryRun) {
    console.error('❌ Erreur: TINYPNG_API_KEY n\'est pas défini.');
    console.error('   Définissez la variable d\'environnement ou ajoutez-la dans votre fichier .env');
    console.error('   Vous pouvez obtenir une clé API gratuite sur: https://tinypng.com/developers');
    process.exit(1);
  }

  compressDirectory(dirPath, { dryRun })
    .then(() => {
      console.log('\n✓ Compression terminée');
    })
    .catch((error) => {
      console.error('\n❌ Erreur:', error.message);
      process.exit(1);
    });
}

module.exports = { compressImage, compressDirectory };



