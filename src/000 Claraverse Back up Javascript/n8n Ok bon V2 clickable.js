//
function addCriteriaTablesToChatTables() {
    console.log('🔍 Recherche des tables dans le chat...');
    
    const chatTables = document.querySelectorAll('div.prose.prose-base.dark\\:prose-invert.max-w-none table.min-w-full.border.border-gray-200.dark\\:border-gray-700.rounded-lg');
    
    console.log(`📊 ${chatTables.length} table(s) cible(s) trouvée(s)`);
  
    // Configuration des mots-clés de recherche dynamiques
    const SEARCH_KEYWORDS = {
      'frap': ['frap', 'FRAP', 'Frap'],
      'synthese': ['synthese', 'SYNTHESE', 'Synthèse', 'Synthese', 'synth', 'SYNTH', 'Synth'],
      'rapport': ['rapport', 'RAPPORT', 'Rapport', 'rapport provisoire', 'rapport final'],
      'suivi': ['suivi', 'SUIVI', 'Suivi', 'suivi recos', 'SUIVI RECOS'],
      'telecharger': ['telecharger', 'TELECHARGER', 'Télécharger', 'télécharger', 'download', 'DOWNLOAD']
    };
  
    // Fonction pour interroger l'endpoint n8n
    async function queryN8nEndpoint(question) {
      try {
        // URL de l'endpoint n8n fourni
        const response = await fetch(
          "https://s9rx55es.rpcd.host/webhook/80ba75d3-8828-423f-b508-9e41826b0593",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
          }
        );
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Erreur n8n:', error);
        return null;
      }
    }
  
    // Fonction pour interroger l'endpoint Flowise
    async function queryFlowiseEndpoint(question) {
      try {
        const response = await fetch(
          "https://r534c2br.rpcld.co/api/v1/prediction/4c5609b5-0880-45ab-8c67-810b16d27e4a",
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
  
    // Fonction pour détecter le mot-clé cible dans une table Flowise
    function detectTargetKeywordInFlowiseTable(flowiseTable) {
      const allCells = flowiseTable.querySelectorAll('td');
      
      for (const [keywordGroup, variations] of Object.entries(SEARCH_KEYWORDS)) {
        for (const cell of allCells) {
          const cellText = cell.textContent.trim();
          
          if (variations.some(keyword => 
            cellText.toLowerCase().includes(keyword.toLowerCase()) ||
            cellText.match(new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'i'))
          )) {
            console.log(`🎯 Mot-clé cible "${keywordGroup}" détecté dans table Flowise:`, cellText);
            return keywordGroup;
          }
        }
      }
      
      return null;
    }
  
    // Fonction spéciale pour créer la table de téléchargement
    function createDownloadTable(downloadUrl) {
      const table = document.createElement('table');
      table.className = 'min-w-full border border-gray-200 dark:border-gray-700 rounded-lg mb-2 download-table';
      
      // Créer l'en-tête
      const thead = document.createElement('thead');
      const headerTr = document.createElement('tr');
      const th = document.createElement('th');
      th.className = 'px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-green-100 dark:bg-green-800';
      th.textContent = 'Télécharger';
      headerTr.appendChild(th);
      thead.appendChild(headerTr);
      table.appendChild(thead);
      
      // Créer le corps avec le lien
      const tbody = document.createElement('tbody');
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.className = 'px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-center';
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'text-blue-600 dark:text-blue-400 hover:underline font-medium';
      link.textContent = '📥 Cliquez ici pour télécharger le document';
      
      // Ajouter un événement de clic pour s'assurer que le lien fonctionne
      link.addEventListener('click', function(e) {
        // S'assurer que le lien s'ouvre même si quelque chose bloque les événements par défaut
        e.stopPropagation();
        window.open(this.href, '_blank');
      });
      
      // Ajouter également un gestionnaire pour les appareils tactiles
      link.addEventListener('touchend', function(e) {
        e.stopPropagation();
        window.open(this.href, '_blank');
      });
      
      td.appendChild(link);
      tr.appendChild(td);
      tbody.appendChild(tr);
      table.appendChild(tbody);
      
      return table;
    }
  
    chatTables.forEach((targetTable, index) => {
      const parentDiv = targetTable.closest('div.prose.prose-base.dark\\:prose-invert.max-w-none');
      
      if (!parentDiv) return;
  
      // Vérifier les conteneurs existants
      const hasCriteriaContainer = parentDiv.querySelector('.criteria-tables-container');
      const hasFlowiseContainer = parentDiv.querySelector('.flowise-tables-container');
      const hasDownloadContainer = parentDiv.querySelector('.download-table-container');
      
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
        // Pour Flowise, on détecte dynamiquement le mot-clé cible
        targetKeyword = detectTargetKeywordInFlowiseTable(targetTable);
      }
      else if (headerCheck(["Télécharger", "Telecharger", "TELECHARGER"])) {
        caseType = 6; // Nouveau cas pour les tables de téléchargement
        targetKeyword = 'telecharger';
      }
      
      if (caseType === 0) {
        console.log(`ℹ️ Table ${index+1} non concernée par les cas dynamiques`);
        return;
      }
      
      console.log(`➕ Traitement table ${index+1} - Cas ${caseType} - Mot-clé cible: ${targetKeyword || 'N/A'}`);
  
      // Traitement spécial pour le Cas 6 (Télécharger) - Version n8n
      if (caseType === 6 && !hasDownloadContainer) {
        const containerId = `download-container-${Date.now()}`;
        const container = document.createElement('div');
        container.id = containerId;
        container.className = 'download-table-container';
        container.style.marginTop = '10px';
        container.style.padding = '0';
        
        // Ajouter l'indicateur de chargement
        const loader = document.createElement('div');
        loader.className = 'text-center py-2 text-green-600 font-semibold';
        loader.textContent = 'Chargement du lien de téléchargement...';
        container.appendChild(loader);
        
        targetTable.insertAdjacentElement('afterend', container);
        console.log('🌐 Démarrage de la requête n8n pour le téléchargement');
  
        // Traitement de la requête n8n
        const processN8nRequest = async () => {
          try {
            // Envoyer la requête à n8n
            const response = await queryN8nEndpoint("Téléchargement document");
            
            if (!response) {
              throw new Error('Réponse n8n vide');
            }
            
            console.log('📩 Réponse n8n reçue', response);
            
            // Extraire l'URL de téléchargement
            let downloadUrl = null;
            
            if (response.Telecharger) {
              downloadUrl = response.Telecharger;
            } else if (Array.isArray(response) && response[0] && response[0].Telecharger) {
              downloadUrl = response[0].Telecharger;
            } else if (response.url) {
              downloadUrl = response.url;
            } else {
              throw new Error('Format de réponse n8n non reconnu');
            }
            
            // Vérifier que l'URL est valide
            if (!downloadUrl.startsWith('http')) {
              downloadUrl = 'https://' + downloadUrl;
            }
            
            // Créer la table de téléchargement
            const downloadTable = createDownloadTable(downloadUrl);
            
            // Mettre à jour le conteneur
            const container = document.getElementById(containerId);
            if (!container) {
              console.error('Conteneur de téléchargement introuvable');
              return;
            }
            
            container.innerHTML = '';
            container.appendChild(downloadTable);
            
            console.log('✅ Table de téléchargement créée avec succès');
            
          } catch (error) {
            console.error('❌ Erreur n8n:', error);
            
            const container = document.getElementById(containerId);
            if (!container) return;
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-red-500 p-3 bg-red-50 rounded';
            errorDiv.innerHTML = `<strong>Erreur de téléchargement:</strong> ${error.message}`;
            container.innerHTML = '';
            container.appendChild(errorDiv);
          }
        };
  
        // Lancer la requête
        processN8nRequest();
        
        return;
      }
  
      // Traitement spécial pour le Cas 5 (Flowise) - Version dynamique
      if (caseType === 5 && !hasFlowiseContainer && targetKeyword) {
        const containerId = `flowise-container-${Date.now()}`;
        const container = document.createElement('div');
        container.id = containerId;
        container.className = 'flowise-tables-container';
        container.style.marginTop = '10px';
        container.style.padding = '0';
        
        // Ajouter l'indicateur de chargement
        const loader = document.createElement('div');
        loader.className = 'text-center py-2 text-indigo-600 font-semibold';
        loader.textContent = `Chargement des tables Flowise (${targetKeyword})...`;
        container.appendChild(loader);
        
        targetTable.insertAdjacentElement('afterend', container);
        console.log(`🌐 Démarrage de la requête Flowise pour le mot-clé: ${targetKeyword}`);
  
        // Traitement de la requête Flowise avec détection dynamique
        const processFlowiseRequest = async () => {
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
              
              // Envoyer la requête à Flowise
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
                  table.style.marginBottom = '5px';
                  tablesContainer.appendChild(table);
                });
                console.log(`✅ ${tables.length} table(s) ajoutée(s) pour le mot-clé "${targetKeyword}"`);
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
              alert(`❌ PROBLÈME DE DÉTECTION DYNAMIQUE!\n\nMot-clé recherché: "${targetKeyword}"\nAucune table correspondante trouvée.\n\nVérifiez que:\n1. Il existe des tables avec colonnes "Rubrique" et "Description"\n2. Au moins une cellule contient le mot-clé "${targetKeyword}"`);
              
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
            console.error('❌ Erreur Flowise:', error);
            alert(`❌ ERREUR FLOWISE DYNAMIQUE!\n\nMot-clé: "${targetKeyword}"\nErreur: ${error.message}`);
            
            const container = document.getElementById(containerId);
            if (!container) return;
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-red-500 p-3 bg-red-50 rounded';
            errorDiv.innerHTML = `<strong>Erreur Flowise (${targetKeyword}):</strong> ${error.message}`;
            container.innerHTML = '';
            container.appendChild(errorDiv);
          }
        };
  
        // Lancer la requête
        processFlowiseRequest();
        
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
    console.log('🚀 Initialisation du système dynamique de tables de critères');
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
    console.log('🔧 Mise à jour manuelle des tables dynamiques');
    addCriteriaTablesToChatTables();
  };