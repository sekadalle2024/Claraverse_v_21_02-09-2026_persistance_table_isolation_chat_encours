#!/usr/bin/env python3
"""
Script d'extraction EXHAUSTIVE de MENU_DATA depuis DemarrerMenu.tsx
Extrait TOUS les logiciels, phases, étapes, modes et variables
"""

import json
import re
from datetime import datetime
from pathlib import Path

def extract_menu_data_complete(tsx_file_path):
    """
    Extrait la section MENU_DATA complète du fichier TypeScript
    """
    print(f"📖 Lecture du fichier: {tsx_file_path}")
    
    with open(tsx_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"✅ Fichier lu: {len(content)} caractères")
    
    # Trouver le début de MENU_DATA
    start_pattern = r'const MENU_DATA: LogicielItem\[\] = \['
    start_match = re.search(start_pattern, content)
    
    if not start_match:
        print("❌ MENU_DATA non trouvé")
        return None
    
    start_pos = start_match.end()
    print(f"✅ MENU_DATA trouvé à la position {start_pos}")
    
    # Extraire jusqu'au ]; de fermeture
    # On cherche le ]; qui ferme MENU_DATA (pas les sous-tableaux)
    bracket_count = 1
    end_pos = start_pos
    
    while bracket_count > 0 and end_pos < len(content):
        char = content[end_pos]
        if char == '[':
            bracket_count += 1
        elif char == ']':
            bracket_count -= 1
        end_pos += 1
    
    menu_data_str = content[start_match.start():end_pos]
    print(f"✅ MENU_DATA extrait: {len(menu_data_str)} caractères")
    
    return menu_data_str

def parse_command_variables(command_str):
    """
    Parse les variables d'une commande
    """
    variables = []
    
    # Extraire toutes les variables [Variable] = valeur
    pattern = r'\[([^\]]+)\]\s*=\s*([^\n\[]+)'
    matches = re.findall(pattern, command_str)
    
    for var_name, var_value in matches:
        variables.append({
            "nom": var_name.strip(),
            "valeur": var_value.strip()
        })
    
    return variables

def convert_to_json_structure(menu_data_str):
    """
    Convertit la chaîne MENU_DATA en structure JSON
    """
    print("\n🔄 Conversion en structure JSON...")
    
    # Structure de base
    suite = {
        "suite": {
            "nom": "Suite E-Audit",
            "description": "Suite complète d'outils d'audit et de révision comptable",
            "version": "2.0.0",
            "date_extraction": datetime.now().isoformat(),
            "source_file": "DemarrerMenu.tsx",
            "statistiques": {
                "nb_logiciels": 0,
                "nb_phases": 0,
                "nb_etapes": 0,
                "nb_modes": 0,
                "nb_tests": 0,
                "nb_variables": 0
            },
            "logiciels": []
        }
    }
    
    # Compteurs
    stats = suite["suite"]["statistiques"]
    
    # Parser les logiciels
    logiciel_pattern = r'\{\s*id:\s*[\'"]([^\'"]+)[\'"],\s*label:\s*[\'"]([^\'"]+)[\'"]'
    logiciels = re.finditer(logiciel_pattern, menu_data_str)
    
    for logiciel_match in logiciels:
        logiciel_id = logiciel_match.group(1)
        logiciel_label = logiciel_match.group(2)
        
        logiciel_obj = {
            "id": logiciel_id,
            "label": logiciel_label,
            "description": f"Logiciel {logiciel_label}",
            "phases": []
        }
        
        stats["nb_logiciels"] += 1
        
        # Extraire la section de ce logiciel
        logiciel_start = logiciel_match.start()
        # Trouver la fin du logiciel (prochain logiciel ou fin)
        next_logiciel = re.search(logiciel_pattern, menu_data_str[logiciel_start + 100:])
        if next_logiciel:
            logiciel_end = logiciel_start + 100 + next_logiciel.start()
        else:
            logiciel_end = len(menu_data_str)
        
        logiciel_content = menu_data_str[logiciel_start:logiciel_end]
        
        # Parser les phases
        phase_pattern = r'\{\s*id:\s*[\'"]([^\'"]+)[\'"],\s*label:\s*[\'"]([^\'"]+)[\'"]'
        phases = re.finditer(phase_pattern, logiciel_content)
        
        for phase_match in phases:
            phase_id = phase_match.group(1)
            phase_label = phase_match.group(2)
            
            # Ignorer si c'est le logiciel lui-même
            if phase_id == logiciel_id:
                continue
            
            phase_obj = {
                "id": phase_id,
                "label": phase_label,
                "etapes": [],
                "cycles": []
            }
            
            stats["nb_phases"] += 1
            
            # Extraire la section de cette phase
            phase_start = phase_match.start()
            next_phase = re.search(phase_pattern, logiciel_content[phase_start + 50:])
            if next_phase:
                phase_end = phase_start + 50 + next_phase.start()
            else:
                phase_end = len(logiciel_content)
            
            phase_content = logiciel_content[phase_start:phase_end]
            
            # Parser les étapes
            etape_pattern = r'\{\s*id:\s*[\'"]([^\'"]+)[\'"],\s*label:\s*[\'"]([^\'"]+)[\'"]'
            etapes = re.finditer(etape_pattern, phase_content)
            
            for etape_match in etapes:
                etape_id = etape_match.group(1)
                etape_label = etape_match.group(2)
                
                # Ignorer si c'est la phase elle-même
                if etape_id == phase_id:
                    continue
                
                etape_obj = {
                    "id": etape_id,
                    "label": etape_label,
                    "modes": []
                }
                
                stats["nb_etapes"] += 1
                
                # Extraire la section de cette étape
                etape_start = etape_match.start()
                next_etape = re.search(etape_pattern, phase_content[etape_start + 50:])
                if next_etape:
                    etape_end = etape_start + 50 + next_etape.start()
                else:
                    etape_end = len(phase_content)
                
                etape_content = phase_content[etape_start:etape_end]
                
                # Parser les modes
                mode_pattern = r'\{\s*id:\s*[\'"]([^\'"]+)[\'"],\s*label:\s*[\'"]([^\'"]+)[\'"],\s*command:\s*`([^`]+)`'
                modes = re.finditer(mode_pattern, etape_content)
                
                for mode_match in modes:
                    mode_id = mode_match.group(1)
                    mode_label = mode_match.group(2)
                    mode_command = mode_match.group(3)
                    
                    mode_obj = {
                        "id": mode_id,
                        "label": mode_label,
                        "command": mode_command.strip(),
                        "variables": parse_command_variables(mode_command)
                    }
                    
                    stats["nb_modes"] += 1
                    stats["nb_variables"] += len(mode_obj["variables"])
                    
                    etape_obj["modes"].append(mode_obj)
                
                # Si pas de modes, chercher une commande directe
                if not etape_obj["modes"]:
                    direct_command_pattern = r'command:\s*`([^`]+)`'
                    direct_command = re.search(direct_command_pattern, etape_content)
                    if direct_command:
                        command_str = direct_command.group(1)
                        etape_obj["command"] = command_str.strip()
                        etape_obj["variables"] = parse_command_variables(command_str)
                        stats["nb_variables"] += len(etape_obj["variables"])
                
                phase_obj["etapes"].append(etape_obj)
            
            # Parser les cycles comptables (pour E-revision)
            cycle_pattern = r'\{\s*id:\s*[\'"]cycle-([^\'"]+)[\'"],\s*label:\s*[\'"]([^\'"]+)[\'"]'
            cycles = re.finditer(cycle_pattern, phase_content)
            
            for cycle_match in cycles:
                cycle_id = "cycle-" + cycle_match.group(1)
                cycle_label = cycle_match.group(2)
                
                cycle_obj = {
                    "id": cycle_id,
                    "label": cycle_label,
                    "tests": []
                }
                
                # Extraire la section de ce cycle
                cycle_start = cycle_match.start()
                next_cycle = re.search(cycle_pattern, phase_content[cycle_start + 50:])
                if next_cycle:
                    cycle_end = cycle_start + 50 + next_cycle.start()
                else:
                    cycle_end = len(phase_content)
                
                cycle_content = phase_content[cycle_start:cycle_end]
                
                # Parser les tests
                test_pattern = r'\{\s*id:\s*[\'"]([^\'"]+)[\'"],\s*reference:\s*[\'"]([^\'"]+)[\'"],\s*label:\s*[\'"]([^\'"]+)[\'"],\s*processus:\s*[\'"]([^\'"]+)[\'"],\s*command:\s*`([^`]+)`'
                tests = re.finditer(test_pattern, cycle_content)
                
                for test_match in tests:
                    test_id = test_match.group(1)
                    test_reference = test_match.group(2)
                    test_label = test_match.group(3)
                    test_processus = test_match.group(4)
                    test_command = test_match.group(5)
                    
                    test_obj = {
                        "id": test_id,
                        "reference": test_reference,
                        "label": test_label,
                        "processus": test_processus,
                        "command": test_command.strip(),
                        "variables": parse_command_variables(test_command)
                    }
                    
                    stats["nb_tests"] += 1
                    stats["nb_variables"] += len(test_obj["variables"])
                    
                    cycle_obj["tests"].append(test_obj)
                
                phase_obj["cycles"].append(cycle_obj)
            
            logiciel_obj["phases"].append(phase_obj)
        
        suite["suite"]["logiciels"].append(logiciel_obj)
    
    print(f"\n📊 Statistiques d'extraction:")
    print(f"   - Logiciels: {stats['nb_logiciels']}")
    print(f"   - Phases: {stats['nb_phases']}")
    print(f"   - Étapes: {stats['nb_etapes']}")
    print(f"   - Modes: {stats['nb_modes']}")
    print(f"   - Tests: {stats['nb_tests']}")
    print(f"   - Variables: {stats['nb_variables']}")
    
    return suite

def main():
    print("=" * 70)
    print("🚀 EXTRACTION EXHAUSTIVE DE MENU_DATA")
    print("=" * 70)
    
    # Chemins
    tsx_file = Path("src/components/Clara_Components/DemarrerMenu.tsx")
    output_dir = Path("Extraction json DemarrerMenu.tsx")
    output_file = output_dir / "suite_e_audit_exhaustive.json"
    
    # Vérifier que le fichier source existe
    if not tsx_file.exists():
        print(f"❌ Fichier source non trouvé: {tsx_file}")
        return
    
    # Extraire MENU_DATA
    menu_data_str = extract_menu_data_complete(tsx_file)
    
    if not menu_data_str:
        print("❌ Échec de l'extraction")
        return
    
    # Convertir en JSON
    json_structure = convert_to_json_structure(menu_data_str)
    
    # Sauvegarder
    print(f"\n💾 Sauvegarde dans: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(json_structure, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Fichier créé: {output_file}")
    print(f"📦 Taille: {output_file.stat().st_size} octets")
    
    print("\n" + "=" * 70)
    print("✅ EXTRACTION TERMINÉE AVEC SUCCÈS")
    print("=" * 70)

if __name__ == "__main__":
    main()
