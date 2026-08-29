function getCriteriaTablesWithKeyword() {
  const tablesHTML = [];
  
  // Recherche de toutes les tables de critères
  const allContainers = document.querySelectorAll('.criteria-tables-container');
  
  allContainers.forEach(container => {
    const tables = container.querySelectorAll('table');
    
    tables.forEach(table => {
      const headers = Array.from(table.querySelectorAll('th')).map(th => 
        th.textContent.trim().toLowerCase()
      );
      
      // Vérification des colonnes "rubrique" et "description"
      if (headers.includes('rubrique') && headers.includes('description')) {
        let foundKeyword = false;
        
        // Recherche du mot-clé "Frap" dans la colonne Description
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length > 1) {
            const descriptionCell = cells[1].textContent.trim();
            // Vérification des variations de "Frap"
            if (descriptionCell.match(/\b(Frap|FRAP|frap)\b/i)) {
              foundKeyword = true;
            }
          }
        });
        
        // Ajout du outerHTML de la table si le mot-clé est trouvé
        if (foundKeyword) {
          tablesHTML.push(table.outerHTML);
        }
      }
    });
  });
  
  return tablesHTML.join('\n');
}