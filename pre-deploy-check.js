/**
 * Script de vérification pré-déploiement
 * Vérifie que tous les assets nécessaires existent avant le build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredAssets = [
    'src/assets/logo.png',
    'src/assets/temo.png',
    'public/pdf.worker.min.js'
];

const optionalAssets = [
    'assets/icons/mac/icon.icns',
    'assets/icons/win/icon.ico'
];

console.log('🔍 Vérification des assets requis...\n');

let hasErrors = false;
let hasWarnings = false;

// Vérifier les assets requis
requiredAssets.forEach(asset => {
    const fullPath = path.join(__dirname, asset);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ ${asset}`);
    } else {
        console.error(`❌ ERREUR: ${asset} - Fichier manquant!`);
        hasErrors = true;
    }
});

console.log('\n🔍 Vérification des assets optionnels...\n');

// Vérifier les assets optionnels
optionalAssets.forEach(asset => {
    const fullPath = path.join(__dirname, asset);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ ${asset}`);
    } else {
        console.warn(`⚠️  AVERTISSEMENT: ${asset} - Fichier manquant (optionnel)`);
        hasWarnings = true;
    }
});

// Vérifier la configuration Vite
console.log('\n🔍 Vérification de la configuration Vite...\n');
const viteConfigPath = path.join(__dirname, 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
    console.log('✅ vite.config.ts existe');
} else {
    console.error('❌ ERREUR: vite.config.ts manquant!');
    hasErrors = true;
}

// Vérifier node_modules
console.log('\n🔍 Vérification des dépendances...\n');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
    console.log('✅ node_modules existe');
} else {
    console.error('❌ ERREUR: node_modules manquant! Exécutez "npm install"');
    hasErrors = true;
}

// Résumé
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.error('\n❌ ÉCHEC: Des erreurs critiques ont été détectées!');
    console.error('Veuillez corriger ces problèmes avant de déployer.\n');
    process.exit(1);
} else if (hasWarnings) {
    console.warn('\n⚠️  AVERTISSEMENT: Des fichiers optionnels sont manquants.');
    console.log('Le build peut continuer mais certaines fonctionnalités peuvent être limitées.\n');
    process.exit(0);
} else {
    console.log('\n✅ SUCCÈS: Tous les fichiers requis sont présents!');
    console.log('Le projet est prêt pour le déploiement.\n');
    process.exit(0);
}
