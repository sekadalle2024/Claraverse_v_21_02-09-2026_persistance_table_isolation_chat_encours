#!/usr/bin/env python3
"""
Script pour ajouter l'étape Leadsheet dans la section REVUE ANALYTIQUE d'E-revision
Tâche: Ajouter Leadsheet après Lead balance avec modes Normal et Demo
Date: 09 Mai 2026
"""

def process_file():
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    print("📖 Lecture du fichier DemarrerMenu.tsx...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Définir le texte à rechercher (après Lead balance)
    old_text = '''          },
{
            id: 'revue-analytique-generale',
            label: 'Revue analytique générale','''
    
    # Définir le nouveau texte avec Leadsheet ajouté
    new_text = '''          },
          {
            id: 'leadsheet',
            label: 'Leadsheet',
            icon: <Calculator className="w-4 h-4" />,
            modes: [
              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] = Leadsheet
[Processus] = Trésorerie
[Données de base] = pièce jointe`
              },
              {
                id: 'demo',
                label: 'Demo',
                command: `[Command] = Leadsheet
[Processus] = Trésorerie
[Données de base] = pièce jointe
[Demo] = Activate`
              }
            ]
          },
{
            id: 'revue-analytique-generale',
            label: 'Revue analytique générale','''
    
    # Effectuer le remplacement
    if old_text in content:
        content = content.replace(old_text, new_text)
        print("✅ Étape Leadsheet ajoutée avec succès après Lead balance")
        print("   - Mode Normal: [Command] = Leadsheet, [Processus] = Trésorerie, [Données de base] = pièce jointe")
        print("   - Mode Demo: Même commande + [Demo] = Activate")
    else:
        print("❌ Erreur: Le texte de référence n'a pas été trouvé")
        print("   Vérifiez que la structure du fichier n'a pas changé")
        return False
    
    # Sauvegarder le fichier
    print("\n💾 Sauvegarde du fichier...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Fichier sauvegardé avec succès!")
    print("\n📋 Résumé:")
    print("   • Logiciel: E-revision")
    print("   • Section: REVUE ANALYTIQUE")
    print("   • Étape ajoutée: Leadsheet (après Lead balance)")
    print("   • Modes: Normal et Demo")
    print("   • Processus: Trésorerie")
    
    return True

if __name__ == '__main__':
    print("=" * 70)
    print("🚀 AJOUT DE L'ÉTAPE LEADSHEET DANS E-REVISION")
    print("=" * 70)
    print()
    
    success = process_file()
    
    print()
    print("=" * 70)
    if success:
        print("✅ MISSION ACCOMPLIE!")
        print("\n📝 Prochaines étapes:")
        print("   1. Vérifier le fichier DemarrerMenu.tsx")
        print("   2. Tester l'interface avec le bouton Démarrer")
        print("   3. Valider les commandes générées")
    else:
        print("❌ ÉCHEC - Vérifier les erreurs ci-dessus")
    print("=" * 70)
