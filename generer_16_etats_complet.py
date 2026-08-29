# -*- coding: utf-8 -*-
"""
Script pour générer le module COMPLET avec les 16 fonctions
"""

# Lire les fonctions 1-6 existantes
with open('py_backend/etats_controle_exhaustifs_html.py', 'r', encoding='utf-8') as f:
    contenu_base = f.read()

# Lire la fonction 7
with open('py_backend/etats_controle_exhaustifs_html_part2.py', 'r', encoding='utf-8') as f:
    contenu_part2 = f.read()
    # Extraire juste la fonction 7
    fonction_7 = contenu_part2.split('def generate_etat_7')[1]
    fonction_7 = 'def generate_etat_7' + fonction_7

# Fonction 8
fonction_8 = '''

def generate_etat_8_comptes_sens_anormal_n(controles: Dict) -> str:
    """8. Comptes avec Sens Anormal par Nature (Exercice N)"""
    comptes_sens_anormal = controles.get('comptes_sens_anormal', {})
    critiques = comptes_sens_anormal.get('critiques', [])
    eleves = comptes_sens_anormal.get('eleves', [])
    moyens = comptes_sens_anormal.get('moyens', [])
    faibles = comptes_sens_anormal.get('faibles', [])
    
    nb_critiques = len(critiques)
    nb_total = nb_critiques + len(eleves) + len(moyens) + len(faibles)
    
    if nb_total == 0:
        return """
            <!-- 8. Comptes avec Sens Anormal par Nature -->
            <div class="section">
                <div class="section-header" onclick="toggleSection(this)">
                    <span>🚨 8. Comptes avec Sens Anormal par Nature (Exercice N)</span>
                    <span class="arrow">›</span>
                </div>
                <div class="section-content">
                    <div class="section-body">
                        <div class="success-box">
                            <h3>✅ Aucun Compte Anormal <span class="badge badge-success">Parfait</span></h3>
                            <p style="margin-top: 10px;">Tous les comptes ont un sens conforme à leur nature comptable</p>
                        </div>
                    </div>
                </div>
            </div>
"""
    
    # Générer les tableaux par gravité
    def generer_tableau_gravite(comptes, titre, badge_class, badge_text):
        if not comptes:
            return ""
        
        lignes = ""
        for compte in comptes:
            num_compte = compte.get('numero_compte', '')
            nature = compte.get('nature', '')
            intitule = compte.get('intitule', '')
            sens_attendu = compte.get('sens_attendu', '')
            sens_reel = compte.get('sens_reel', '')
            solde_net = compte.get('solde_net', 0)
            
            lignes += f"""
                                <tr>
                                    <td><span class="badge {badge_class}">{badge_text}</span></td>
                                    <td class="ref-cell">{num_compte}</td>
                                    <td>{nature}</td>
                                    <td>{intitule}</td>
                                    <td style="text-align: center;"><span class="badge badge-info">{sens_attendu}</span></td>
                                    <td style="text-align: center;"><span class="badge badge-danger">{sens_reel}</span></td>
                                    <td class="montant-cell">{format_montant(solde_net)}</td>
                                </tr>
"""
        
        return f"""
                        <h3 style="margin-top: 30px; margin-bottom: 15px;">{titre}</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 100px;">Gravité</th>
                                    <th>N° Compte</th>
                                    <th>Nature</th>
                                    <th>Intitulé</th>
                                    <th style="text-align: center;">Sens Attendu</th>
                                    <th style="text-align: center;">Sens Réel</th>
                                    <th style="text-align: right;">Solde Net</th>
                                </tr>
                            </thead>
                            <tbody>
{lignes}
                            </tbody>
                        </table>
"""
    
    tableau_critiques = generer_tableau_gravite(critiques, "🔴 Comptes CRITIQUES (Action Immédiate)", "badge-critical", "CRITIQUE")
    tableau_eleves = generer_tableau_gravite(eleves, "🟠 Comptes ÉLEVÉS (Vérification Prioritaire)", "badge-warning", "ÉLEVÉ")
    tableau_moyens = generer_tableau_gravite(moyens, "🟡 Comptes MOYENS (À Vérifier)", "badge-info", "MOYEN")
    tableau_faibles = generer_tableau_gravite(faibles, "⚪ Comptes FAIBLES (Vérification de Routine)", "badge", "FAIBLE")
    
    return f"""
            <!-- 8. Comptes avec Sens Anormal par Nature -->
            <div class="section">
                <div class="section-header" onclick="toggleSection(this)">
                    <span>🚨 8. Comptes avec Sens Anormal par Nature (Exercice N)</span>
                    <span class="arrow">›</span>
                </div>
                <div class="section-content">
                    <div class="section-body">
                        <div class="danger-box">
                            <h3>🚨 {nb_critiques} Comptes CRITIQUES Détectés <span class="badge badge-critical">Action Immédiate</span></h3>
                            <p style="margin-top: 10px;">Ces comptes ont un sens contraire à leur nature comptable spécifique</p>
                        </div>
{tableau_critiques}
{tableau_eleves}
{tableau_moyens}
{tableau_faibles}
                        <div class="info-box" style="margin-top: 30px;">
                            <h4>📌 Niveaux de Gravité</h4>
                            <table style="width: 100%; margin-top: 10px;">
                                <thead>
                                    <tr>
                                        <th>Niveau</th>
                                        <th>Impact</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><span class="badge badge-critical">CRITIQUE</span></td>
                                        <td>Déséquilibre majeur</td>
                                        <td>Correction immédiate requise</td>
                                    </tr>
                                    <tr>
                                        <td><span class="badge badge-warning">ÉLEVÉ</span></td>
                                        <td>Anomalie comptable</td>
                                        <td>Vérification et correction prioritaire</td>
                                    </tr>
                                    <tr>
                                        <td><span class="badge badge-info">MOYEN</span></td>
                                        <td>À vérifier</td>
                                        <td>Analyse et justification nécessaire</td>
                                    </tr>
                                    <tr>
                                        <td><span class="badge" style="background: #9e9e9e; color: white;">FAIBLE</span></td>
                                        <td>Situation exceptionnelle possible</td>
                                        <td>Vérification de routine</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
"""
'''

print("✅ Génération du module complet...")

# Créer le nouveau fichier avec TOUTES les fonctions
nouveau_contenu = contenu_base + "\n\n" + fonction_7 + "\n\n" + fonction_8

# Ajouter la fonction principale
fonction_principale = '''


def generate_all_16_etats_controle_html(controles_n: Dict, controles_n1: Dict, totaux_n: Dict, totaux_n1: Dict) -> str:
    """
    Génère les 16 états de contrôle exhaustifs (8 pour N + 8 pour N-1)
    
    Args:
        controles_n: Résultats des contrôles pour l'exercice N
        controles_n1: Résultats des contrôles pour l'exercice N-1
        totaux_n: Totaux pour l'exercice N
        totaux_n1: Totaux pour l'exercice N-1
    
    Returns:
        HTML complet des 16 états de contrôle
    """
    html_parts = []
    
    # États 1-8 pour N
    html_parts.append(generate_etat_1_statistiques_couverture_n(controles_n))
    html_parts.append(generate_etat_2_equilibre_bilan_n(controles_n, totaux_n))
    html_parts.append(generate_etat_3_coherence_resultat_n(controles_n, totaux_n))
    html_parts.append(generate_etat_4_comptes_non_integres_n(controles_n))
    html_parts.append(generate_etat_5_comptes_sens_inverse_n(controles_n))
    html_parts.append(generate_etat_6_comptes_desequilibre_n(controles_n))
    html_parts.append(generate_etat_7_hypothese_affectation_n(controles_n, totaux_n))
    html_parts.append(generate_etat_8_comptes_sens_anormal_n(controles_n))
    
    # États 9-16 pour N-1 (mêmes fonctions avec données N-1)
    # On réutilise les mêmes fonctions en changeant juste les numéros dans le HTML
    html_n1_1 = generate_etat_1_statistiques_couverture_n(controles_n1).replace("1. Statistiques", "9. Statistiques").replace("(Exercice N)", "(Exercice N-1)")
    html_n1_2 = generate_etat_2_equilibre_bilan_n(controles_n1, totaux_n1).replace("2. Équilibre", "10. Équilibre").replace("(Exercice N)", "(Exercice N-1)")
    html_n1_3 = generate_etat_3_coherence_resultat_n(controles_n1, totaux_n1).replace("3. Cohérence", "11. Cohérence").replace("(Exercice N)", "(Exercice N-1)")
    html_n1_4 = generate_etat_4_comptes_non_integres_n(controles_n1).replace("4. Comptes Non", "12. Comptes Non").replace("(Exercice N)", "(Exercice N-1)")
    html_n1_5 = generate_etat_5_comptes_sens_inverse_n(controles_n1).replace("5. Comptes avec Sens", "13. Comptes avec Sens").replace("(Exercice N)", "(Exercice N-1)")
    html_n1_6 = generate_etat_6_comptes_desequilibre_n(controles_n1).replace("6. Comptes Créant", "14. Comptes Créant").replace("(Exercice N)", "(Exercice N-1)")
    html_n1_7 = generate_etat_7_hypothese_affectation_n(controles_n1, totaux_n1).replace("7. Hypothèse", "15. Hypothèse").replace("(Exercice N)", "(Exercice N-1)")
    html_n1_8 = generate_etat_8_comptes_sens_anormal_n(controles_n1).replace("8. Comptes avec Sens Anormal", "16. Comptes avec Sens Anormal").replace("(Exercice N)", "(Exercice N-1)")
    
    html_parts.extend([html_n1_1, html_n1_2, html_n1_3, html_n1_4, html_n1_5, html_n1_6, html_n1_7, html_n1_8])
    
    return "\\n".join(html_parts)
'''

nouveau_contenu += fonction_principale

# Écrire le nouveau fichier
with open('py_backend/etats_controle_exhaustifs_html.py', 'w', encoding='utf-8') as f:
    f.write(nouveau_contenu)

print("✅ Module complet généré: py_backend/etats_controle_exhaustifs_html.py")
print("✅ 16 fonctions créées (8 pour N + réutilisation pour N-1)")
print("✅ Fonction principale generate_all_16_etats_controle_html() ajoutée")
