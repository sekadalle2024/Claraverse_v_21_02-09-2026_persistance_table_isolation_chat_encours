// Markdown Generator - Version simplifiée passthrough
// Le frontend (claraApiService.ts) gère maintenant la conversion Markdown

try {
  const inputData = $input.first().json;
  
  // Simplement passer les données au webhook
  // Le frontend FORMAT 4 attend: { "data": { "Etape mission - ...": [...] } }
  
  return {
    json: inputData,
    status: 'success',
    timestamp: new Date().toISOString(),
    note: 'Conversion Markdown gérée par le frontend'
  };
  
} catch (error) {
  return {
    json: {
      data: {
        "Erreur": [{
          "table 1": {
            "Message": error.message,
            "Type": "Erreur passthrough"
          }
        }]
      }
    },
    status: 'error',
    timestamp: new Date().toISOString()
  };
}
