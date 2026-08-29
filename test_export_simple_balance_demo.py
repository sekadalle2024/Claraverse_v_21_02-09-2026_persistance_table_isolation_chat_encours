# -*- coding: utf-8 -*-
"""
Test simplifié de l'export de la liasse avec la balance demo
"""
import os

print("="*80)
print("TEST EXPORT LIASSE - VÉRIFICATION PRÉALABLE")
print("="*80)
print()

# Vérifier les fichiers nécessaires
fichiers_requis = {
    "Balance demo": "P000 -BALANCE DEMO N_N-1_N-2.xls",
    "Template liasse": "py_backend/Liasse_officielle_revise.xlsx",
    "Export liasse": "py_backend/export_liasse.py",
    "États financiers": "py_backend/etats_financiers.py",
    "Correspondances": "py_backend/correspondances_syscohada.json"
}

tous_presents = True
for nom, chemin in fichiers_requis.items():
    if os.path.exists(chemin):
        taille = os.path.getsize(chemin) / 1024
        print(f"✅ {nom}: {chemin} ({taille:.2f} KB)")
    else:
        print(f"❌ {nom}: {chemin} - MANQUANT")
        tous_presents = False

print()

if not tous_presents:
    print("❌ Certains fichiers sont manquants")
    print()
    print("Pour tester l'export:")
    print("  1. Placer 'P000 -BALANCE DEMO N_N-1_N-2.xls' à la racine")
    print("  2. S'assurer que le backend est démarré")
    print("  3. Utiliser l'interface web pour importer la balance")
    print()
else:
    print("✅ Tous les fichiers sont présents")
    print()
    print("="*80)
    print("INSTRUCTIONS POUR TESTER L'EXPORT")
    print("="*80)
    print()
    print("MÉTHODE 1: Via l'interface web (RECOMMANDÉ)")
    print("-" * 80)
    print("1. Démarrer le backend:")
    print("   cd py_backend")
    print("   conda activate base")
    print("   python main.py")
    print()
    print("2. Ouvrir l'interface web:")
    print("   http://localhost:8000")
    print()
    print("3. Dans le chat, taper: Etat fin")
    print()
    print("4. Importer la balance demo:")
    print("   P000 -BALANCE DEMO N_N-1_N-2.xls")
    print()
    print("5. Vérifier que les états financiers s'affichent")
    print("   - Bilan Actif")
    print("   - Bilan Passif")
    print("   - Compte de Résultat")
    print("   - TFT (Tableau des Flux de Trésorerie)")
    print()
    print("6. Exporter la liasse:")
    print("   Cliquer sur le bouton 'Exporter la liasse'")
    print()
    print("7. Ouvrir le fichier Excel généré")
    print("   Vérifier l'onglet TFT")
    print()
    print()
    print("MÉTHODE 2: Test direct avec curl")
    print("-" * 80)
    print("1. Démarrer le backend (voir méthode 1)")
    print()
    print("2. Tester l'endpoint:")
    print('   curl -X POST "http://localhost:8000/api/etats-financiers/calculer" \\')
    print('        -H "Content-Type: multipart/form-data" \\')
    print('        -F "file=@P000 -BALANCE DEMO N_N-1_N-2.xls"')
    print()
    print()
    print("MÉTHODE 3: Script PowerShell de test")
    print("-" * 80)
    print("Créer un script test-export-balance-demo.ps1:")
    print()
    print("# Vérifier que le backend est démarré")
    print('$response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET')
    print('if ($response.StatusCode -eq 200) {')
    print('    Write-Host "✅ Backend démarré"')
    print('} else {')
    print('    Write-Host "❌ Backend non démarré"')
    print('    exit 1')
    print('}')
    print()
    print("# Importer la balance")
    print('$file = "P000 -BALANCE DEMO N_N-1_N-2.xls"')
    print('$uri = "http://localhost:8000/api/etats-financiers/calculer"')
    print()
    print('$response = Invoke-RestMethod -Uri $uri -Method Post -InFile $file')
    print('Write-Host "✅ États financiers calculés"')
    print()
    print('# Vérifier le TFT')
    print('if ($response.tft) {')
    print('    Write-Host "✅ TFT présent dans la réponse"')
    print('    $response.tft | ConvertTo-Json -Depth 3')
    print('} else {')
    print('    Write-Host "❌ TFT absent"')
    print('}')
    print()

print("="*80)
print("VÉRIFICATIONS À EFFECTUER")
print("="*80)
print()
print("Après l'export, vérifier dans le fichier Excel:")
print()
print("1. Onglet TFT existe")
print("   ✓ Onglet 'TFT' présent dans la liste des onglets")
print()
print("2. Cellules TFT remplies")
print("   ✓ C10 (ZA): Trésorerie ouverture")
print("   ✓ C12 (FA): CAFG")
print("   ✓ C19 (ZB): Total flux opérationnels")
print("   ✓ C26 (ZC): Total flux investissement")
print("   ✓ C32 (ZD): Total flux capitaux propres")
print("   ✓ C37 (ZE): Total flux capitaux étrangers")
print("   ✓ C40 (ZH): Trésorerie clôture")
print()
print("3. Montants cohérents")
print("   ✓ Les montants correspondent aux calculs")
print("   ✓ ZH = ZA + ZG (cohérence)")
print()
print("4. Autres onglets")
print("   ✓ BILAN rempli")
print("   ✓ RESULTAT rempli")
print()
