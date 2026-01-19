# Guide de Dépannage - Données Non Affichées

## 🔍 Diagnostic

### Problème

L'application SmartStrap ne charge pas les données de santé (fréquence cardiaque et oxygène).

### Causes Possibles

#### 1️⃣ **Mauvaise URL API (CAUSE LA PLUS FRÉQUENTE)**

L'URL de connexion dépend de votre environnement :

| Environnement         | URL à utiliser                 |
| --------------------- | ------------------------------ |
| **Émulateur Android** | `http://10.0.2.2:3000` ✅      |
| **Simulateur iOS**    | `http://localhost:3000` ✅     |
| **Appareil Physique** | `http://[IP_DE_VOTRE_PC]:3000` |

#### 2️⃣ **Backend Non Démarré**

Le serveur backend doit tourner sur le port 3000.

#### 3️⃣ **Pare-feu Windows**

Le pare-feu peut bloquer les connexions.

---

## 🛠️ Solutions

### Solution 1 : Vérifier l'URL API

J'ai mis à jour [`_config.ts`](file:///C:/Users/micha/Desktop/ProjetAPP3/SmartStrap_FRONT/app/_config.ts) pour détecter automatiquement la plateforme.

**Pour appareil physique**, modifiez le fichier :

1. Trouvez l'adresse IP de votre PC :

   ```bash
   ipconfig
   ```

   Cherchez "Adresse IPv4" (ex: 192.168.1.100)

2. Dans `_config.ts`, décommentez et modifiez cette ligne :
   ```typescript
   export const API_URL = "http://192.168.1.XXX:3000";
   ```

### Solution 2 : Vérifier que le Backend Tourne

1. Ouvrez un terminal
2. Allez dans le dossier backend :
   ```bash
   cd SmartStrap_BACK
   ```
3. Démarrez le serveur :
   ```bash
   npm run dev
   ```
4. Vérifiez qu'il écoute sur le port 3000

### Solution 3 : Tester les Endpoints Manuellement

Ouvrez votre navigateur et testez :

- http://localhost:3000/api/heart-rate
- http://localhost:3000/api/oxygene-rate

Vous devriez voir des données JSON.

### Solution 4 : Vérifier la Console Metro

Dans le terminal où tourne `npm run start`, vous devriez voir :

```
🌐 API_URL configuré: http://10.0.2.2:3000
```

Si vous voyez des erreurs réseau (Network request failed), c'est un problème de connectivité.

### Solution 5 : Autoriser le Pare-feu

Si vous utilisez un appareil physique :

1. Recherchez "Pare-feu Windows"
2. Cliquez sur "Paramètres avancés"
3. Règles de trafic entrant → Nouvelle règle
4. Type : Port → TCP → Port 3000
5. Autoriser la connexion

---

## ✅ Checklist de Vérification

- [ ] Backend démarré (`npm run dev` dans SmartStrap_BACK)
- [ ] URL API correcte dans `_config.ts`
- [ ] Console Metro ne montre pas d'erreurs réseau
- [ ] Endpoints accessibles depuis le navigateur
- [ ] (Appareil physique) PC et téléphone sur le même WiFi
- [ ] (Appareil physique) Pare-feu autorise le port 3000

---

## 📊 Que Doivent Afficher les Données

**Fréquence Cardiaque :**

- Valeur actuelle : ~60-85 BPM
- Graphique avec 24 points de données

**Saturation en Oxygène :**

- Valeur actuelle : ~95-99%
- Graphique avec 24 points de données

**Statistiques Hebdomadaires :**

- Moyenne fréquence cardiaque
- Moyenne SpO2

---

## 🚨 Message d'Erreur Commun

Si vous voyez dans la console :

```
Erreur lors du chargement des constantes depuis http://10.0.2.2:3000
Network request failed
```

➡️ Cela signifie que l'app ne peut pas atteindre le backend. Vérifiez Solutions 1, 2, et 5.
