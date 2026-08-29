function addCriteriaTablesToChatTables() {
  console.log('🔍 Recherche des tables dans le chat...');
  
  const chatTables = document.querySelectorAll('div.prose.prose-base.dark\\:prose-invert.max-w-none table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg');
  
  console.log(`📊 ${chatTables.length} table(s) cible(s) trouvée(s)`);

  // Configuration des mots-clés de recherche dynamiques
  const SEARCH_KEYWORDS = {
    'frap': ['frap', 'FRAP', 'Frap'],
    'synthese': ['synthese', 'SYNTHESE', 'Synthèse', 'Synthese', 'synth', 'SYNTH', 'Synth'],
    'rapport': ['rapport', 'RAPPORT', 'Rapport', 'rapport provisoire', 'rapport final'],
    'suivi': ['suivi', 'SUIVI', 'Suivi', 'suivi recos', 'SUIVI RECOS']
  };

  // Fonction pour interroger l'endpoint n8n (remplace Flowise)
  async function queryN8nEndpoint(question) {
    try {
      const response = await fetch(
        "https://q0z0ngxj.rpcl.host/api/v1/prediction/b3eeb67d-6d20-4555-93a6-a89b99f95d2c",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question })
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur n8n:', error);
      return null;
    }
  }

  // Fonction pour créer la table télécharger à partir de la réponse n8n
  function createDownloadTable(downloadUrl) {
    const table = document.createElement('table');
    table.className = 'min-w-full border border-gray-200 dark:border-gray-700 rounded-lg mb-2';
    
    // Créer l'en-tête
    const thead = document.createElement('thead');
    const headerTr = document.createElement('tr');
    const th = document.createElement('th');
    th.className = 'px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center';
    th.textContent = 'Telecharger';
    headerTr.appendChild(th);
    thead.appendChild(headerTr);
    table.appendChild(thead);
    
    // Créer le corps avec le lien
    const tbody = document.createElement('tbody');
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.className = 'px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-center';
    
    // Créer le lien de téléchargement
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.target = '_blank';
    downloadLink.className = 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline';
    downloadLink.textContent = downloadUrl;
    
    td.appendChild(downloadLink);
    tr.appendChild(td);
    tbody.appendChild(tr);
    table.appendChild(tbody);
    
    return table;
  }

  // Fonction pour détecter quel mot-clé est présent dans la première table d'une div
  function detectKeywordInFirstTable(div) {
    const firstTable = div.querySelector('table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg');
    
    if (!firstTable) return null;
    
    // Vérifier les en-têtes de la première table
    const headers = Array.from(firstTable.querySelectorAll('th')).map(th => 
      th.textContent.trim().toLowerCase()
    );
    
    // Vérifier si la première table a les colonnes requises
    const hasRubrique = headers.some(header => header === 'rubrique');
    const hasDescription = headers.some(header => header === 'description');
    
    if (!hasRubrique || !hasDescription) {
      return null;
    }
    
    // Rechercher les mots-clés dans toutes les cellules de la première table
    const allCells = firstTable.querySelectorAll('td');
    
    for (const [keywordGroup, variations] of Object.entries(SEARCH_KEYWORDS)) {
      for (const cell of allCells) {
        const cellText = cell.textContent.trim();
        
        // Vérifier si une variation du mot-clé est présente
        if (variations.some(keyword => 
          cellText.toLowerCase().includes(keyword.toLowerCase()) ||
          cellText.match(new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'i'))
        )) {
          console.log(`🎯 Mot-clé "${keywordGroup}" détecté dans la première table:`, cellText);
          return keywordGroup;
        }
      }
    }
    
    return null;
  }

  // Fonction dynamique pour collecter toutes les tables des divs ayant le mot-clé cible
  function getCriteriaTablesWithDynamicKeyword(targetKeyword) {
    const tablesHTML = [];
    const processedDivs = new Set();
    
    console.log(`🔍 Recherche dynamique des tables contenant le mot-clé: ${targetKeyword}`);
    
    // Obtenir toutes les divs contenant des tables
    const allDivs = document.querySelectorAll('div.prose.prose-base.dark\\:prose-invert.max-w-none');
    
    allDivs.forEach((div, divIndex) => {
      if (processedDivs.has(div)) return;
      
      // Détecter le mot-clé dans la première table de cette div
      const detectedKeyword = detectKeywordInFirstTable(div);
      
      if (detectedKeyword === targetKeyword) {
        processedDivs.add(div);
        
        // Collecter TOUTES les tables de cette div
        const allTablesInDiv = div.querySelectorAll('table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg');
        
        console.log(`✅ Div ${divIndex + 1}: Mot-clé "${targetKeyword}" détecté! Collecte de ${allTablesInDiv.length} table(s)`);
        
        allTablesInDiv.forEach((table, tableIndex) => {
          tablesHTML.push(table.outerHTML);
          console.log(`   📋 Table HTML ${tableIndex + 1}/${allTablesInDiv.length} ajoutée`);
        });
      }
    });
    
    console.log(`📊 Résultat: ${tablesHTML.length} table(s) HTML collectée(s) pour le mot-clé "${targetKeyword}"`);
    return tablesHTML.join('\n');
  }

  // Fonction pour détecter le mot-clé cible dans une table Flowise (maintenant n8n)
  function detectTargetKeywordInN8nTable(n8nTable) {
    const allCells = n8nTable.querySelectorAll('td');
    
    for (const [keywordGroup, variations] of Object.entries(SEARCH_KEYWORDS)) {
      for (const cell of allCells) {
        const cellText = cell.textContent.trim();
        
        if (variations.some(keyword => 
          cellText.toLowerCase().includes(keyword.toLowerCase()) ||
          cellText.match(new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'i'))
        )) {
          console.log(`🎯 Mot-clé cible "${keywordGroup}" détecté dans table n8n:`, cellText);
          return keywordGroup;
        }
      }
    }
    
    return null;
  }

  chatTables.forEach((targetTable, index) => {
    const parentDiv = targetTable.closest('div.prose.prose-base.dark\\:prose-invert.max-w-none');
    
    if (!parentDiv) return;

    // Vérifier les conteneurs existants (renommés pour n8n)
    const hasCriteriaContainer = parentDiv.querySelector('.criteria-tables-container');
    const hasN8nContainer = parentDiv.querySelector('.n8n-tables-container');
    
    const targetHeaders = Array.from(targetTable.querySelectorAll('th'))
      .map(th => th.textContent.trim());
    
    let caseType = 0;
    let targetKeyword = null;
    
    const headerCheck = (patterns) => targetHeaders.some(header => 
      patterns.some(pattern => 
        header.toLowerCase() === pattern.toLowerCase()
      )
    );

    // Cas dynamiques basés sur les en-têtes
    if (headerCheck(["Synthese", "SYNTHESE", "Synthèse", "synthese"])) {
      caseType = 1;
      targetKeyword = 'frap';
    } 
    else if (headerCheck(["Rapport provisoire", "rapport provisoire", "RAPPORT PROVISOIRE"])) {
      caseType = 2;
      targetKeyword = 'synthese';
    } 
    else if (headerCheck(["Rapport final", "rapport final", "RAPPORT FINAL"])) {
      caseType = 3;
      targetKeyword = 'rapport';
    } 
    else if (headerCheck(["Suivi recos", "suivi recos", "SUIVI RECOS"])) {
      caseType = 4;
      targetKeyword = 'rapport';
    }
    else if (headerCheck(["Flowise", "FLOWISE", "Flowise"])) {
      caseType = 5;
      // Pour n8n, on détecte dynamiquement le mot-clé cible
      targetKeyword = detectTargetKeywordInN8nTable(targetTable);
    }
    
    if (caseType === 0) {
      console.log(`ℹ️ Table ${index+1} non concernée par les cas dynamiques`);
      return;
    }
    
    console.log(`➕ Traitement table ${index+1} - Cas ${caseType} - Mot-clé cible: ${targetKeyword || 'N/A'}`);

    // Traitement spécial pour le Cas 5 (n8n) - Version dynamique
    if (caseType === 5 && !hasN8nContainer && targetKeyword) {
      const containerId = `n8n-container-${Date.now()}`;
      const container = document.createElement('div');
      container.id = containerId;
      container.className = 'n8n-tables-container';
      container.style.marginTop = '10px';
      container.style.padding = '0';
      
      // Ajouter l'indicateur de chargement
      const loader = document.createElement('div');
      loader.className = 'text-center py-2 text-indigo-600 font-semibold';
      loader.textContent = `Chargement des données n8n (${targetKeyword})...`;
      container.appendChild(loader);
      
      targetTable.insertAdjacentElement('afterend', container);
      console.log(`🌐 Démarrage de la requête n8n pour le mot-clé: ${targetKeyword}`);

      // Traitement de la requête n8n avec détection dynamique
      const processN8nRequest = async () => {
        try {
          // Obtenir les tables basées sur le mot-clé détecté dynamiquement
          const criteriaTablesHTML = getCriteriaTablesWithDynamicKeyword(targetKeyword);
          const tablesCount = criteriaTablesHTML ? criteriaTablesHTML.split('</table>').length - 1 : 0;
          console.log(`🔍 ${tablesCount} table(s) HTML collectée(s) pour le mot-clé "${targetKeyword}"`);
          
          // Afficher l'alerte avec les tables consolidées HTML
          if (criteriaTablesHTML && tablesCount > 0) {
            alert(`✅ DÉTECTION DYNAMIQUE RÉUSSIE!\n\nMot-clé détecté: "${targetKeyword}"\nTables HTML consolidées: ${tablesCount} table(s)\n\n` + 
                  criteriaTablesHTML.substring(0, 800) + 
                  (criteriaTablesHTML.length > 800 ? '... [tronqué pour affichage]' : ''));
            
            // Envoyer la requête à n8n
            const response = await queryN8nEndpoint(criteriaTablesHTML);
            
            if (!response) {
              throw new Error('Réponse n8n vide');
            }
            
            console.log('📩 Réponse n8n reçue:', response);
            
            // Traitement de la réponse JSON n8n
            let downloadUrl = null;
            
            // Si la réponse est un array (comme dans l'exemple)
            if (Array.isArray(response) && response.length > 0 && response[0].Telecharger) {
              downloadUrl = response[0].Telecharger;
            }
            // Si la réponse est un objet direct
            else if (response.Telecharger) {
              downloadUrl = response.Telecharger;
            }
            
            if (!downloadUrl) {
              throw new Error('URL de téléchargement introuvable dans la réponse n8n');
            }
            
            console.log(`📁 URL de téléchargement extraite: ${downloadUrl}`);
            
            // Mettre à jour le conteneur
            const container = document.getElementById(containerId);
            if (!container) {
              console.error('Conteneur n8n introuvable');
              return;
            }
            
            // Créer la table de téléchargement
            const downloadTable = createDownloadTable(downloadUrl);
            
            // Mettre à jour le conteneur avec la table de téléchargement
            container.innerHTML = '';
            container.appendChild(downloadTable);
            
            console.log(`✅ Table de téléchargement créée pour le mot-clé "${targetKeyword}"`);
            
          } else {
            alert(`⚠️ PROBLÈME DE DÉTECTION DYNAMIQUE!\n\nMot-clé recherché: "${targetKeyword}"\nAucune table correspondante trouvée.\n\nVérifiez que:\n1. Il existe des tables avec colonnes "Rubrique" et "Description"\n2. Au moins une cellule contient le mot-clé "${targetKeyword}"`);
            
            const container = document.getElementById(containerId);
            if (container) {
              const errorDiv = document.createElement('div');
              errorDiv.className = 'text-orange-500 p-3 bg-orange-50 rounded';
              errorDiv.innerHTML = `<strong>Aucune table "${targetKeyword}" détectée:</strong> Vérifiez les critères dans la console.`;
              container.innerHTML = '';
              container.appendChild(errorDiv);
            }
          }
          
        } catch (error) {
          console.error('⚠️ Erreur n8n:', error);
          alert(`⚠️ ERREUR N8N DYNAMIQUE!\n\nMot-clé: "${targetKeyword}"\nErreur: ${error.message}`);
          
          const container = document.getElementById(containerId);
          if (!container) return;
          
          const errorDiv = document.createElement('div');
          errorDiv.className = 'text-red-500 p-3 bg-red-50 rounded';
          errorDiv.innerHTML = `<strong>Erreur n8n (${targetKeyword}):</strong> ${error.message}`;
          container.innerHTML = '';
          container.appendChild(errorDiv);
        }
      };

      // Lancer la requête
      processN8nRequest();
      
      return;
    }

    // Traitement normal pour les cas 1-4 avec recherche dynamique
    if (caseType <= 4 && !hasCriteriaContainer && targetKeyword) {
      const container = document.createElement('div');
      container.className = 'criteria-tables-container';
      container.style.marginTop = '10px';

      // Utiliser la fonction de recherche dynamique
      const criteriaTablesHTML = getCriteriaTablesWithDynamicKeyword(targetKeyword);
      
      if (criteriaTablesHTML) {
        // Parser et ajouter les tables HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(criteriaTablesHTML, 'text/html');
        const tables = doc.querySelectorAll('table');
        
        tables.forEach((table, tableIndex) => {
          const clone = table.cloneNode(true);
          container.appendChild(clone);
          
          if (tableIndex < tables.length - 1) {
            const spacer = document.createElement('div');
            spacer.style.height = '10px';
            container.appendChild(spacer);
          }
        });
        
        console.log(`✅ ${tables.length} table(s) de critères ajoutée(s) pour le cas ${caseType} (mot-clé: ${targetKeyword})`);
      }

      if (container.children.length > 0) {
        targetTable.insertAdjacentElement('afterend', container);
      } else {
        console.log(`⚠️ Aucune table correspondante trouvée pour le cas ${caseType} (mot-clé: ${targetKeyword})`);
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
  console.log('🚀 Initialisation du système dynamique de tables de critères (n8n)');
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
  console.log('🔧 Mise à jour manuelle des tables dynamiques (n8n)');
  addCriteriaTablesToChatTables();
};