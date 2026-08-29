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

  // Fonction pour extraire les mots-clés depuis les tables avec en-tête "Flowise"
  function extractKeywordsFromFlowiseTables() {
    const keywords = new Set();
    
    console.log('🔍 Recherche des tables avec en-tête "Flowise" pour extraire les mots-clés...');
    
    // Rechercher toutes les tables avec l'en-tête "Flowise"
    const allTables = document.querySelectorAll('div.prose.prose-base.dark\\:prose-invert.max-w-none table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg');
    
    allTables.forEach((table, index) => {
      const headers = Array.from(table.querySelectorAll('th')).map(th => 
        th.textContent.trim()
      );
      
      // Vérifier si la table a une colonne "Flowise" (variations)
      const hasFlowiseHeader = headers.some(header => 
        header.toLowerCase() === 'flowise'
      );
      
      if (hasFlowiseHeader) {
        console.log(`✅ Table Flowise trouvée (${index + 1})`);
        
        // Extraire tous les mots des cellules de cette table
        const allCells = table.querySelectorAll('td');
        allCells.forEach(cell => {
          const cellText = cell.textContent.trim();
          if (cellText) {
            // Diviser par espaces et virgules pour extraire les mots individuels
            const words = cellText.split(/[\s,;]+/).filter(word => 
              word.length > 2 && word.match(/^[a-zA-ZÀ-ÿ]+$/)
            );
            words.forEach(word => {
              keywords.add(word.toLowerCase());
              console.log(`🔑 Mot-clé extrait: "${word}"`);
            });
          }
        });
      }
    });
    
    const keywordsArray = Array.from(keywords);
    console.log(`📊 Total mots-clés extraits: ${keywordsArray.length}`, keywordsArray);
    return keywordsArray;
  }

  // Fonction dynamique pour collecter les tables selon les mots-clés détectés
  function getCriteriaTablesWithDynamicKeywords() {
    const tablesHTML = [];
    const processedDivs = new Set();
    
    // Étape 1: Extraire les mots-clés depuis les tables Flowise
    const targetKeywords = extractKeywordsFromFlowiseTables();
    
    if (targetKeywords.length === 0) {
      console.log('❌ Aucun mot-clé trouvé dans les tables Flowise');
      return '';
    }
    
    console.log(`🎯 Recherche des divs contenant les mots-clés: ${targetKeywords.join(', ')}`);
    
    // Étape 2: Rechercher les divs dont le premier tableau contient ces mots-clés
    const allDivs = document.querySelectorAll('div.prose.prose-base.dark\\:prose-invert.max-w-none');
    
    allDivs.forEach((div, divIndex) => {
      if (processedDivs.has(div)) return;
      
      // Récupérer le PREMIER tableau de cette div
      const firstTable = div.querySelector('table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg');
      
      if (!firstTable) return;
      
      console.log(`🔍 Analyse div ${divIndex + 1} - Premier tableau...`);
      
      // Analyser toutes les cellules du premier tableau
      const allCells = firstTable.querySelectorAll('td');
      let foundKeyword = false;
      let matchedKeywords = [];
      
      allCells.forEach(cell => {
        const cellText = cell.textContent.trim().toLowerCase();
        
        // Vérifier si cette cellule contient l'un des mots-clés
        targetKeywords.forEach(keyword => {
          if (cellText.includes(keyword)) {
            foundKeyword = true;
            matchedKeywords.push(keyword);
            console.log(`🎯 Mot-clé "${keyword}" trouvé dans la div ${divIndex + 1}`);
          }
        });
      });
      
      // Si des mots-clés sont trouvés, collecter TOUTES les tables de cette div
      if (foundKeyword) {
        processedDivs.add(div);
        
        const allTablesInDiv = div.querySelectorAll('table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg');
        
        console.log(`✅ Div ${divIndex + 1} sélectionnée ! Collecte de ${allTablesInDiv.length} table(s)`);
        console.log(`   Mots-clés correspondants: ${matchedKeywords.join(', ')}`);
        
        allTablesInDiv.forEach((divTable, tableIndex) => {
          tablesHTML.push(divTable.outerHTML);
          console.log(`   ✅ Table ${tableIndex + 1}/${allTablesInDiv.length} ajoutée`);
        });
      } else {
        console.log(`❌ Div ${divIndex + 1} ignorée (aucun mot-clé correspondant)`);
      }
    });
    
    console.log(`📊 Résultat final: ${tablesHTML.length} table(s) HTML collectée(s) depuis ${processedDivs.size} div(s)`);
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
          // Obtenir TOUTES les tables des divs en utilisant la détection dynamique de mots-clés
          const criteriaTablesHTML = getCriteriaTablesWithDynamicKeywords();
          const tablesCount = criteriaTablesHTML ? criteriaTablesHTML.split('</table>').length - 1 : 0;
          console.log(`🔍 ${tablesCount} table(s) HTML collectée(s) avec détection dynamique`);
          
          // Afficher l'alerte avec les tables consolidées HTML
          if (criteriaTablesHTML && tablesCount > 0) {
            alert(`✅ DÉTECTION DYNAMIQUE RÉUSSIE!\n\nTables HTML consolidées collectées (${tablesCount} table(s)):\n\n` + 
                  criteriaTablesHTML.substring(0, 1000) + 
                  (criteriaTablesHTML.length > 1000 ? '... [tronqué pour affichage]' : ''));
            
            // Envoyer la requête à Flowise avec le contenu HTML des tables
            const response = await queryFlowiseEndpoint(criteriaTablesHTML);
            
            if (!response || !response.text) {
              throw new Error('Réponse Flowise vide');
            }
            
            console.log('📩 Réponse Flowise reçue');
            
            // Extraire et convertir les tables de la réponse
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
            
          } else {
            alert('❌ PROBLÈME DE DÉTECTION DYNAMIQUE!\n\nAucune table correspondante trouvée.\n\nVérifiez que:\n1. Il existe une table avec en-tête "Flowise"\n2. Cette table contient des mots-clés dans ses cellules\n3. Ces mots-clés figurent dans le premier tableau d\'autres divs');
            
            // Mettre à jour le conteneur avec un message d'erreur
            const container = document.getElementById(containerId);
            if (container) {
              const errorDiv = document.createElement('div');
              errorDiv.className = 'text-orange-500 p-3 bg-orange-50 rounded';
              errorDiv.innerHTML = '<strong>Aucune correspondance trouvée:</strong> Vérifiez les critères de détection dynamique dans la console.';
              container.innerHTML = '';
              container.appendChild(errorDiv);
            }
          }
          
        } catch (error) {
          console.error('❌ Erreur Flowise:', error);
          alert(`❌ ERREUR FLOWISE!\n\nErreur: ${error.message}`);
          
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

    // Traitement normal pour les cas 1-4 (également corrigé)
    if (caseType <= 4 && !hasCriteriaContainer) {
      const container = document.createElement('div');
      container.className = 'criteria-tables-container';
      container.style.marginTop = '10px';

      // Rechercher dans TOUTES les tables du document, pas seulement dans des conteneurs spécifiques
      const allTables = document.querySelectorAll('div.prose.prose-base.dark\\:prose-invert.max-w-none table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg');
      
      allTables.forEach(table => {
        const tableParentDiv = table.closest('div.prose.prose-base.dark\\:prose-invert.max-w-none');
        
        // Éviter la table cible elle-même
        if (tableParentDiv !== parentDiv) {
          const headers = Array.from(table.querySelectorAll('th'))
            .map(th => th.textContent.trim());
          
          const hasRequiredHeaders = headers.some(header => 
            header.toLowerCase() === 'rubrique'
          ) && headers.some(header => 
            header.toLowerCase() === 'description'
          );
          
          if (hasRequiredHeaders) {
            let found = false;
            const allCells = table.querySelectorAll('td');
            
            allCells.forEach(cell => {
              const cellText = cell.textContent.trim();
              
              if (caseKeywords.some(keyword => 
                cellText.toLowerCase().includes(keyword.toLowerCase())
              )) {
                found = true;
              }
            });
            
            if (found) {
              // Ajouter toutes les tables du même conteneur parent
              const siblingTables = tableParentDiv.querySelectorAll('table');
              
              siblingTables.forEach((siblingTable, tableIndex) => {
                const clone = siblingTable.cloneNode(true);
                container.appendChild(clone);
                
                if (tableIndex < siblingTables.length - 1) {
                  const spacer = document.createElement('div');
                  spacer.style.height = '10px';
                  container.appendChild(spacer);
                }
              });
              
              console.log(`✅ ${siblingTables.length} table(s) de critères ajoutée(s) pour le cas ${caseType}`);
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