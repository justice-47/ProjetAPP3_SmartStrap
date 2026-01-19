# 🚨 CORRECTION RAPIDE - Données ne s'affichent pas

## LE PROBLÈME

```
ERROR Network request failed
http://10.0.2.2:3000
```

L'application ne peut pas se connecter au backend.

## ✅ LA SOLUTION

### **Vous utilisez un APPAREIL PHYSIQUE ?**

1. **Ouvrir** `SmartStrap_FRONT/src/config.ts`

2. **Décommenter la ligne 9** :

   ```typescript
   export const API_URL = "http://192.168.1.72:3000";
   ```

3. **Vérifier** que :

   - ✅ Le backend tourne (`npm run dev` dans SmartStrap_BACK)
   - ✅ Votre PC et téléphone sont sur le **même WiFi**
   - ✅ Le pare-feu Windows autorise le port 3000

4. **Recharger l'application** (secouer le téléphone → Reload)

### **Vous utilisez un ÉMULATEUR Android ou SIMULATEUR iOS** ?

L'URL devrait déjà fonctionner automatiquement. Si ce n'est pas le cas :

1. **Vérifier que le backend tourne** :

   - Terminal → `cd SmartStrap_BACK`
   - `npm run dev`
   - Vous devriez voir "Server running on port 3000"

2. **Tester dans le navigateur** :

   - http://localhost:3000/api/heart-rate
   - Vous devriez voir des données JSON

3. **Si l'émulateur ne se connecte pas** :
   - Utilisez l'IP du PC au lieu de 10.0.2.2
   - Même solution que pour appareil physique ☝️

---

## 🔍 Votre Configuration

**IP de votre PC détectée :** `192.168.1.72`

**Fichier à modifier :** `SmartStrap_FRONT/src/config.ts`

**Ligne à décommenter :**

```typescript
export const API_URL = "http://192.168.1.72:3000";
```

---

## 🎯 Après la Correction

Vous devriez voir :

- ❤️ Fréquence cardiaque : ~60-85 BPM
- 🫁 Oxygène : ~95-99%
- 📊 Graphiques avec 24h de données
- 📈 Statistiques hebdomadaires

**Toujours des problèmes ?** Consultez `TROUBLESHOOTING.md` pour diagnostics avancés.
