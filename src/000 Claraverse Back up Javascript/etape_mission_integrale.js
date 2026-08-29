function addCriteriaTablesToChatTables() {
  console.log('🔍 Recherche des tables dans le chat...');
  
  const chatTables = document.querySelectorAll('div.prose.prose-base.dark\\:prose-invert.max-w-none table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg');
  
  console.log(`📊 ${chatTables.length} table(s) cible(s) trouvée(s)`);

  chatTables.forEach((targetTable, index) => {
    const parentDiv = targetTable.closest('div.prose.prose-base.dark\\:prose-invert.max-w-none');
    
    if (parentDiv && !parentDiv.querySelector('.criteria-tables-container')) {
      // Récupérer les en-têtes de la table cible
      const targetHeaders = Array.from(targetTable.querySelectorAll('th'))
        .map(th => th.textContent.trim());
      
      // Déterminer le cas selon les en-têtes
      let caseKeywords = [];
      let caseType = 0;
      
      // Switch-case pour déterminer le type de table
      const headerCheck = (patterns) => targetHeaders.some(header => 
        patterns.some(pattern => 
          header.toLowerCase() === pattern.toLowerCase()
        )
      );

      if (headerCheck(["Synthese", "SYNTHESE", "Synthèse", "synthese"])) {
        caseType = 1;
        caseKeywords = ["Frap", "FRAP", "frap"];
      } 
      else if (headerCheck(["Rapport provisoire", "rapport provisoire", "RAPPORT PROVISOIRE"])) {
        caseType = 2;
        caseKeywords = ["Synthese", "SYNTHESE", "Synthèse", "synthese", "Synth"];
      } 
      else if (headerCheck(["Rapport final", "rapport final", "RAPPORT FINAL"])) {
        caseType = 3;
        caseKeywords = ["Rapport provisoire", "rapport provisoire", "RAPPORT PROVISOIRE"];
      } 
      else if (headerCheck(["Suivi recos", "suivi recos", "SUIVI RECOS"])) {
        caseType = 4;
        caseKeywords = ["Rapport final", "rapport final", "RAPPORT FINAL"];
      }
      
      // Si aucun cas ne correspond, on sort
      if (caseType === 0) {
        console.log(`ℹ️ Table ${index+1} non concernée par les cas 1-4`);
        return;
      }
      
      console.log(`➕ Traitement table ${index+1} - Cas ${caseType}`);

      const container = document.createElement('div');
      container.className = 'criteria-tables-container';
      container.style.marginTop = '10px';

      // Rechercher les tables correspondantes dans d'autres conteneurs
      const allContainers = document.querySelectorAll('div.prose.prose-base.dark\\:prose-invert.max-w-none');
      
      allContainers.forEach(criteriaContainer => {
        if (criteriaContainer !== parentDiv) {
          const firstTable = criteriaContainer.querySelector('table');
          
          if (firstTable) {
            // Vérifier les en-têtes de la première table
            const headers = Array.from(firstTable.querySelectorAll('th'))
              .map(th => th.textContent.trim());
            
            // Vérifier si les colonnes "Rubrique" et "Description" existent
            const hasRequiredHeaders = headers.some(header => 
              header.toLowerCase() === 'rubrique'
            ) && headers.some(header => 
              header.toLowerCase() === 'description'
            );
            
            if (hasRequiredHeaders) {
              // Rechercher les mots-clés dans la colonne Description
              let found = false;
              const rows = firstTable.querySelectorAll('tbody tr');
              
              rows.forEach(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                if (cells.length >= 2) {
                  const descriptionCell = cells[1].textContent.trim();
                  
                  if (caseKeywords.some(keyword => 
                    descriptionCell.toLowerCase().includes(keyword.toLowerCase())
                  )) {
                    found = true;
                  }
                }
              });
              
              // Si mot-clé trouvé, cloner toutes les tables du conteneur
              if (found) {
                const tablesToClone = criteriaContainer.querySelectorAll('table');
                
                tablesToClone.forEach((table, tableIndex) => {
                  const clone = table.cloneNode(true);
                  container.appendChild(clone);
                  
                  // Ajouter espace entre les tables
                  if (tableIndex < tablesToClone.length - 1) {
                    const spacer = document.createElement('div');
                    spacer.style.height = '15px';
                    container.appendChild(spacer);
                  }
                });
                
                console.log(`✅ ${tablesToClone.length} table(s) de critères ajoutée(s) pour le cas ${caseType}`);
              }
            }
          }
        }
      });

      // Insérer le conteneur seulement s'il contient des tables
      if (container.children.length > 0) {
        targetTable.insertAdjacentElement('afterend', container);
      } else {
        console.log(`⚠️ Aucune table correspondante trouvée pour le cas ${caseType}`);
      }
    }
  });
}

// L'observateur et l'initialisation restent identiques
const observer = new MutationObserver(mutations => {
  let tablesDetected = false;
  
  mutations.forEach(mutation => {
    if (!tablesDetected && mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches('table, div.prose') || 
              (node.querySelector && node.querySelector('table.min-w-full.border'))) {
            tablesDetected = true;
          }
        }
      });
    }
  });
  
  if (tablesDetected) {
    console.log('🔄 Nouveau contenu tabulaire détecté');
    setTimeout(() => addCriteriaTablesToChatTables(), 100);
  }
});

const observerConfig = {
  childList: true,
  subtree: true,
  attributes: false
};

function initializeCriteriaTables() {
  console.log('🚀 Initialisation du système de tables de critères');
  observer.observe(document.body, observerConfig);
  setTimeout(() => addCriteriaTablesToChatTables(), 1000);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initializeCriteriaTables, 500);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeCriteriaTables, 500);
  });
}

window.updateCriteriaTables = function() {
  console.log('🔧 Mise à jour manuelle des tables');
  addCriteriaTablesToChatTables();
};