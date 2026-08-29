/**
 * Script d'extraction des données du composant DemarrerMenu.tsx
 * Extrait la structure hiérarchique complète en JSON
 * 
 * Structure: Suite E-Audit > Logiciel > Phase > Étape > Mode > Variables
 */

const fs = require('fs');
const path = require('path');

// Fonction pour extraire les variables d'une commande
function extractVariables(command) {
  if (!command) return [];
  
  const variables = [];
  const regex = /\[([^\]]+)\]\s*=\s*([^\n]+)/g;
  let match;
  
  while ((match = regex.exec(command)) !== null) {
    variables.push({
      nom: match[1].trim(),
      valeur: match[2].trim()
    });
  }
  
  return variables;
}

// Fonction pour extraire les modes d'une étape
function extractModes(etapeData) {
  if (!etapeData.modes || etapeData.modes.length === 0) {
    // Si pas de modes mais une commande directe
    if (etapeData.command) {
      return [{
        id: 'direct',
        label: 'Direct',
        command: etapeData.command,
        variables: extractVariables(etapeData.command)
      }];
    }
    return [];
  }
  
  return etapeData.modes.map(mode => ({
    id: mode.id,
    label: mode.label,
    command: mode.command || mode.prefix || '',
    variables: extractVariables(mode.command || mode.prefix || '')
  }));
}

// Fonction pour extraire les tests d'un cycle
function extractTests(cycle) {
  if (!cycle.tests) return [];
  
  return cycle.tests.map(test => ({
    id: test.id,
    reference: test.reference,
    label: test.label,
    processus: test.processus,
    command: test.command,
    variables: extractVariables(test.command)
  }));
}

// Fonction pour extraire les cycles d'une phase
function extractCycles(phase) {
  if (!phase.cycles) return [];
  
  return phase.cycles.map(cycle => ({
    id: cycle.id,
    label: cycle.label,
    icon: 'icon', // Simplifié pour JSON
    tests: extractTests(cycle)
  }));
}

// Fonction pour extraire les étapes d'une phase
function extractEtapes(phase) {
  if (!phase.etapes) return [];
  
  return phase.etapes.map(etape => ({
    id: etape.id,
    label: etape.label,
    norme: etape.norme || null,
    icon: 'icon', // Simplifié pour JSON
    modes: extractModes(etape)
  }));
}

// Fonction pour extraire les phases d'un logiciel
function extractPhases(logiciel) {
  if (!logiciel.phases) return [];
  
  return logiciel.phases.map(phase => ({
    id: phase.id,
    label: phase.label,
    etapes: extractEtapes(phase),
    cycles: extractCycles(phase)
  }));
}

// Fonction pour extraire les logiciels
function extractLogiciels(menuData) {
  return menuData.map(logiciel => ({
    id: logiciel.id,
    label: logiciel.label,
    icon: 'icon', // Simplifié pour JSON
    phases: extractPhases(logiciel)
  }));
}

// Fonction principale pour créer la structure JSON complète
function createSuiteEAudit(menuData) {
  return {
    suite: {
      nom: "Suite E-Audit",
      description: "Suite complète d'outils d'audit et de révision comptable",
      version: "1.0.0",
      date_extraction: new Date().toISOString(),
      logiciels: extractLogiciels(menuData)
    }
  };
}

// Fonction pour lire et parser le fichier TypeScript
function parseTypeScriptFile(filePath) {
  console.log('Lecture du fichier:', filePath);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extraire la constante MENU_DATA
    const menuDataMatch = content.match(/const MENU_DATA:\s*LogicielItem\[\]\s*=\s*(\[[\s\S]*?\n\];)/);
    
    if (!menuDataMatch) {
      throw new Error('Impossible de trouver MENU_DATA dans le fichier');
    }
    
    // Nettoyer le code TypeScript pour le rendre évaluable
    let menuDataStr = menuDataMatch[1];
    
    // Remplacer les composants React par des chaînes
    menuDataStr = menuDataStr.replace(/<[^>]+>/g, '"icon"');
    
    // Remplacer les template literals
    menuDataStr = menuDataStr.replace(/`([^`]*)`/g, (match, p1) => {
      return '"' + p1.replace(/"/g, '\\"') + '"';
    });
    
    // Évaluer le code JavaScript
    const menuData = eval('(' + menuDataStr + ')');
    
    return menuData;
  } catch (error) {
    console.error('Erreur lors du parsing:', error.message);
    throw error;
  }
}

// Fonction principale
function main() {
  const sourceFile = path.join(__dirname, '..', 'src', 'components', 'Clara_Components', 'DemarrerMenu.tsx');
  const outputDir = __dirname;
  const outputFile = path.join(outputDir, 'suite_e_audit_structure.json');
  
  console.log('='.repeat(80));
  console.log('EXTRACTION DES DONNÉES DU MENU DÉMARRER');
  console.log('='.repeat(80));
  console.log('');
  
  try {
    // Parser le fichier TypeScript
    const menuData = parseTypeScriptFile(sourceFile);
    console.log('✓ Fichier TypeScript parsé avec succès');
    console.log('  Nombre de logiciels trouvés:', menuData.length);
    console.log('');
    
    // Créer la structure JSON
    const suiteEAudit = createSuiteEAudit(menuData);
    console.log('✓ Structure JSON créée');
    console.log('');
    
    // Statistiques
    let totalPhases = 0;
    let totalEtapes = 0;
    let totalModes = 0;
    let totalCycles = 0;
    let totalTests = 0;
    
    suiteEAudit.suite.logiciels.forEach(logiciel => {
      totalPhases += logiciel.phases.length;
      logiciel.phases.forEach(phase => {
        totalEtapes += phase.etapes.length;
        totalCycles += phase.cycles.length;
        phase.etapes.forEach(etape => {
          totalModes += etape.modes.length;
        });
        phase.cycles.forEach(cycle => {
          totalTests += cycle.tests.length;
        });
      });
    });
    
    console.log('STATISTIQUES:');
    console.log('  - Logiciels:', suiteEAudit.suite.logiciels.length);
    console.log('  - Phases:', totalPhases);
    console.log('  - Étapes:', totalEtapes);
    console.log('  - Modes:', totalModes);
    console.log('  - Cycles comptables:', totalCycles);
    console.log('  - Tests:', totalTests);
    console.log('');
    
    // Sauvegarder le fichier JSON
    fs.writeFileSync(outputFile, JSON.stringify(suiteEAudit, null, 2), 'utf8');
    console.log('✓ Fichier JSON sauvegardé:', outputFile);
    console.log('');
    
    // Créer aussi une version compacte
    const compactFile = path.join(outputDir, 'suite_e_audit_structure_compact.json');
    fs.writeFileSync(compactFile, JSON.stringify(suiteEAudit), 'utf8');
    console.log('✓ Version compacte sauvegardée:', compactFile);
    console.log('');
    
    console.log('='.repeat(80));
    console.log('EXTRACTION TERMINÉE AVEC SUCCÈS');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('');
    console.error('ERREUR:', error.message);
    console.error('');
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { createSuiteEAudit, extractVariables };
