#!/usr/bin/env python3
"""
Script pour ajouter les modes 'Methodo audit' et 'Guide des commandes' 
à toutes les étapes de mission d'E-audit pro et E-audit revision
"""

import re
import sys

def add_new_modes_to_etape(match):
    """
    Ajoute les deux nouveaux modes après le mode 'avance' existant
    """
    full_match = match.group(0)
    
    # Extraire les informations de la commande avancée
    command_match = re.search(r'\[Command\] = (.+?)$', full_match, re.MULTILINE)
    processus_match = re.search(r'\[Processus\] = (.+?)$', full_match, re.MULTILINE)
    etape_prec_match = re.search(r'\[Etape précédente\] = (.+?)$', full_match, re.MULTILINE)
    etape_mission_match = re.search(r'\[Etape de mission\] = (.+?)$', full_match, re.MULTILINE)
    modele_match = re.search(r'\[Modele\].*?= (.+?)$', full_match, re.MULTILINE)
    
    # Extraire toutes les variables
    variables = re.findall(r'(\[Variable \d+\] = .+?)$', full_match, re.MULTILINE)
    
    # Extraire le nombre de lignes
    nb_lignes_match = re.search(r'\[Nb de lignes\] = (\d+)', full_match)
    
    if not all([command_match, processus_match, etape_prec_match, etape_mission_match, modele_match, nb_lignes_match]):
        return full_match  # Ne pas modifier si structure incomplète
    
    command = command_match.group(1)
    processus = processus_match.group(1)
    etape_prec = etape_prec_match.group(1)
    etape_mission = etape_mission_match.group(1)
    modele = modele_match.group(1)
    nb_lignes = nb_lignes_match.group(1)
    
    # Construire les variables
    variables_str = '\n'.join(variables)
    if variables_str:
        variables_str = '\n' + variables_str
    
    # Créer le mode Methodo audit
    mode_methodo = f"""              {{
                id: 'methodo',
                label: 'Methodo audit',
                command: `[Command] = {command}
[Processus] = {processus}
[Etape précédente] = {etape_prec}
[Etape de mission] = {etape_mission}
[Modele] : {modele}{variables_str}
[Guide Methodo] : Activate
[Nb de lignes] = {nb_lignes}`
              }}"""
    
    # Créer le mode Guide des commandes
    mode_guide = f"""              {{
                id: 'guide-commandes',
                label: 'Guide des commandes',
                command: `[Command] = {command}
[Processus] = {processus}
[Etape précédente] = {etape_prec}
[Etape de mission] = {etape_mission}
[Modele] : {modele}{variables_str}
[Guide des commandes] : Activate
[Nb de lignes] = {nb_lignes}`
              }}"""
    
    # Ajouter les nouveaux modes après le mode avancé
    result = full_match + ',\n' + mode_methodo + ',\n' + mode_guide
    
    return result

def process_file(filepath):
    """
    Traite le fichier DemarrerMenu.tsx pour ajouter les nouveaux modes
    """
    print(f"Lecture du fichier {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern pour trouver les modes avancés des étapes de mission
    # On cherche les blocs qui contiennent [Etape de mission] et se terminent par [Nb de lignes]
    pattern = r'''              \{
                id: 'avance',
                label: 'Avancé',
                command: `\[Command\] = [^\n]+
\[Processus\] = [^\n]+
\[Etape précédente\] = [^\n]+
\[Etape de mission\] = [^\n]+
\[Modele\][^\n]+
(?:\[Variable \d+\] = [^\n]+
)*\[Nb de lignes\] = \d+`
              \}'''
    
    # Compter les occurrences
    matches = list(re.finditer(pattern, content))
    print(f"Trouvé {len(matches)} étapes de mission à mettre à jour")
    
    if len(matches) == 0:
        print("Aucune étape trouvée. Vérification du pattern...")
        return False
    
    # Remplacer toutes les occurrences
    new_content = re.sub(pattern, add_new_modes_to_etape, content)
    
    # Sauvegarder le fichier
    print(f"Écriture des modifications dans {filepath}...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✓ Fichier mis à jour avec succès!")
    print(f"✓ {len(matches)} étapes de mission ont été enrichies avec les modes 'Methodo audit' et 'Guide des commandes'")
    
    return True

if __name__ == '__main__':
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    try:
        success = process_file(filepath)
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"Erreur: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
