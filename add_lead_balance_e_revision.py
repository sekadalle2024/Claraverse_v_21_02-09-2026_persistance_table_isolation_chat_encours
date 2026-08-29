#!/usr/bin/env python3
"""
Script pour ajouter l'étape "Lead balance" dans E-revision
Phase: Planification (avant Revue analytique générale)
Mode: Normal avec commande Lead_balance = Activate
"""

import re
import sys
from pathlib import Path

def add_lead_balance_step():
    """Ajoute l'étape Lead balance dans DemarrerMenu.tsx"""
    
    file_path = Path("src/components/Clara_Components/DemarrerMenu.tsx")
    
    if not file_path.exists():
        print(f"❌ Fichier non trouvé: {file_path}")
        return False
    
    # Lire le contenu
    content = file_path.read_text(encoding='utf-8')
    
    # Vérifier si Lead balance existe déjà
    if 'id: \'lead-balance\'' in content or 'label: \'Lead balance\'' in content:
        print("⚠️  L'étape 'Lead balance' existe déjà dans le menu")
        return False
    
    # Définir la nouvelle étape Lead balance
    lead_balance_step = '''          {
            id: 'lead-balance',
            label: 'Lead balance',
            icon: <Calculator className="w-4 h-4" />,
            modes: [
              {
                id: 'normal',
                label: 'Normal',
                command: `Lead_balance = Activate`
              }
            ]
          },
'''
    
    # Pattern pour trouver le début de "Revue analytique générale"
    # On cherche la section "revue-analytique" qui contient les étapes
    pattern = r'(\s+{\s+id: [\'"]revue-analytique[\'"],[^\}]+etapes: \[\s+)(\{\s+id: [\'"]revue-analytique-generale[\'"])'
    
    # Fonction de remplacement
    def replacement(match):
        indent = match.group(1)
        revue_analytique_start = match.group(2)
        return f"{indent}{lead_balance_step}{revue_analytique_start}"
    
    # Effectuer le remplacement
    new_content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)
    
    if count == 0:
        print("❌ Pattern non trouvé - structure du fichier différente")
        print("Recherche d'une alternative...")
        
        # Alternative: chercher directement avant revue-analytique-generale
        alt_pattern = r'(\s+)({\s+id: [\'"]revue-analytique-generale[\'"])'
        
        def alt_replacement(match):
            indent = match.group(1)
            revue_start = match.group(2)
            return f"{indent}{lead_balance_step.strip()}\n{indent}{revue_start}"
        
        new_content, count = re.subn(alt_pattern, alt_replacement, content)
        
        if count == 0:
            print("❌ Impossible de trouver l'emplacement pour insérer Lead balance")
            return False
    
    # Sauvegarder
    file_path.write_text(new_content, encoding='utf-8')
    
    print("✅ Étape 'Lead balance' ajoutée avec succès!")
    print(f"   📍 Position: Phase 'Revue analytique', avant 'Revue analytique générale'")
    print(f"   🎯 Mode: Normal")
    print(f"   📝 Commande: Lead_balance = Activate")
    print(f"   📊 Icône: Calculator")
    
    return True

def main():
    print("=" * 70)
    print("AJOUT DE L'ÉTAPE 'LEAD BALANCE' DANS E-REVISION")
    print("=" * 70)
    print()
    
    success = add_lead_balance_step()
    
    print()
    print("=" * 70)
    if success:
        print("✅ MODIFICATION TERMINÉE AVEC SUCCÈS")
        print()
        print("📋 Prochaines étapes:")
        print("   1. Vérifier le fichier: src/components/Clara_Components/DemarrerMenu.tsx")
        print("   2. Tester dans l'interface Claraverse")
        print("   3. Vérifier que la commande 'Lead_balance = Activate' fonctionne")
    else:
        print("❌ ÉCHEC DE LA MODIFICATION")
        print()
        print("🔍 Actions suggérées:")
        print("   1. Vérifier que le fichier DemarrerMenu.tsx existe")
        print("   2. Vérifier la structure du fichier")
        print("   3. Consulter les logs ci-dessus pour plus de détails")
    print("=" * 70)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
