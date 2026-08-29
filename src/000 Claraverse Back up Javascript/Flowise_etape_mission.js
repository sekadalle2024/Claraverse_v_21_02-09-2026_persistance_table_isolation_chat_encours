function convertTableToJson(tableElement) {
  const headers = Array.from(tableElement.querySelectorAll('th')).map(th => th.textContent.trim());
  const rows = tableElement.querySelectorAll('tbody tr');
  const data = [];

  rows.forEach(row => {
    const rowData = {};
    const cells = row.querySelectorAll('td');
    cells.forEach((cell, index) => {
      if (index < headers.length) {
        rowData[headers[index]] = cell.textContent.trim();
      }
    });
    data.push(rowData);
  });

  return {
    headers,
    data
  };
}

async function sendToFlowiseEndpoint(jsonTables) {
  const endpointUrl = "https://hqg4f4xc.rcld.dev/api/v1/prediction/d110c3d1-472b-498e-a225-b56182f03817";
  
  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tables: jsonTables })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la requête vers Flowise:', error);
    return null;
  }
}

function extractTablesFromHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.querySelectorAll('table');
}

function addCriteriaTablesToChatTables() {
  console.log('🔍 Recherche des tables dans le chat...');
  
  const chatTables = document.querySelectorAll('div.prose.prose-base.dark\\:prose-invert.max-w-none table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg');
  
  console.log(`📊 ${chatTables.length} table(s) cible(s) trouvée(s)`);

  chatTables.forEach((targetTable, index) => {
    const parentDiv = targetTable.closest('div.prose.prose-base.dark\\:prose-invert.max-w-none');
    
    if (parentDiv && !parentDiv.querySelector('.criteria-tables-container')) {
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
      else if (headerCheck(["Flowise", "FLOWISE", "flowise"])) {
        caseType = 5;
        const flowiseColumnIndex = targetHeaders.findIndex(header => 
          ["Flowise", "FLOWISE", "flowise"].some(pattern => 
            header.toLowerCase() === pattern.toLowerCase()
          )
        );

        if (flowiseColumnIndex !== -1) {
          const keywords = new Set();
          const rows = targetTable.querySelectorAll('tbody tr');
          
          rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > flowiseColumnIndex) {
              const cellText = cells[flowiseColumnIndex].textContent.trim();
              if (cellText) {
                keywords.add(cellText);
              }
            }
          });
          
          caseKeywords = Array.from(keywords);
        }
      }
      
      if (caseType === 0) {
        console.log(`ℹ️ Table ${index+1} non concernée par les cas 1-5`);
        return;
      }
      
      console.log(`➕ Traitement table ${index+1} - Cas ${caseType}`, caseKeywords);

      const container = document.createElement('div');
      container.className = 'criteria-tables-container';
      container.style.marginTop = '10px';

      const allContainers = document.querySelectorAll('div.prose.prose-base.dark\\:prose-invert.max-w-none');
      const collectedTables = [];
      
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
                  ) {
                    found = true;
                  }
                }
              });
              
              if (found) {
                const tablesToClone = criteriaContainer.querySelectorAll('table');
                
                tablesToClone.forEach((table, tableIndex) => {
                  const clone = table.cloneNode(true);
                  container.appendChild(clone);
                  collectedTables.push(table);
                  
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

      if (container.children.length > 0) {
        targetTable.insertAdjacentElement('afterend', container);

        // Traitement spécifique pour le cas Flowise (5)
        if (caseType === 5) {
          const jsonTables = collectedTables.map(table => convertTableToJson(table));
          
          sendToFlowiseEndpoint(jsonTables)
            .then(data => {
              if (data && data.text) {
                const tables = extractTablesFromHtml(data.text);
                container.innerHTML = '';
                
                tables.forEach((table, tableIndex) => {
                  container.appendChild(table);
                  if (tableIndex < tables.length - 1) {
                    const spacer = document.createElement('div');
                    spacer.style.height = '15px';
                    container.appendChild(spacer);
                  }
                });
              }
            });
        }
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