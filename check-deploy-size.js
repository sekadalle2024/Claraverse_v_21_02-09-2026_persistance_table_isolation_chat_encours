#!/usr/bin/env node

/**
 * Script de vérification de la taille des fichiers avant déploiement Netlify
 * Identifie les fichiers > 10MB qui pourraient poser problème
 */

import fs from 'fs';
import path from 'path';

const IGNORE_PATTERNS = [
  'node_modules',
  'venv_claraverse',
  'py_backend',
  'electron',
  'release',
  'Claraverse windows 11',
  'Claraverse_windows_11_26_02_26',
  'ClaraVerse-v-firebase-V2-24.11.25',
  'documentation',
  'docs-internal',
  'workflows',
  'test-configs',
  'tests',
  'troubleshoot',
  '.git',
  '.github',
  'clara-mcp',
  'dist',
  'build'
];

const SIZE_THRESHOLD_MB = 10;
const SIZE_THRESHOLD_BYTES = SIZE_THRESHOLD_MB * 1024 * 1024;

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function scanDirectory(dir, results = []) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      
      if (shouldIgnore(filePath)) {
        continue;
      }
      
      try {
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          scanDirectory(filePath, results);
        } else if (stats.size > SIZE_THRESHOLD_BYTES) {
          results.push({
            path: filePath,
            size: stats.size,
            sizeFormatted: formatBytes(stats.size)
          });
        }
      } catch (err) {
        // Ignorer les erreurs de permission
      }
    }
  } catch (err) {
    console.error(`Erreur lors du scan de ${dir}:`, err.message);
  }
  
  return results;
}

function calculateTotalSize(dir) {
  let total = 0;
  
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      
      if (shouldIgnore(filePath)) {
        continue;
      }
      
      try {
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
          total += calculateTotalSize(filePath);
        } else {
          total += stats.size;
        }
      } catch (err) {
        // Ignorer les erreurs
      }
    }
  } catch (err) {
    // Ignorer les erreurs
  }
  
  return total;
}

console.log('🔍 Analyse des fichiers volumineux pour le déploiement Netlify...\n');
console.log(`📏 Seuil : fichiers > ${SIZE_THRESHOLD_MB} MB\n`);
console.log('⏳ Scan en cours...\n');

const largeFiles = scanDirectory('.');

if (largeFiles.length === 0) {
  console.log('✅ Aucun fichier volumineux détecté (hors dossiers ignorés)\n');
} else {
  console.log(`⚠️  ${largeFiles.length} fichier(s) volumineux détecté(s) :\n`);
  
  // Trier par taille décroissante
  largeFiles.sort((a, b) => b.size - a.size);
  
  largeFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file.path}`);
    console.log(`   Taille : ${file.sizeFormatted}\n`);
  });
}

// Calculer la taille totale estimée du déploiement
console.log('📊 Calcul de la taille totale du déploiement...\n');
const totalSize = calculateTotalSize('.');
console.log(`📦 Taille totale estimée : ${formatBytes(totalSize)}\n`);

// Recommandations
console.log('💡 Recommandations :\n');
console.log('1. Les dossiers suivants sont automatiquement exclus :');
IGNORE_PATTERNS.forEach(pattern => console.log(`   - ${pattern}`));
console.log('\n2. Vérifiez le fichier .netlify-ignore pour les exclusions');
console.log('3. Exécutez "npm run build" pour générer le dossier dist/');
console.log('4. La taille du dossier dist/ devrait être < 100 MB\n');

// Vérifier si dist existe
if (fs.existsSync('dist')) {
  const distSize = calculateTotalSize('dist');
  console.log(`✅ Dossier dist/ trouvé : ${formatBytes(distSize)}\n`);
  
  if (distSize > 100 * 1024 * 1024) {
    console.log('⚠️  Le dossier dist/ est > 100 MB, considérez l\'optimisation\n');
  }
} else {
  console.log('ℹ️  Dossier dist/ non trouvé. Exécutez "npm run build" d\'abord\n');
}

console.log('✅ Analyse terminée !\n');
