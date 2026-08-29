/**
 * Vérification finale avant déploiement GitHub
 * Vérifie que le .gitignore est correctement configuré
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 VÉRIFICATION FINALE AVANT DÉPLOIEMENT\n');
console.log('='.repeat(50) + '\n');

let hasErrors = false;

// 1. Vérifier que .gitignore a été corrigé
console.log('1️⃣  Vérification du .gitignore...');
const gitignorePath = path.join(__dirname, '.gitignore');
const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

if (gitignoreContent.includes('!src/assets/**/*.png')) {
    console.log('   ✅ .gitignore corrigé - assets seront inclus\n');
} else {
    console.error('   ❌ ERREUR: .gitignore non corrigé!\n');
    hasErrors = true;
}

// 2. Vérifier que les assets existent
console.log('2️⃣  Vérification des assets essentiels...');
const assets = [
    'src/assets/logo.png',
    'src/assets/temo.png'
];

assets.forEach(asset => {
    const fullPath = path.join(__dirname, asset);
    if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${asset}`);
    } else {
        console.error(`   ❌ ${asset} - MANQUANT!`);
        hasErrors = true;
    }
});
console.log('');

// 3. Vérifier que Git ne va pas ignorer les assets
console.log('3️⃣  Vérification Git...');
try {
    // Vérifier si logo.png sera inclus
    const checkIgnore = execSync('git check-ignore src/assets/logo.png', { encoding: 'utf8' }).trim();
    if (checkIgnore) {
        console.error('   ❌ ERREUR: logo.png sera ignoré par Git!\n');
        hasErrors = true;
    } else {
        console.log('   ✅ logo.png sera inclus dans Git\n');
    }
} catch (error) {
    // Si la commande échoue, c'est bon (le fichier n'est pas ignoré)
    console.log('   ✅ logo.png sera inclus dans Git\n');
}

// 4. Vérifier que Sidebar.tsx importe correctement
console.log('4️⃣  Vérification de Sidebar.tsx...');
const sidebarPath = path.join(__dirname, 'src/components/Sidebar.tsx');
if (fs.existsSync(sidebarPath)) {
    const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
    if (sidebarContent.includes('import logo from "../assets/logo.png"')) {
        console.log('   ✅ Import du logo correct\n');
    } else {
        console.error('   ❌ Import du logo incorrect!\n');
        hasErrors = true;
    }
} else {
    console.error('   ❌ Sidebar.tsx manquant!\n');
    hasErrors = true;
}

// 5. Vérifier la configuration Vite
console.log('5️⃣  Vérification de vite.config.ts...');
const viteConfigPath = path.join(__dirname, 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
    console.log('   ✅ vite.config.ts existe\n');
} else {
    console.error('   ❌ vite.config.ts manquant!\n');
    hasErrors = true;
}

// Résumé final
console.log('='.repeat(50));
if (hasErrors) {
    console.error('\n❌ ÉCHEC: Des problèmes ont été détectés!');
    console.error('Veuillez corriger ces problèmes avant de déployer.\n');
    process.exit(1);
} else {
    console.log('\n✅ SUCCÈS: Tout est prêt pour le déploiement!');
    console.log('\n📋 Prochaines étapes:');
    console.log('   1. Exécutez: deploy-to-github.bat');
    console.log('   2. Ou manuellement:');
    console.log('      git add .');
    console.log('      git commit -m "✨ Update"');
    console.log('      git push origin main');
    console.log('\n🎯 Repository: https://github.com/sekadalle2024/claraverse_back-up_V2.git\n');
    process.exit(0);
}
