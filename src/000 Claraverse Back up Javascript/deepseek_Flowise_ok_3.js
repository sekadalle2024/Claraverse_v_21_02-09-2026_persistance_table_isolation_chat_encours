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
      
      // Créer la table HTML avec structure complète
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