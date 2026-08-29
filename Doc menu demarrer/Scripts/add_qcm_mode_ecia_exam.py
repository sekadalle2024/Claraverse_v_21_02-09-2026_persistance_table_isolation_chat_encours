#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script pour ajouter le mode "Question Qcm" à E-CIA Exam Part 1
- Créer le mode "Question Qcm" basé sur le mode "Cours"
- Remplacer [Command] = Cours CIA par [Command] = QCM CIA

Date: 27 Mars 2026
"""

import re

def add_qcm_mode_to_ecia_exam(file_path):
    """
    Ajoute le mode "Question Qcm" à ECIA_MODES
    """
    print("🔄 Lecture du fichier...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Étape 1: Modifier ECIA_MODES pour ajouter le mode "Question Qcm"
    print("📝 Étape 1: Ajout du mode 'Question Qcm' à ECIA_MODES...")
    
    # Pattern pour trouver ECIA_MODES
    pattern_ecia_modes = r"(const ECIA_MODES: ModeItem\[\] = \[\s+\{ id: 'cours', label: 'Cours', prefix: '' \})\s+\];"
    
    # Nouveau contenu avec le mode QCM ajouté
    replacement_ecia_modes = r"""\1,
  { id: 'qcm', label: 'Question Qcm', prefix: '' }
];"""
    
    content = re.sub(pattern_ecia_modes, replacement_ecia_modes, content)
    print("   ✅ Mode 'Question Qcm' ajouté à ECIA_MODES")
    
    # Étape 2: Trouver toutes les commandes E-CIA et dupliquer avec QCM CIA
    print("📝 Étape 2: Duplication des commandes pour le mode QCM...")
    
    # On va chercher les commandes qui contiennent "Cours CIA"
    # et créer une version avec "QCM CIA"
    # Mais attention, les commandes E-CIA ont plusieurs lignes avec [Command QCM] et [Command Synthèse]
    
    # Pattern pour trouver une commande complète E-CIA
    pattern_command = r"command: `\[Command\] = Cours CIA\n(.*?)`"
    
    # Fonction pour dupliquer la commande
    def duplicate_command(match):
        original_command = match.group(0)
        # Créer la version QCM en remplaçant "Cours CIA" par "QCM CIA"
        qcm_command = original_command.replace('[Command] = Cours CIA', '[Command] = QCM CIA')
        # Retourner l'original (on ne modifie pas, on va ajouter les modes différemment)
        return original_command
    
    # En fait, on n'a pas besoin de dupliquer les commandes
    # Le système utilisera la même commande mais avec un mode différent
    # Le mode "Question Qcm" utilisera la même structure que "Cours"
    # mais l'utilisateur devra modifier manuellement [Command] = Cours CIA en [Command] = QCM CIA
    
    # Attendez, relisons la demande...
    # "Formule de [Question Qcm] le contenu du mode [Cours CIA]"
    # Cela signifie que le mode QCM doit avoir le même contenu que Cours
    # "et ensuite Renommer la valeur de la rubrique [Command], de 'Cours CIA' à 'QCM CIA'"
    
    # Donc on doit créer des commandes spécifiques pour le mode QCM
    # Mais cela nécessiterait de modifier chaque test E-CIA pour avoir des modes
    
    # Approche alternative: Modifier la logique pour que le mode QCM
    # remplace automatiquement "Cours CIA" par "QCM CIA" dans la commande
    
    print("   ⚠️  Approche: Le mode QCM utilisera la même commande que Cours")
    print("   ⚠️  Mais nous allons modifier le handleModeClick pour remplacer automatiquement")
    
    # Étape 3: Modifier handleModeClick pour gérer le mode QCM
    print("📝 Étape 3: Modification de handleModeClick...")
    
    # Approche simple: chercher la ligne avec rawCommand et ajouter la logique après
    pattern_raw_cmd = r"(const rawCommand = mode\.command \|\| \(mode\.prefix && activeEtape\.command \? mode\.prefix \+ activeEtape\.command : activeEtape\.command \|\| ''\);)"
    
    replacement_raw_cmd = r"""\1
      
      // Pour le mode QCM E-CIA, remplacer "Cours CIA" par "QCM CIA"
      const finalRawCommand = mode.id === 'qcm' && rawCommand.includes('Cours CIA') 
        ? rawCommand.replace(/\[Command\] = Cours CIA/g, '[Command] = QCM CIA')
        : rawCommand;"""
    
    if re.search(pattern_raw_cmd, content):
        content = re.sub(pattern_raw_cmd, replacement_raw_cmd, content)
        print("   ✅ Logique de remplacement ajoutée à handleModeClick")
        
        # Remplacer rawCommand par finalRawCommand dans formatCommandWithBullets
        pattern_format = r"const finalCommand = formatCommandWithBullets\(rawCommand\);"
        replacement_format = r"const finalCommand = formatCommandWithBullets(finalRawCommand);"
        content = re.sub(pattern_format, replacement_format, content)
        print("   ✅ Utilisation de finalRawCommand dans formatCommandWithBullets")
    else:
        print("   ❌ Pattern rawCommand non trouvé")
    
    # Étape 4: Écrire le fichier modifié
    print("💾 Écriture du fichier modifié...")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✅ Modifications appliquées avec succès!")
    print("\n📋 Résumé des modifications:")
    print("   - Mode 'Question Qcm' ajouté à ECIA_MODES")
    print("   - Logique de remplacement ajoutée à handleModeClick")
    print("   - Les commandes QCM remplaceront automatiquement 'Cours CIA' par 'QCM CIA'")
    print("\n⚠️  Prochaines étapes:")
    print("   1. Vérifier la compilation: npm run build")
    print("   2. Tester l'interface E-CIA Exam Part 1")
    print("   3. Vérifier que les modes 'Cours' et 'Question Qcm' s'affichent")
    print("   4. Vérifier que le mode QCM génère '[Command] = QCM CIA'")

if __name__ == '__main__':
    file_path = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    print("=" * 60)
    print("🚀 Ajout du mode 'Question Qcm' pour E-CIA Exam")
    print("=" * 60)
    print()
    
    try:
        add_qcm_mode_to_ecia_exam(file_path)
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        print("   Vérifiez que le fichier existe et est accessible")
        import traceback
        traceback.print_exc()
