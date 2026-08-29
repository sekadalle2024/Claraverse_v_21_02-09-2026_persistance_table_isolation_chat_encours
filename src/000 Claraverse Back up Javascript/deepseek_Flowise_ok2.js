function addCriteriaTablesToChatTables() {
  console.log('🔍 Recherche des tables dans le chat...');
  
  const chatTables = document.querySelectorAll('div.prose.prose-base.dark\\:prose-invert.max-w-none table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg');
  
  console.log(`📊 ${chatTables.length} table(s) cible(s) trouvée(s)`);

  // Fonction pour interroger l'endpoint Flowise avec la question fixe
  async function queryFlowiseEndpoint() {
    try {
      const fixedQuestion = "Top 10 controles sur les stock";
      console.log(`📤 Envoi à Flowise: "${fixedQuestion}"`);
      
      const response = await fetch(
        "https://hqg4f4xc.rcld.dev/api/v1/prediction/d110c3d1-472b-498e-a225-b56182f03817",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: fixedQuestion })
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur Flowise:', error);
      return null;
    }
  }

  // Fonction pour convertir les tableaux Markdown en HTML
  function convertMarkdownTablesToHTML(markdown) {
    try {
      // Détecter tous les tableaux dans le Markdown
      const tableRegex = /(\|.+\|[\s\S]+?)(?=\n\n|$)/g;
      let htmlOutput = markdown;
      let match;
      
      while ((match = tableRegex.exec(markdown)) !== null) {
        const markdownTable = match[0];
        const rows = markdownTable.trim().split('\n').filter(row => row.trim() !== '');
        
        // Vérifier si c'est bien un tableau (au moins 2 lignes)
        if (rows.length < 2) continue;
        
        // Créer le tableau HTML
        let htmlTable = '<table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg mb-6"><tbody>';
        
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i].trim();
          if (!row.startsWith('|')) continue;
          
          // Extraire les cellules
          const cells = row.split('|').slice(1, -1).map(cell => cell.trim());
          
          // Ligne d'en-tête
          if (i === 0) {
            htmlTable += '<thead><tr>';
            cells.forEach(cell => {
              htmlTable += `<th class="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">${cell}</th>`;
            });
            htmlTable += '</tr></thead><tbody>';
          }
          // Ligne de séparation (ignorer)
          else if (i === 1 && cells[0].includes('---')) {
            continue;
          }
          // Lignes de contenu
          else {
            htmlTable += '<tr>';
            cells.forEach(cell => {
              htmlTable += `<td class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">${cell}</td>`;
            });
            htmlTable += '</tr>';
          }
        }
        
        htmlTable += '</tbody></table>';
        
        // Remplacer le tableau Markdown par le HTML
        htmlOutput = htmlOutput.replace(markdownTable, htmlTable);
      }
      
      // Remplacer les titres
      htmlOutput = htmlOutput.replace(/^### \*\*(.+?)\*\*/gm, '<h4 class="font-bold text-lg mb-3 text-indigo-700">$1</h4>');
      
      return htmlOutput;
    } catch (e) {
      console.error('Erreur de conversion Markdown:', e);
      return markdown;
    }
  }

  // Fonction pour formater la réponse Flowise
  function formatFlowiseResponse(responseText) {
    try {
      // Convertir les tableaux Markdown en HTML
      const htmlContent = convertMarkdownTablesToHTML(responseText);
      
      // Créer un conteneur pour la réponse
      const container = document.createElement('div');
      container.className = 'prose dark:prose-invert max-w-none';
      container.innerHTML = htmlContent;
      
      return container;
    } catch (e) {
      console.error('Erreur de formatage Flowise:', e);
      const fallback = document.createElement('div');
      fallback.textContent = responseText;
      return fallback;
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
      container.style.marginTop = '20px';
      container.style.padding = '15px';
      container.style.border = '1px dashed #4F46E5';
      container.style.borderRadius = '0.5rem';
      
      // Ajouter l'indicateur de chargement
      const loader = document.createElement('div');
      loader.className = 'text-center py-2 text-indigo-600 font-semibold';
      loader.textContent = 'Chargement des données Flowise...';
      container.appendChild(loader);
      
      targetTable.insertAdjacentElement('afterend', container);
      console.log('🌐 Démarrage de la requête Flowise');

      // Traitement de la requête Flowise
      const processFlowiseRequest = async () => {
        try {
          console.log('🔎 Flowise requête: "Top 10 controles sur les stock"');
          const response = await queryFlowiseEndpoint();
          
          if (!response || !response.text) {
            throw new Error('Réponse Flowise vide');
          }
          
          console.log('📩 Réponse Flowise reçue');
          
          // Formater la réponse
          const formattedResponse = formatFlowiseResponse(response.text);
          
          // Mettre à jour le conteneur
          const container = document.getElementById(containerId);
          if (!container) {
            console.error('Conteneur Flowise introuvable');
            return;
          }
          
          // Créer une section pour les résultats
          const section = document.createElement('div');
          section.className = 'flowise-section mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow';
          
          const header = document.createElement('h3');
          header.className = 'font-bold text-xl mb-4 text-indigo-700 dark:text-indigo-300';
          header.textContent = 'Résultats Flowise: Top 10 controles sur les stock';
          section.appendChild(header);
          
          // Ajouter le contenu formaté
          section.appendChild(formattedResponse);
          
          // Mettre à jour le conteneur
          container.innerHTML = '';
          container.appendChild(section);
          
          console.log('✅ Contenu Flowise affiché avec succès');
          
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

    // Traitement normal pour les cas 1-4 (inchangé)
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