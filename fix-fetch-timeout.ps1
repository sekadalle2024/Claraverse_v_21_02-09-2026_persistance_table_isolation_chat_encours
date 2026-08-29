# Script pour ajouter un timeout au fetch() dans EtatFinAutoTrigger.js
# Cela évite que le navigateur attende indéfiniment

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔧 AJOUT TIMEOUT AU FETCH() - ETAT FIN" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$file = "public/EtatFinAutoTrigger.js"

if (-not (Test-Path $file)) {
    Write-Host "❌ Fichier non trouvé: $file" -ForegroundColor Red
    exit 1
}

Write-Host "📂 Fichier trouvé: $file" -ForegroundColor Green
Write-Host ""

# Lire le contenu
$content = Get-Content $file -Raw -Encoding UTF8

# Vérifier si le timeout est déjà ajouté
if ($content -match "AbortController") {
    Write-Host "✅ Le timeout est déjà configuré dans le fichier" -ForegroundColor Green
    Write-Host "   Aucune modification nécessaire" -ForegroundColor Gray
    exit 0
}

Write-Host "🔄 Ajout du timeout au fetch()..." -ForegroundColor Yellow
Write-Host ""

# Chercher la fonction sendToBackend
$oldCode = @'
  async function sendToBackend(file) {
    console.group("📤 ENVOI VERS BACKEND");
    console.log("📁 Fichier:", file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
    console.log("🌐 Endpoint:", CONFIG.ETAT_FIN.endpoint);

    const fileBase64 = await readFileAsBase64(file);
    console.log("✅ Fichier encodé en base64:", fileBase64.length, "caractères");

    const response = await fetch(CONFIG.ETAT_FIN.endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        file_base64: fileBase64,
        filename: file.name
      })
    });

    console.log("📥 Statut réponse:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Erreur backend:", errorData);
      console.groupEnd();
      throw new Error(errorData.detail || `Erreur HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Résultat reçu:", result);
    console.groupEnd();

    return result;
  }
'@

$newCode = @'
  async function sendToBackend(file) {
    console.group("📤 ENVOI VERS BACKEND");
    console.log("📁 Fichier:", file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
    console.log("🌐 Endpoint:", CONFIG.ETAT_FIN.endpoint);

    const fileBase64 = await readFileAsBase64(file);
    console.log("✅ Fichier encodé en base64:", fileBase64.length, "caractères");

    // Créer un AbortController pour gérer le timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn("⏱️ Timeout atteint (120 secondes)");
      controller.abort();
    }, 120000); // 120 secondes = 2 minutes

    try {
      console.log("⏱️ Timeout configuré: 120 secondes");
      
      const response = await fetch(CONFIG.ETAT_FIN.endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          file_base64: fileBase64,
          filename: file.name
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log("📥 Statut réponse:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Erreur backend:", errorData);
        console.groupEnd();
        throw new Error(errorData.detail || `Erreur HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Résultat reçu:", result);
      console.groupEnd();

      return result;
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.groupEnd();
      
      if (error.name === 'AbortError') {
        throw new Error('⏱️ Timeout: Le traitement prend trop de temps (> 2 minutes). Vérifiez que le backend est démarré et fonctionne correctement.');
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('🌐 Erreur réseau: Impossible de contacter le backend. Vérifiez que le serveur Python est démarré (http://127.0.0.1:5000)');
      }
      
      throw error;
    }
  }
'@

# Remplacer le code
$newContent = $content.Replace($oldCode, $newCode)

if ($newContent -eq $content) {
    Write-Host "⚠️ Le code n'a pas été trouvé exactement" -ForegroundColor Yellow
    Write-Host "   Le fichier a peut-être été modifié" -ForegroundColor Yellow
    Write-Host "   Modification manuelle nécessaire" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Modifications à faire manuellement:" -ForegroundColor Cyan
    Write-Host "   1. Ouvrir: $file" -ForegroundColor Gray
    Write-Host "   2. Chercher la fonction: async function sendToBackend(file)" -ForegroundColor Gray
    Write-Host "   3. Ajouter avant le fetch():" -ForegroundColor Gray
    Write-Host "      const controller = new AbortController();" -ForegroundColor DarkGray
    Write-Host "      const timeoutId = setTimeout(() => controller.abort(), 120000);" -ForegroundColor DarkGray
    Write-Host "   4. Ajouter dans le fetch(): signal: controller.signal" -ForegroundColor Gray
    Write-Host "   5. Entourer le fetch() d'un try/catch pour gérer AbortError" -ForegroundColor Gray
    exit 1
}

# Sauvegarder le fichier
Set-Content $file -Value $newContent -Encoding UTF8 -NoNewline

Write-Host "✅ Timeout ajouté avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 MODIFICATIONS APPLIQUÉES:" -ForegroundColor Cyan
Write-Host "   - Timeout: 120 secondes (2 minutes)" -ForegroundColor Gray
Write-Host "   - Message d'erreur explicite si timeout" -ForegroundColor Gray
Write-Host "   - Message d'erreur explicite si backend inaccessible" -ForegroundColor Gray
Write-Host ""
Write-Host "🔄 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Rafraîchir la page dans le navigateur (Ctrl+F5)" -ForegroundColor Gray
Write-Host "   2. Tester l'import de la balance" -ForegroundColor Gray
Write-Host "   3. Observer les messages d'erreur plus détaillés" -ForegroundColor Gray
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
