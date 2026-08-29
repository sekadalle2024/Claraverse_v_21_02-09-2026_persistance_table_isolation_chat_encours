const rowText = "| text1 |   | text3 |  |";
let cells = rowText.split("|").filter(cell => cell.trim() !== '');
console.log(cells);
