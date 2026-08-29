const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(`<!DOCTYPE html>`);
global.document = dom.window.document;

/**
 * SIMULATEUR DE PARSAGE MARKDOWN FLOWISE.JS (V17.2 FINAL)
 * Permet de tester les expressions régulières et la logique de nettoyage
 * sans lancer tout le projet React.
 */

function createTableFromMarkdown(headerRow, dataRows) {
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headerTr = document.createElement("tr");

  let cleanHeaderCells = headerRow.split("|").filter(cell => cell.trim() !== '');
  const headerCount = cleanHeaderCells.length;

  cleanHeaderCells.forEach((cellText, index) => {
    const th = document.createElement("th");
    th.textContent = cellText.trim() || `Colonne ${index + 1}`;
    headerTr.appendChild(th);
  });

  thead.appendChild(headerTr);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  dataRows.forEach((rowText, rowIndex) => {
    const tr = document.createElement("tr");

    // ⭐ LOGIQUE V17.2 FINALE : ROBUST PADDING & NO DESTRUCTIVE FILTER
    let rowContent = rowText.trim();
    if (rowContent.startsWith('|')) rowContent = rowContent.substring(1);
    if (rowContent.endsWith('|')) rowContent = rowContent.substring(0, rowContent.length - 1);

    let cells = rowContent.split("|");

    cells.forEach((cellText) => {
      const td = document.createElement("td");
      td.textContent = cellText.trim() || ""; 
      tr.appendChild(td);
    });

    // PADDING : Ajout des colonnes manquantes
    while (tr.children.length < headerCount) {
      const emptyTd = document.createElement("td");
      emptyTd.textContent = "";
      tr.appendChild(emptyTd);
    }

    if (tr.children.length > 0) tbody.appendChild(tr);
  });

  if (tbody.children.length > 0) {
    table.appendChild(tbody);
    return table;
  }
  return null;
}

function cleanEmptyRowsForReport(table) {
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll('td'));
    if (cells.length === 0) return;

    const allEmpty = cells.every(cell => {
      const text = cell.textContent.trim();
      return text === '' || text === '---';
    });

    if (allEmpty) {
      row.remove();
      return;
    }

    const firstCellText = cells[0].textContent.trim();
    const isFirstCellNumeric = /^\d+$/.test(firstCellText);
    
    const isRestEmptyOrMissing = cells.length === 1 || cells.slice(1).every(cell => {
      const text = cell.textContent.trim();
      return text === '' || text === '---';
    });

    if (isFirstCellNumeric && isRestEmptyOrMissing) {
      row.remove();
    }
  });
}

// --- TEST CASE ---
const markdownResponse = `
| Observation | Constat | Risque | Recommandation |
|---|---|---|---|
| Fuite détectée | Vanne 12 | Majeur | Réparer |
| 2 | | | |
| Tuyau percé | Section B | Moyen | |
| 4 | | |
`;

const lines = markdownResponse.split('\n').filter(l => l.includes('|'));
const header = lines[0];
const data = lines.slice(2);

console.log("MARKDOWN SOURCE:\n", markdownResponse);

const table = createTableFromMarkdown(header, data);

console.log("\nTABLE HTML AVANT NETTOYAGE (Verification Padding) :");
table.querySelectorAll('tbody tr').forEach(r => {
  const cells = Array.from(r.querySelectorAll('td')).map(c => `[${c.textContent}]`);
  console.log(cells.join(' '));
});

cleanEmptyRowsForReport(table);

console.log("\nTABLE HTML APRES NETTOYAGE V17.2 :");
table.querySelectorAll('tbody tr').forEach(r => {
  const cells = Array.from(r.querySelectorAll('td')).map(c => `[${c.textContent}]`);
  console.log(cells.join(' '));
});
