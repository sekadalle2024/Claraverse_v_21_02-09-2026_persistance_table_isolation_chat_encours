# Tableau Complet des 33 Cases du Router n8n
## 29 Mars 2026

---

## 📊 Vue d'Ensemble

Le router n8n de `claraApiService.ts` gère 33 cases différents pour router les messages vers les bons endpoints n8n.

---

## 📋 Tableau Complet

| Case | Route Key | Mot-clé Détection | Type Endpoint | URL Endpoint |
|------|-----------|-------------------|---------------|--------------|
| 1 | default | (défaut) | Distant | https://t22wtwxl.rpcld.app/webhook/template |
| 2 | design | "Design" | Distant | https://t22wtwxl.rpcld.app/webhook/integration_windows |
| 3 | n8n_doc | "n8n_doc" | Distant | https://t22wtwxl.rpcld.app/webhook/n8n_doc |
| 4 | htlm_processor | "Htlm_processor" | Distant | https://t22wtwxl.rpcld.app/webhook/htlm_processor |
| 6 | algorithme | "Algorithme" | Distant | https://t22wtwxl.rpcld.app/webhook/algorithme |
| 7 | visualisation | "Visualisation" | Distant | https://t22wtwxl.rpcld.app/webhook/visualisation |
| 8 | notification | (pas "Command" ni "/") | Local | __INTERNAL__NOTIFICATION__ |
| 9 | document | "Document" | Distant | https://t22wtwxl.rpcld.app/webhook/integration_document |
| 10 | database_endpoint | "Database" | Distant | https://t22wtwxl.rpcld.app/webhook/integration_database |
| 11 | cia_cours | "CIA" + "Cours" | Local | http://localhost:5678/webhook/cia_cours_gemini |
| 12 | cia_qcm | "CIA" + "Qcm" | Local | http://localhost:5678/webhook/qcm_cia_gemini |
| 13 | cia_synthese | "CIA" + "Synthèse" | Local | http://localhost:5678/webhook/synthese_cia_gemini |
| 16 | implementation_modelisation | "Implementation_modelisation" | Distant | https://t22wtwxl.rpcld.app/webhook/implementation_modelisation |
| 17 | implementation_programme_controle | "Implementation_programme_controle" | Distant | https://t22wtwxl.rpcld.app/webhook/implementation_programme_controle |
| 18 | implementation_cartographie | "Implementation_cartographie" | Distant | https://t22wtwxl.rpcld.app/webhook/implementation_cartographie |
| 19 | programme_controle_comptes | "Programme_controle_comptes" | Distant | https://t22wtwxl.rpcld.app/webhook/programme_controle_comptes |
| 20 | revue_manager | "Revue manager" | Distant | https://t22wtwxl.rpcld.app/webhook/revue_manager |
| 21 | lead_balance | "Lead_balance" | Local | __INTERNAL__LEAD_BALANCE__ |
| 22 | regles_comptables | "Règles et méthodes comptables" | Distant | https://t22wtwxl.rpcld.app/webhook/regles_comptables |
| 23 | recos_revision | "Recos_revision" | Distant | https://t22wtwxl.rpcld.app/webhook/recos_revision |
| 24 | etat_fin | "Etat fin" | Local | __INTERNAL__ETAT_FIN__ |
| 25 | recos_controle_interne | "Recos contrôle interne comptable" | Distant | https://t22wtwxl.rpcld.app/webhook/recos_contrôle_interne_comptable |
| 26 | recos_revision_comptes | "Recos revision des comptes" | Distant | https://t22wtwxl.rpcld.app/webhook/recos_revision_compte |
| 27 | rapport_synthese_cac | "Rapport de synthèse CAC" | Distant | https://t22wtwxl.rpcld.app/webhook/rapport_synthese_cac |
| 28 | methodo_audit | "Methodo audit" | Local | http://localhost:5678/webhook/methodo_audit |
| 29 | guide_des_commandes | "Guide des commandes" | Local | http://localhost:5678/webhook/guide_des_commandes |
| 30 | guide_intelligent | "Guide intelligent" | Local | http://localhost:5678/webhook/guide_intelligent |
| 31 | guide_menu_contextuel | "Guide menu contextuel" | Local | http://localhost:5678/webhook/guide_menu_contextuel |
| 32 | guide_produit | "Guide produit" | Local | http://localhost:5678/webhook/guide_produit |
| 33 | methodo_revision | "Methodo revision" | Local | http://localhost:5678/webhook/methodo_revision |

---

## 🔍 Légende

### Type Endpoint

- **Distant** : Endpoint hébergé sur serveur distant (https://t22wtwxl.rpcld.app)
- **Local** : Endpoint hébergé localement (http://localhost:5678)
- **Local (Sentinelle)** : Traitement local sans appel HTTP (ex: __INTERNAL__LEAD_BALANCE__)

### Sentinelles Internes

- `__INTERNAL__NOTIFICATION__` : Affiche une notification locale
- `__INTERNAL__LEAD_BALANCE__` : Déclenche l'upload de fichier Lead Balance
- `__INTERNAL__ETAT_FIN__` : Déclenche l'upload de fichier États Financiers

---

## 📊 Statistiques

### Par Type d'Endpoint

| Type | Nombre | Pourcentage |
|------|--------|-------------|
| Distant | 18 | 54.5% |
| Local | 12 | 36.4% |
| Local (Sentinelle) | 3 | 9.1% |
| **Total** | **33** | **100%** |

### Par Domaine

| Domaine | Nombre | Cases |
|---------|--------|-------|
| CIA | 3 | 11, 12, 13 |
| Implementation | 3 | 16, 17, 18 |
| Recos | 3 | 23, 25, 26 |
| Guide | 4 | 29, 30, 31, 32 |
| Methodo | 2 | 28, 33 |
| Autres | 18 | 1-10, 19-22, 24, 27 |

---

## 🎯 Messages de Test Recommandés

### Cases Fréquents

```
Case 1  : "Bonjour"
Case 11 : "CIA Cours"
Case 21 : "Lead_balance"
Case 28 : "Methodo audit"
Case 33 : "Methodo revision"
```

### Cases Spéciaux

```
Case 8  : "Test" (notification locale)
Case 21 : "Lead_balance" (upload fichier)
Case 24 : "Etat fin" (upload fichier)
```

### Cases Guides

```
Case 29 : "Guide des commandes"
Case 30 : "Guide intelligent"
Case 31 : "Guide menu contextuel"
Case 32 : "Guide produit"
```

---

## 🔄 Ordre de Priorité

Les cases sont évalués dans l'ordre suivant (du plus prioritaire au moins prioritaire) :

1. **Document** (Case 9)
2. **Database** (Case 10)
3. **CIA Cours** (Case 11)
4. **CIA QCM** (Case 12)
5. **CIA Synthèse** (Case 13)
6. **Implementation_modelisation** (Case 16)
7. **Implementation_programme_controle** (Case 17)
8. **Implementation_cartographie** (Case 18)
9. **Programme_controle_comptes** (Case 19)
10. **Revue manager** (Case 20)
11. **Lead_balance** (Case 21)
12. **Règles comptables** (Case 22)
13. **Recos_revision** (Case 23)
14. **Etat fin** (Case 24)
15. **Recos contrôle interne** (Case 25)
16. **Recos revision comptes** (Case 26)
17. **Rapport synthèse CAC** (Case 27)
18. **Methodo audit** (Case 28)
19. **Guide des commandes** (Case 29)
20. **Guide intelligent** (Case 30)
21. **Guide menu contextuel** (Case 31)
22. **Guide produit** (Case 32)
23. **Methodo revision** (Case 33)
24. **Design** (Case 2)
25. **n8n_doc** (Case 3)
26. **Htlm_processor** (Case 4)
27. **Algorithme** (Case 6)
28. **Visualisation** (Case 7)
29. **Notification** (Case 8)
30. **Default** (Case 1)

---

## 💡 Notes Importantes

### Cases Manquants

Les numéros 5, 14 et 15 ne sont pas utilisés dans le router actuel.

### Cases Locaux vs Distants

- **Locaux (localhost:5678)** : Généralement pour les workflows de développement ou tests
- **Distants (t22wtwxl.rpcld.app)** : Workflows de production

### Sentinelles Internes

Les sentinelles internes (`__INTERNAL__*`) ne font pas d'appel HTTP. Elles déclenchent des actions locales dans l'application.

---

## 🔧 Maintenance

### Ajouter un Nouveau Case

1. Ajouter la condition dans `getN8nEndpointWithInfo()`
2. Ajouter le case dans `resolveEndpointFromRouteKey()`
3. Mettre à jour ce tableau
4. Tester avec un message approprié

### Modifier un Endpoint

1. Modifier l'URL dans `resolveEndpointFromRouteKey()`
2. Mettre à jour ce tableau
3. Tester le nouveau endpoint

---

## 📚 Références

- **Fichier source** : `src/services/claraApiService.ts`
- **Méthode principale** : `getN8nEndpointWithInfo()`
- **Méthode helper** : `resolveEndpointFromRouteKey()`

---

**Date de création :** 29 Mars 2026  
**Version :** 1.0  
**Statut :** ✅ Complet et à jour
