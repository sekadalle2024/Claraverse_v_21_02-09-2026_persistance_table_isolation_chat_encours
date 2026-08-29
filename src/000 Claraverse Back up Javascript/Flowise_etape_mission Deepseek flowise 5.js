function addCriteriaTablesToChatTables() {
  console.log('🔍 Recherche des tables dans le chat...');
  
  const chatTables = document.querySelectorAll('div.prose.prose-base.dark\\:prose-invert.max-w-none table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg');
  
  console.log(`📊 ${chatTables.length} table(s) cible(s) trouvée(s)`);

  // Fonction pour interroger l'endpoint Flowise
  async function queryFlowiseEndpoint(question) {
    try {
      const response = await fetch(
        "https://hqg4f4xc.rcld.dev/api/v1/prediction/d110c3d1-472b-498e-a225-b56182f03817",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question })
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur Flowise:', error);
      return null;
    }
  }

  // Fonction pour extraire les tables de critères avec le mot-clé "Frap" (insensible à la casse)
  function getCriteriaTablesWithKeyword() {
    const tablesHTML = [];
    
    // Rechercher toutes les tables de critères
    const allContainers = document.querySelectorAll('.criteria-tables-container');
    
    allContainers.forEach(container => {
      const tables = container.querySelectorAll('table');
      
      // Vérifier chaque table
      tables.forEach(table => {
        // Convertir les entêtes en minuscules pour la vérification
        const headers = Array.from(table.querySelectorAll('th')).map(th => 
          th.textContent.trim().toLowerCase()
        );
        
        // Vérifier si la table a les colonnes "rubrique" et "description" (insensible à la casse)
        if (headers.includes('rubrique') && headers.includes('description')) {
          let foundKeyword = false;
          
          // Rechercher le mot-clé "Frap" dans la colonne Description (insensible à la casse)
          const rows = table.querySelectorAll('tbody tr');
          rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 1) {
              const descriptionCell = cells[1].textContent.trim();
              // Vérifier les variations de "Frap" (insensible à la casse)
              if (descriptionCell.match(/\bFrap\b/i)) {
                foundKeyword = true;
              }
            }
          });
          
          // Si le mot-clé est trouvé, ajouter le outerHTML de la table
          if (foundKeyword) {
            tablesHTML.push(table.outerHTML);
          }
        }
      });
    });
    
    return tablesHTML.join('\n');
  }

  // Fonction robuste pour détecter et convertir les tables Markdown en HTML
  function extractAndConvertTables(responseText) {
    try {
      const tables = [];
      
      // Expression régulière pour détecter les tables Markdown
      const tableRegex = /^ *\|(.+)\| *\n *\|( *[-:]+[-| :]*) *\n((?: *\|.*\| *\n)*)/gm;
      let match;
      
      while ((match = tableRegex.exec(responseText)) !== null) {
        const headerRow = match[1];
        const separatorRow = match[2];
        const contentRows = match[3];
        
        // Créer la table HTML
        const table = document.createElement('table');
        table.className = 'min-w-full border border-gray-200 dark:border-gray-700 rounded-lg mb-2';
        
        // Créer l'en-tête
        const thead = document.createElement('thead');
        const headerTr = document.createElement('tr');
        headerRow.split('|').forEach(cell => {
          if (cell.trim() === '') return;
          const th = document.createElement('th');
          th.className = 'px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
          th.textContent = cell.trim();
          headerTr.appendChild(th);
        });
        thead.appendChild(headerTr);
        table.appendChild(thead);
        
        // Créer le corps
        const tbody = document.createElement('tbody');
        contentRows.trim().split('\n').forEach(row => {
          if (row.trim() === '') return;
          const tr = document.createElement('tr');
          row.split('|').forEach((cell, index) => {
            if (index === 0 || cell.trim() === '') return;
            const td = document.createElement('td');
            td.className = 'px-4 py-3 border-b border-gray-200 dark:border-gray-700';
            td.textContent = cell.trim();
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        tables.push(table);
      }
      
      // Si aucune table Markdown n'est trouvée, essayer d'extraire les tables HTML
      if (tables.length === 0) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(responseText, 'text/html');
        const htmlTables = doc.querySelectorAll('table');
        
        if (htmlTables.length > 0) {
          htmlTables.forEach(table => {
            const clone = table.cloneNode(true);
            clone.classList.add('min-w-full', 'border', 'border-gray-200', 
                              'dark:border-gray-700', 'rounded-lg', 'mb-2');
            tables.push(clone);
          });
        }
      }
      
      return tables;
    } catch (e) {
      console.error('Erreur extraction tables:', e);
      return [];
    }
  }

  chatTables.forEach((targetTable, index) => {
    const parentDiv = targetTable.closest('div.prose.prose-base.dark\\:prose-invert.max-w-none');
    
    if (!parentDiv) return;

    // Vérifier les conteneurs existants
    const hasCriteriaContainer = parentDiv.querySelector('.criteria-tables-container');
    const hasFlowiseContainer = parentDiv.querySelector('.flowise-tables-container');
    
    const targetHeaders = Array.from(targetTable.querySelectorAll('th'))
      .map(th => th.textContent.trim());
    
    let caseKeywords = [];
    let caseType = 0;
    
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
    else if (headerCheck(["Flowise", "FLOWISE", "Flowise"])) {
      caseType = 5;
    }
    
    if (caseType === 0) {
      console.log(`ℹ️ Table ${index+1} non concernée par les cas 1-5`);
      return;
    }
    
    console.log(`➕ Traitement table ${index+1} - Cas ${caseType}`);

    // Traitement spécial pour le Cas 5 (Flowise)
    if (caseType === 5 && !hasFlowiseContainer) {
      // Créer le conteneur avec un ID unique
      const containerId = `flowise-container-${Date.now()}`;
      const container = document.createElement('div');
      container.id = containerId;
      container.className = 'flowise-tables-container';
      container.style.marginTop = '10px';
      container.style.padding = '0';
      
      // Ajouter l'indicateur de chargement
      const loader = document.createElement('div');
      loader.className = 'text-center py-2 text-indigo-600 font-semibold';
      loader.textContent = 'Chargement des tables Flowise...';
      container.appendChild(loader);
      
      targetTable.insertAdjacentElement('afterend', container);
      console.log('🌐 Démarrage de la requête Flowise');

      // Traitement de la requête Flowise
      const processFlowiseRequest = async () => {
        try {
          // Obtenir les tables de critères avec le mot-clé "Frap"
          const criteriaTablesHTML = getCriteriaTablesWithKeyword();
          const tablesCount = criteriaTablesHTML.split('</table>').length - 1;
          console.log(`🔍 ${tablesCount} table(s) de critères avec "Frap" trouvée(s)`);
          
          // Afficher l'alerte avec les tables consolidées
          if (criteriaTablesHTML) {
            alert(`Tables consolidées collectées (${tablesCount} table(s)):\n\n` + 
                  criteriaTablesHTML.substring(0, 2000) + 
                  (criteriaTablesHTML.length > 2000 ? '... [tronqué]' : ''));
          } else {
            alert('Aucune table consolidée trouvée avec le critère "Frap"');
          }
          
          // Envoyer la requête à Flowise avec le contenu des tables
          const response = await queryFlowiseEndpoint(criteriaTablesHTML);
          
          if (!response || !response.text) {
            throw new Error('Réponse Flowise vide');
          }
          
          console.log('📩 Réponse Flowise reçue');
          
          // Extraire et convertir les tables
          const tables = extractAndConvertTables(response.text);
          console.log(`🔍 ${tables.length} table(s) trouvée(s) dans la réponse`);
          
          // Mettre à jour le conteneur
          const container = document.getElementById(containerId);
          if (!container) {
            console.error('Conteneur Flowise introuvable');
            return;
          }
          
          // Créer un conteneur pour les tables
          const tablesContainer = document.createElement('div');
          tablesContainer.className = 'flowise-tables-only';
          
          if (tables.length > 0) {
            tables.forEach(table => {
              // Réduire l'espace entre les tables
              table.style.marginBottom = '5px';
              tablesContainer.appendChild(table);
            });
            console.log(`✅ ${tables.length} table(s) ajoutée(s)`);
          } else {
            const noTableMsg = document.createElement('div');
            noTableMsg.className = 'text-gray-500 italic p-3';
            noTableMsg.textContent = 'Aucune table trouvée dans la réponse Flowise';
            tablesContainer.appendChild(noTableMsg);
          }
          
          // Mettre à jour le conteneur
          container.innerHTML = '';
          container.appendChild(tablesContainer);
          
        } catch (error) {
          console.error('❌ Erreur Flowise:', error);
          const container = document.getElementById(containerId);
          if (!container) return;
          
          const errorDiv = document.createElement('div');
          errorDiv.className = 'text-red-500 p-3 bg-red-50 rounded';
          errorDiv.innerHTML = `<strong>Erreur Flowise:</strong> ${error.message}`;
          container.innerHTML = '';
          container.appendChild(errorDiv);
        }
      };

      // Lancer la requête
      processFlowiseRequest();
      
      return;
    }

    // Traitement normal pour les cas 1-4
    if (caseType <= 4 && !hasCriteriaContainer) {
      const container = document.createElement('div');
      container.className = 'criteria-tables-container';
      container.style.marginTop = '10px';

      const allContainers = document.querySelectorAll('div.prose.prose-base.dark\\:prose-invert.max-w-none');
      
      allContainers.forEach(criteriaContainer => {
        if (criteriaContainer !== parentDiv) {
          const firstTable = criteriaContainer.querySelector('table');
          
          if (firstTable) {
            const headers = Array.from(firstTable.querySelectorAll('th'))
              .map(th => th.textContent.trim());
            
            const hasRequiredHeaders = headers.some(header => 
              header.toLowerCase() === 'rubrique'
            ) && headers.some(header => 
              header.toLowerCase() === 'description'
            );
            
            if (hasRequiredHeaders) {
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
              
              if (found) {
                const tablesToClone = criteriaContainer.querySelectorAll('table');
                
                tablesToClone.forEach((table, tableIndex) => {
                  const clone = table.cloneNode(true);
                  container.appendChild(clone);
                  
                  if (tableIndex < tablesToClone.length - 1) {
                    const spacer = document.createElement('div');
                    spacer.style.height = '10px';
                    container.appendChild(spacer);
                  }
                });
                
                console.log(`✅ ${tablesToClone.length} table(s) de critères ajoutée(s) pour le cas ${caseType}`);
              }
            }
          }
        }
      });

      if (container.children.length > 0) {
        targetTable.insertAdjacentElement('afterend', container);
      } else {
        console.log(`⚠️ Aucune table correspondante trouvée pour le cas ${caseType}`);
      }
    }
  });
}

// L'observateur et l'initialisation
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