# -*- coding: utf-8 -*-
"""
Script pour générer le module complet etats_controle_exhaustifs_html.py
avec les 16 fonctions HTML
"""

# En-tête du module
header = '''# -*- coding: utf-8 -*-
"""
Module de génération HTML pour les 16 états de contrôle exhaustifs
Génère du HTML complet conforme au fichier test_etats_controle_html.html

STRUCTURE:
- 8 états pour l'exercice N (fonctions 1-8)
- 8 états pour l'exercice N-1 (fonctions 9-16)

Chaque fonction génère une section HTML complète avec:
- Header cliquable (accordéon)
- Boîtes colorées (success-box, warning-box, danger-box, info-box)
- Tableaux détaillés
- Badges (success, warning, danger, info, critical)
- Explications et formules
"""

from typing import Dict, List, Any


def format_montant(montant: float) -> str:
    """Formate un montant avec séparateurs de milliers"""
    if abs(montant) < 0.01:
        return "-"
    return f"{montant:,.0f}".replace(',', ' ')
'''

# Lire les fonctions existantes
with open('py_backend/etats_controle_exhaustifs_html.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Extraire les fonctions 1-6
import re
functions_1_6 = re.findall(r'(def generate_etat_[1-6].*?(?=\ndef generate_etat_|$))', content, re.DOTALL)

print(f"✅ Fonctions 1-6 extraites: {len(functions_1_6)} fonctions")

# Créer le fichier complet
with open('py_backend/etats_controle_exhaustifs_html_complet.py', 'w', encoding='utf-8') as f:
    f.write(header)
    f.write('\n\n')
    
    # Écrire les fonctions 1-6
    for func in functions_1_6:
        f.write(func)
        f.write('\n\n')

print("✅ Fichier complet créé: py_backend/etats_controle_exhaustifs_html_complet.py")
print("📝 Prochaine étape: Ajouter les fonctions 7-16")
