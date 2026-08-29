# Correction des Accordéons États Financiers

## Problème Résolu
Les accordéons des états financiers ne s'ouvraient pas au clic.

## Cause
Le script JavaScript était inclus dans le HTML généré par le backend et s'exécutait avant que le DOM soit complètement inséré dans la page.

## Solution Appliquée

### 1. Suppression du Script du Backend
**Fichier**: `py_backend/etats_financiers.py`
- Supprimé le `<script>` de la fonction `generate_etats_financiers_html()`
- Le HTML généré contient uniquement le CSS et la structure HTML

### 2. Gestion des Événements Côté Frontend
**Fichier**: `public/EtatFinAutoTrigger.js`
- Ajout d'un `setTimeout` après l'insertion du HTML dans le DOM
- Attachement des événements `click` sur les `.section-header-ef`
- Logs de débogage pour vérifier le nombre d'accordéons trouvés

```javascript
// Attacher les événements des accordéons APRÈS l'insertion dans le DOM
setTimeout(() => {
  const headers = parentDiv.querySelectorAll('.section-header-ef');
  console.log(`📋 États Financiers: ${headers.length} accordéons trouvés`);
  
  headers.forEach((header) => {
    header.addEventListener('click', function() {
      console.log('🖱️ Clic sur accordéon:', this.textContent.trim());
      this.classList.toggle('active');
      const content = this.nextElementSibling;
      if (content) {
        content.classList.toggle('active');
      }
    });
  });
  
  console.log('✅ Événements des accordéons attachés');
}, 100);
```

## Avantages de Cette Approche

1. **Séparation des responsabilités**
   - Backend : génération du HTML et des données
   - Frontend : gestion des interactions utilisateur

2. **Meilleure fiabilité**
   - Les événements sont attachés après l'insertion complète dans le DOM
   - Pas de problème de timing

3. **Débogage facilité**
   - Logs dans la console pour vérifier le nombre d'accordéons
   - Logs à chaque clic pour confirmer le fonctionnement

## Test
1. Taper "Etat fin" dans l'application
2. Sélectionner un fichier Balance Excel
3. Vérifier dans la console : `📋 États Financiers: 4 accordéons trouvés`
4. Cliquer sur un accordéon → doit s'ouvrir/fermer
5. Vérifier dans la console : `🖱️ Clic sur accordéon: [nom de la section]`

## Fichiers Modifiés
- `py_backend/etats_financiers.py` (ligne ~370)
- `public/EtatFinAutoTrigger.js` (ligne ~220)

## Date
22 mars 2026
