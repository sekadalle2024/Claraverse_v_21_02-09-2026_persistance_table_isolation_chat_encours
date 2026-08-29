function formatFlowiseResponseAsTable(responseText) {
  // Crée une table HTML à partir de n'importe quelle réponse
  const table = document.createElement('table');
  table.className = 'min-w-full border border-gray-200 dark:border-gray-700 rounded-lg';
  
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.className = 'px-4 py-3 border-b border-gray-200 dark:border-gray-700';
  cell.innerHTML = responseText;
  
  row.appendChild(cell);
  table.appendChild(row);
  
  return [table];
}