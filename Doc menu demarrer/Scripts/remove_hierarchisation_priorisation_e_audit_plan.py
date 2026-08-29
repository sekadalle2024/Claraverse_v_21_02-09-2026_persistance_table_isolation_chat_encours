#!/usr/bin/env python3
"""
Script pour retirer les lignes Hiérarchisation et Priorisation des risques
dans E-audit plan pour tous les modes (normal, avancé, database, document)

Date: 15 avril 2026
Auteur: Assistant Kiro
"""

import re
from pathlib import Path

def remove_hierarchisation_priorisation_lines(content: str) -> str:
    """
    Retire les lignes spécifiées pour les étapes Hiérarchisation et Priorisation
    dans E-audit plan pour tous les modes
    
    Lignes à retirer:
    - Hiearchisation des risques[Algorithme]= Hiearchisation
    - Priorisation des risques[Algorithme]= Priorisation
    - Plan annuel d'audit internel- [Algorithme]= Plan annuel d'audit
    """
    
    # Pattern pour identifier la section E-audit plan
    in_e_audit_plan = False
    in_hierarchisation = False
    in_priorisation = False
    in_plan_annuel = False
    
    lines = content.split('\n')
    result_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Détecter le début de E-audit plan
        if "id: 'e-audit-plan'" in line:
            in_e_audit_plan = True
        
        # Détecter la fin de E-audit plan (début d'un autre logiciel)
        if in_e_audit_plan and "id: 'e-cartographie'" in line:
            in_e_audit_plan = False
        
        # Détecter les étapes concernées
        if in_e_audit_plan:
            if "id: 'eap-hierarchisation-risques'" in line:
                in_hierarchisation = True
                in_priorisation = False
                in_plan_annuel = False
            elif "id: 'eap-priorisation-risques'" in line:
                in_hierarchisation = False
                in_priorisation = True
                in_plan_annuel = False
            elif "id: 'eap-plan-annuel-audit'" in line:
                in_hierarchisation = False
                in_priorisation = False
                in_plan_annuel = True
            elif "id: 'eap-rapport-elaboration-plan'" in line:
                in_hierarchisation = False
                in_priorisation = False
                in_plan_annuel = False
        
        # Retirer les lignes spécifiées
        skip_line = False
        
        if in_e_audit_plan:
            # Pour Hiérarchisation des risques
            if in_hierarchisation:
                if '[Etape de mission] = Hiearchisation des risques' in line:
                    # Vérifier si la ligne suivante contient [Algorithme]
                    if i + 1 < len(lines) and '[Algorithme]' in lines[i + 1]:
                        # Garder la ligne actuelle, mais supprimer la suivante
                        result_lines.append(line)
                        i += 2  # Sauter la ligne [Algorithme]
                        continue
            
            # Pour Priorisation des risques
            if in_priorisation:
                if '[Etape de mission] = Priorisation des risques' in line:
                    # Vérifier si la ligne suivante contient [Algorithme]
                    if i + 1 < len(lines) and '[Algorithme]' in lines[i + 1]:
                        # Garder la ligne actuelle, mais supprimer la suivante
                        result_lines.append(line)
                        i += 2  # Sauter la ligne [Algorithme]
                        continue
            
            # Pour Plan annuel d'audit interne
            if in_plan_annuel:
                if '[Etape de mission] = Plan annuel d\'audit interne' in line:
                    # Vérifier si la ligne suivante contient [Algorithme]
                    if i + 1 < len(lines) and '[Algorithme]' in lines[i + 1]:
                        # Garder la ligne actuelle, mais supprimer la suivante
                        result_lines.append(line)
                        i += 2  # Sauter la ligne [Algorithme]
                        continue
        
        result_lines.append(line)
        i += 1
    
    return '\n'.join(result_lines)


def main():
    """Fonction principale"""
    
    # Chemin du fichier
    file_path = Path('src/components/Clara_Components/DemarrerMenu.tsx')
    
    if not file_path.exists():
        print(f"❌ Erreur: Le fichier {file_path} n'existe pas")
        return False
    
    print(f"📖 Lecture de {file_path}...")
    content = file_path.read_text(encoding='utf-8')
    
    print("🔧 Suppression des lignes [Algorithme] pour E-audit plan...")
    modified_content = remove_hierarchisation_priorisation_lines(content)
    
    # Vérifier si des modifications ont été faites
    if content == modified_content:
        print("⚠️  Aucune modification détectée")
        return False
    
    print(f"💾 Sauvegarde des modifications dans {file_path}...")
    file_path.write_text(modified_content, encoding='utf-8')
    
    print("✅ Modifications terminées avec succès!")
    print("\n📋 Résumé des modifications:")
    print("   - Lignes [Algorithme]= Hiearchisation retirées")
    print("   - Lignes [Algorithme]= Priorisation retirées")
    print("   - Lignes [Algorithme]= Plan annuel d'audit retirées")
    print("   - Pour tous les modes: normal, avancé, database, document")
    
    return True


if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
