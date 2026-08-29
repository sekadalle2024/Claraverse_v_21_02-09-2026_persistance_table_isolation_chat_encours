#!/usr/bin/env python3
"""
Script pour ajouter l'étape "Règles et méthodes comptables" dans la section REVUE ANALYTIQUE d'E-revision
Tâche: Ajouter "Règles et méthodes comptables" au-dessus de Lead balance avec modes Normal et Demo
Date: 09 Mai 2026
"""

def process_file():
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    print("📖 Lecture du fichier DemarrerMenu.tsx...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Définir le texte à rechercher (avant Lead balance)
    old_text = '''        etapes: [
                    {
            id: 'lead-balance',
            label: 'Lead balance','''
    
    # Définir le nouveau texte avec "Règles et méthodes comptables" ajouté
    new_text = '''        etapes: [
          {
            id: 'regles-methodes-comptables',
            label: 'Règles et méthodes comptables',
            icon: <FileText className="w-4 h-4" />,
            modes: [
              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] : Règles et méthodes comptables
[Processus] : Trésorerie
[Données de base] = pièce jointe`
              },
              {
                id: 'demo',
                label: 'Demo',
                command: `[Command] : Règles et méthodes comptables
[Processus] : Trésorerie
[Données de base] = pièce jointe
[Demo] = Activate`
              }
            ]
          },
                    {
            id: 'lead-balance',
            label: 'Lead balance','''
    
    # Effectuer le remplacement
    if old_text in content:
        content = content.replace(old_text, new_text)
        print("✅ Étape 'Règles et méthodes comptables' ajoutée avec succès au-dessus de Lead balance")
        print("   - Mode Normal: [Command] : Règles et méthodes comptables, [Processus] : Trésorerie, [Données de base] = pièce jointe")
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
    print("   • Étape ajoutée: Règles et méthodes comptables (au-dessus de Lead balance)")
    print("   • Modes: Normal et Demo")
    print("   • Processus: Trésorerie")
    print("   • Données de base: pièce jointe")
    
    return True

if __name__ == '__main__':
    print("=" * 70)
    print("🚀 AJOUT DE L'ÉTAPE 'RÈGLES ET MÉTHODES COMPTABLES' DANS E-REVISION")
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
        print("\n🔍 Ordre des étapes dans REVUE ANALYTIQUE:")
        print("   1. Règles et méthodes comptables (NOUVEAU)")
        print("   2. Lead balance")
        print("   3. Leadsheet")
        print("   4. Revue analytique générale")
        print("   5. Analyse des variations")
    else:
        print("❌ ÉCHEC - Vérifier les erreurs ci-dessus")
    print("=" * 70)
