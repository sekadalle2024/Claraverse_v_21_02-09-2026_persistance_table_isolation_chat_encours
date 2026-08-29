const fs = require('fs');
const path = require('path');

console.log('='.repeat(70));
console.log('🚀 EXTRACTION SIMPLE DE MENU_DATA');
console.log('='.repeat(70));

// Lire le fichier
const tsxFile = path.join(__dirname, '..', 'src', 'components', 'Clara_Components', 'DemarrerMenu.tsx');
console.log(`📖 Lecture: ${tsxFile}`);

const content = fs.readFileSync(tsxFile, 'utf8');
console.log(`✅ Fichier lu: ${content.length} caractères`);

// Trouver le début de MENU_DATA
const startMarker = 'const MENU_DATA: LogicielItem[] = [';
const startIndex = content.indexOf(startMarker);

if (startIndex === -1) {
    console.log('❌ MENU_DATA non trouvé');
    process.exit(1);
}

console.log(`✅ MENU_DATA trouvé à la position ${startIndex}`);

// Extraire jusqu'au ]; de fermeture
let bracketCount = 0;
let inMenuData = false;
let endIndex = startIndex;

for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    
    if (char === '[') {
        bracketCount++;
        inMenuData = true;
    } else if (char === ']') {
        bracketCount--;
        if (bracketCount === 0 && inMenuData) {
            endIndex = i + 1;
            break;
        }
    }
}

const menuDataRaw = content.substring(startIndex, endIndex);
console.log(`✅ MENU_DATA extrait: ${menuDataRaw.length} caractères`);

// Sauvegarder le texte brut
const outputRaw = path.join(__dirname, 'MENU_DATA_COMPLETE.txt');
fs.writeFileSync(outputRaw, menuDataRaw, 'utf8');
console.log(`✅ Sauvegardé: ${outputRaw}`);

// Analyser la structure
console.log('\n📊 ANALYSE DE LA STRUCTURE:');

// Compter les logiciels
const logicielMatches = menuDataRaw.match(/\{\s*id:\s*['"]e-[^'"]+['"]/g) || [];
const logiciels = logicielMatches.filter(m => 
    m.includes('e-audit-pro') || 
    m.includes('e-revision') || 
    m.includes('e-cartographie') || 
    m.includes('e-audit-plan') || 
    m.includes('e-cia-exam') || 
    m.includes('bibliotheque')
);
console.log(`   - Logiciels: ${logiciels.length}`);

// Compter les phases
const phaseMatches = menuDataRaw.match(/id:\s*['"]phase-[^'"]+['"]/g) || [];
console.log(`   - Phases: ${phaseMatches.length}`);

// Compter les étapes
const etapeMatches = menuDataRaw.match(/id:\s*['"][^'"]*['"]\s*,\s*label:\s*['"][^'"]+['"]\s*,\s*icon:/g) || [];
console.log(`   - Étapes (approx): ${etapeMatches.length}`);

// Compter les modes
const modeMatches = menuDataRaw.match(/id:\s*['"](?:normal|avance|demo|manuel)['"]/g) || [];
console.log(`   - Modes: ${modeMatches.length}`);

// Compter les tests
const testMatches = menuDataRaw.match(/reference:\s*['"][A-Z]{2}\d+['"]/g) || [];
console.log(`   - Tests: ${testMatches.length}`);

// Compter les cycles
const cycleMatches = menuDataRaw.match(/id:\s*['"]cycle-[^'"]+['"]/g) || [];
console.log(`   - Cycles: ${cycleMatches.length}`);

// Compter les variables
const variableMatches = menuDataRaw.match(/\[([^\]]+)\]\s*=/g) || [];
console.log(`   - Variables (approx): ${variableMatches.length}`);

console.log('\n' + '='.repeat(70));
console.log('✅ EXTRACTION TERMINÉE');
console.log('='.repeat(70));
