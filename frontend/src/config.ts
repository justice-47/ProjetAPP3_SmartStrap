import { Platform } from "react-native";

// ⚠️ CONFIGURATION IMPORTANTE - LISEZ CECI ⚠️
//
// 🔧 SI VOUS UTILISEZ UN APPAREIL PHYSIQUE :
//    Décommentez la ligne 9 ci-dessous et utilisez l'IP de votre PC
//
// ✅ SI VOUS UTILISEZ UN ÉMULATEUR/SIMULATEUR :
//    Laissez tel quel, la configuration automatique fonctionnera

// ← DÉCOMMENTEZ CETTE LIGNE pour appareil physique

// Configuration automatique
const getApiUrl = () => {
  if (__DEV__) {
    // 192.168.1.78 est votre adresse IP locale pour le téléphone physique sur le même WiFi
    return "http://10.14.221.164:3000";
  } else {
    return "https://your-production-api.com"; // Production
  }
};

export const API_URL = getApiUrl();
export const WS_URL = API_URL.replace(":3000", ":8000").replace("http", "ws");

console.log("🌐 API_URL configuré:", API_URL);
console.log("📱 Platform:", Platform.OS);
console.log("");
console.log("⚠️ SI LES DONNÉES NE S'AFFICHENT PAS :");
console.log("   1. Vérifiez que le backend tourne (npm run dev)");
console.log("   2. Si vous utilisez un APPAREIL PHYSIQUE :");
console.log("      → Modifiez src/config.ts ligne 9");
console.log("      → Utilisez : http://192.168.1.102:3000");
console.log("      → PC et téléphone doivent être sur le même WiFi");
console.log("");
