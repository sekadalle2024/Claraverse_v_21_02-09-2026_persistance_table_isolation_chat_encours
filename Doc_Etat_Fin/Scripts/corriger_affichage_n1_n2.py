# -*- coding: utf-8 -*-
"""
Script de correction pour afficher les colonnes N, N-1 et N-2 dans les états financiers
Corrige la fonction generate_section_html_liasse pour afficher 3 colonnes au lieu de 2
"""

import os
import re


def corriger_generate_section_html_liasse():
    """Corrige la fonction generate_section_html_liasse pour afficher 3 colonnes"""
    
    fichier = "py_backend/etats_financiers_v2.py"
    
    if not os.path.exists(fichier):
        print(f"❌ Fichier non trouvé: {fichier}")
        return False
    
    print(f"📂 Lecture de {fichier}...")
    
    with open(fichier, 'r', encoding='utf-8') as f:
        contenu = f.read()
    
    # Chercher la fonction generate_section_html_liasse
    pattern_fonction = r'def generate_section_html_liasse\([^)]+\) -> str:'
    
    if not re.search(pattern_fonction, contenu):
        print("❌ Fonction generate_section_html_liasse non trouvée")
        return False
    
    # Remplacer l'en-tête du tableau (ajouter colonne N-2)
    ancien_thead = r'''<thead>
                    <tr>
                        <th style="width: 60px;">REF</th>
                        <th style="width: auto;">LIBELLÉS</th>
                        <th style="width: 60px;">NOTE</th>
                        <th style="width: 150px; text-align: right;">{exercice_n_label}</th>
                        <th style="width: 150px; text-align: right;">{exercice_n1_label}</th>
                    </tr>
                </thead>'''
    
    nouveau_thead = r'''<thead>
                    <tr>
                        <th style="width: 60px;">REF</th>
                        <th style="width: auto;">LIBELLÉS</th>
                        <th style="width: 60px;">NOTE</th>
                        <th style="width: 150px; text-align: right;">{exercice_n_label}</th>
                        <th style="width: 150px; text-align: right;">{exercice_n1_label}</th>
                        <th style="width: 150px; text-align: right;">{exercice_n2_label}</th>
                    </tr>
                </thead>'''
    
    if ancien_thead in contenu:
        contenu = contenu.replace(ancien_thead, nouveau_thead)
        print("✅ En-tête du tableau corrigé (ajout colonne N-2)")
    else:
        print("⚠️ En-tête du tableau non trouvé (peut-être déjà corrigé)")
    
    # Remplacer les lignes du tableau (ajouter cellule N-2)
    ancien_tr = r'''montant_n = poste.get\('montant_n', 0\)
        montant_n1 = poste.get\('montant_n1', 0\)
        
        # Déterminer si c'est un poste de totalisation
        is_total = ref.startswith\('X'\) or ref == 'DZ' or libelle.isupper\(\) or 'TOTAL' in libelle.upper\(\)
        row_class = 'total-row' if is_total else ''
        
        html \+= f"""
                    <tr class="\{row_class\}">
                        <td class="ref-cell">\{ref\}</td>
                        <td class="libelle-cell">\{libelle\}</td>
                        <td class="note-cell">\{note\}</td>
                        <td class="montant-cell">\{format_montant_liasse\(montant_n\)\}</td>
                        <td class="montant-cell">\{format_montant_liasse\(montant_n1\)\}</td>
                    </tr>
        """'''
    
    nouveau_tr = '''montant_n = poste.get('montant_n', 0)
        montant_n1 = poste.get('montant_n1', 0)
        montant_n2 = poste.get('montant_n2', 0)
        
        # Déterminer si c'est un poste de totalisation
        is_total = ref.startswith('X') or ref == 'DZ' or libelle.isupper() or 'TOTAL' in libelle.upper()
        row_class = 'total-row' if is_total else ''
        
        html += f"""
                    <tr class="{row_class}">
                        <td class="ref-cell">{ref}</td>
                        <td class="libelle-cell">{libelle}</td>
                        <td class="note-cell">{note}</td>
                        <td class="montant-cell">{format_montant_liasse(montant_n)}</td>
                        <td class="montant-cell">{format_montant_liasse(montant_n1)}</td>
                        <td class="montant-cell">{format_montant_liasse(montant_n2)}</td>
                    </tr>
        """'''
    
    if re.search(ancien_tr, contenu):
        contenu = re.sub(ancien_tr, nouveau_tr, contenu)
        print("✅ Lignes du tableau corrigées (ajout cellule N-2)")
    else:
        print("⚠️ Lignes du tableau non trouvées (peut-être déjà corrigées)")
    
    # Sauvegarder le fichier
    print(f"\n💾 Sauvegarde de {fichier}...")
    
    with open(fichier, 'w', encoding='utf-8') as f:
        f.write(contenu)
    
    print("✅ Fichier sauvegardé avec succès")
    
    return True


def main():
    """Fonction principale"""
    print("═══════════════════════════════════════════════════════════════")
    print("  🔧 CORRECTION AFFICHAGE N-1 ET N-2")
    print("═══════════════════════════════════════════════════════════════")
    print()
    print("Objectif: Afficher les 3 colonnes N, N-1 et N-2 dans les états")
    print()
    
    # Corriger la fonction
    if corriger_generate_section_html_liasse():
        print()
        print("═══════════════════════════════════════════════════════════════")
        print("  ✅ CORRECTION TERMINÉE")
        print("═══════════════════════════════════════════════════════════════")
        print()
        print("📋 Prochaines étapes:")
        print("  1. Tester avec: python generer_etats_liasse.py")
        print("  2. Vérifier que les 3 colonnes s'affichent")
        print("  3. Vérifier que le TFT est affiché")
    else:
        print()
        print("❌ Correction échouée")


if __name__ == "__main__":
    main()
