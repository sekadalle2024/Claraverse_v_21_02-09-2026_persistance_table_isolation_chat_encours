/**
 * Script de Diagnostic - Modifications Grok
 * 
 * Ce script vérifie que toutes les modifications ont été appliquées correctement
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSTIC DES MODIFICATIONS GROK\n');
console.log('═══════════════════════════════════════════════════════════════\n');

// Couleurs pour le terminal
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

function checkFile(filePath, searchStrings, description) {
    console.log(`\n📄 Vérification: ${description}`);
    console.log(`   Fichier: ${filePath}`);

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        let allFound = true;

        searchStrings.forEach(search => {
            const found = content.includes(search);
            const status = found ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
            console.log(`   ${status} "${search.substring(0, 50)}${search.length > 50 ? '...' : ''}"`);
            if (!found) allFound = false;
        });

        if (allFound) {
            console.log(`   ${colors.green}✅ TOUTES LES MODIFICATIONS PRÉSENTES${colors.reset}`);
        } else {
            console.log(`   ${colors.red}❌ CERTAINES MODIFICATIONS MANQUANTES${colors.reset}`);
        }

        return allFound;
    } catch (error) {
        console.log(`   ${colors.red}❌ ERREUR: ${error.message}${colors.reset}`);
        return false;
    }
}

// Vérifications
const checks = [];

// 1. Vérifier WelcomeScreen
checks.push(checkFile(
    'src/components/Clara_Components/clara_assistant_chat_window.tsx',
    [
        'Style Grok: Logo et zone de saisie centrés',
        'w-24 h-24',
        'E-audit',
        'flex flex-col items-center justify-center h-full'
    ],
    'WelcomeScreen simplifié (Page d\'accueil)'
));

// 2. Vérifier icône Paperclip
checks.push(checkFile(
    'src/components/Clara_Components/clara_assistant_input.tsx',
    [
        'Icône de sélection de fichiers à gauche - Style Grok',
        'Paperclip',
        'Attach files',
        'rounded-[28px]'
    ],
    'Icône Paperclip (Zone de saisie)'
));

// 3. Vérifier CSS de masquage
checks.push(checkFile(
    'src/styles/grok-style-overrides.css',
    [
        'Style Grok - Overrides pour masquer la sélection des LLM',
        'display: none !important',
        '.provider-selector-container',
        '.model-selector-container'
    ],
    'CSS de masquage des sélecteurs LLM'
));

// 4. Vérifier import CSS
checks.push(checkFile(
    'src/index.css',
    [
        '@import "./styles/grok-style-overrides.css"'
    ],
    'Import du CSS dans index.css'
));

// Résumé
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('\n📊 RÉSUMÉ DU DIAGNOSTIC\n');

const allPassed = checks.every(check => check);

if (allPassed) {
    console.log(`${colors.green}✅ TOUTES LES MODIFICATIONS SONT PRÉSENTES${colors.reset}`);
    console.log('\n💡 Si l\'interface n\'affiche pas les changements:');
    console.log('   1. Arrêter le serveur (Ctrl+C)');
    console.log('   2. Vider le cache: rm -rf node_modules/.vite');
    console.log('   3. Redémarrer: npm run dev');
    console.log('   4. Rafraîchir le navigateur: Ctrl+Shift+R');
} else {
    console.log(`${colors.red}❌ CERTAINES MODIFICATIONS SONT MANQUANTES${colors.reset}`);
    console.log('\n💡 Actions recommandées:');
    console.log('   1. Vérifier que les fichiers ont été sauvegardés');
    console.log('   2. Relire les fichiers de documentation');
    console.log('   3. Réappliquer les modifications manuellement');
}

console.log('\n═══════════════════════════════════════════════════════════════\n');

// Informations supplémentaires
console.log('📚 DOCUMENTATION DISPONIBLE:\n');
console.log('   - DEPANNAGE_MODIFICATIONS_NON_VISIBLES.md');
console.log('   - RESUME_MODIFICATIONS_GROK.md');
console.log('   - VERIFICATION_FINALE_GROK.md');
console.log('   - TESTEZ_MAINTENANT_GROK.txt');

console.log('\n═══════════════════════════════════════════════════════════════\n');

process.exit(allPassed ? 0 : 1);
