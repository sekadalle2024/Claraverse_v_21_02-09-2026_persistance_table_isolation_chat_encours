#!/usr/bin/env python3
"""
Script pour supprimer [Modele], [Directive] et [Composant] des modes Normal et Demo
de l'étape Design dans E-revision > PLANIFICATION
Tâche: Nettoyer les commandes de l'étape Design
Date: 11 Mai 2026
"""

def process_file():
    filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
    
    print("📖 Lecture du fichier DemarrerMenu.tsx...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Mode Normal - Design
    old_normal = """              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[test] : DD155
[Etape précédente] = Prise de connaissance du domaine audite
[Etape de mission] = Design
[Modele] : Sous processus, Objectif de contrôle, Taches cle, Questionnaire identification risque, Assertion, Dispositif de maitrises des risques du client, Contrôle cle attendus, references documentaire, Anomalies, Conclusion
[Directive] = Remplir toutes les colonnes en simulant des lignes satisfaisante t des lignes non satisfaisantes
[Integration] = Design
[Nb de lignes] = 10`
              },"""
    
    new_normal = """              {
                id: 'normal',
                label: 'Normal',
                command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[test] : DD155
[Etape précédente] = Prise de connaissance du domaine audite
[Etape de mission] = Design
[Integration] = Design
[Nb de lignes] = 10`
              },"""
    
    # Mode Demo - Design
    old_demo = """              {
                id: 'demo',
                label: 'Demo',
                command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[test] : DD155
[Etape précédente] = Prise de connaissance du domaine audite
[Etape de mission] = Design
[Modele] : Sous processus, Objectif de contrôle, Taches cle, Questionnaire identification risque, Assertion, Dispositif de maitrises des risques du client, Contrôle cle attendus, references documentaire, Anomalies, Conclusion
[Directive] = Remplir toutes les colonnes en simulant des lignes satisfaisante t des lignes non satisfaisantes
[Integration] = Design
[Demo] = Activate
[Nb de lignes] = 10`
              },"""
    
    new_demo = """              {
                id: 'demo',
                label: 'Demo',
                command: `[Command] = Etape de mission
[Processus] = rapprochements bancaires
[test] : DD155
[Etape précédente] = Prise de connaissance du domaine audite
[Etape de mission] = Design
[Integration] = Design
[Demo] = Activate
[Nb de lignes] = 10`
              },"""
    
    # Effectuer les remplacements
    changes_made = 0
    
    if old_normal in content:
        content = content.replace(old_normal, new_normal)
        print("✅ Mode Normal - Suppression effectuée:")
        print("   ❌ [Modele] : Sous processus, Objectif de contrôle, Taches cle...")
        print("   ❌ [Directive] = Remplir toutes les colonnes...")
        changes_made += 1
    else:
        print("⚠️  Mode Normal - Texte non trouvé (peut-être déjà modifié)")
    
    if old_demo in content:
        content = content.replace(old_demo, new_demo)
        print("✅ Mode Demo - Suppression effectuée:")
        print("   ❌ [Modele] : Sous processus, Objectif de contrôle, Taches cle...")
        print("   ❌ [Directive] = Remplir toutes les colonnes...")
        changes_made += 1
    else:
        print("⚠️  Mode Demo - Texte non trouvé (peut-être déjà modifié)")
    
    if changes_made == 0:
        print("\n❌ Aucune modification effectuée")
        print("   Vérifiez que la structure du fichier n'a pas changé")
        return False
    
    # Sauvegarder le fichier
    print("\n💾 Sauvegarde du fichier...")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Fichier sauvegardé avec succès!")
    print("\n📋 Résumé des modifications:")
    print("   • Logiciel: E-revision")
    print("   • Section: PLANIFICATION")
    print("   • Étape: Design")
    print(f"   • Modes modifiés: {changes_made}/2")
    print("\n🗑️  Variables supprimées:")
    print("   • [Modele]")
    print("   • [Directive]")
    print("   • [Composant] (non présent)")
    print("\n✅ Variables conservées:")
    print("   • [Command]")
    print("   • [Processus]")
    print("   • [test]")
    print("   • [Etape précédente]")
    print("   • [Etape de mission]")
    print("   • [Integration]")
    print("   • [Nb de lignes]")
    print("   • [Demo] (mode Demo uniquement)")
    
    return True

if __name__ == '__main__':
    print("=" * 80)
    print("🗑️  SUPPRESSION [MODELE], [DIRECTIVE], [COMPOSANT] - E-REVISION DESIGN")
    print("=" * 80)
    print()
    
    success = process_file()
    
    print()
    print("=" * 80)
    if success:
        print("✅ MISSION ACCOMPLIE!")
        print("\n📝 Prochaines étapes:")
        print("   1. Vérifier le fichier DemarrerMenu.tsx")
        print("   2. Tester l'interface avec le bouton Démarrer")
        print("   3. Valider les commandes générées pour Design")
        print("\n🔍 Structure finale des commandes Design:")
        print("   Mode Normal:")
        print("     [Command] = Etape de mission")
        print("     [Processus] = rapprochements bancaires")
        print("     [test] : DD155")
        print("     [Etape précédente] = Prise de connaissance du domaine audite")
        print("     [Etape de mission] = Design")
        print("     [Integration] = Design")
        print("     [Nb de lignes] = 10")
        print("\n   Mode Demo: Identique + [Demo] = Activate")
    else:
        print("❌ ÉCHEC - Vérifier les erreurs ci-dessus")
    print("=" * 80)
