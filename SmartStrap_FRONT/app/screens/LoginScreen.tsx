import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { API_URL } from "../config";
import { useRouter } from "expo-router";
import AppButton from "../composants/boutton";
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Champs incomplets",
        "Veuillez remplir tous les champs (Email et Mot de passe) avant de continuer."
      );
      return;
    }

    try {
      const SERVER_URL = `${API_URL}/api/auth/login`;

      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Succès", `Bienvenue ${data.user.nom} ! ✅`);
        router.push("/screens/Accueil");
      } else {
        Alert.alert("Erreur", data.message || "Identifiants incorrects");
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Erreur réseau",
        "Impossible de joindre le serveur. Vérifiez votre connexion."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.headerTitle}>Connexion</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email ou Numéro de téléphone</Text>
          <TextInput
            style={styles.input}
            placeholder="example@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Mot De Passe</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="************"
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Text style={{ fontSize: 18 }}>
                {isPasswordVisible ? "👁️" : "🙈"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/screens/PasswordScreen")}
          >
            <Text style={styles.forgotText}>mot de passe oublié</Text>
          </TouchableOpacity>
        </View>

        <AppButton
          titre="Mode Médecin"
          onPress={() => router.push("/screens/DoctorDashboard")}
          largeur={"100%"}
          couleurbouton="#0055FF"
          couleurtitre="#ffffff"
        />
        <View style={{ marginBottom: 15 }} />
        <AppButton
          titre="Connexion"
          onPress={handleLogin}
          largeur={"100%"}
          couleurbouton="#FF0000"
          couleurtitre="#ffffffff"
        />

        <View style={styles.socialSection}>
          <Text style={styles.orText}>ou connectez vous avec</Text>

          <View style={styles.socialIconsContainer}>
            <TouchableOpacity style={styles.iconCircle}>
              <Text style={styles.iconPlaceholderG}>G</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.iconCircle, styles.bioBg]}>
              <Text style={styles.iconPlaceholder}>🧬</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.iconCircle, styles.fbBg]}>
              <Text style={styles.iconPlaceholder}>f</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.footerLink}
          onPress={() => router.push("/screens/SignupScreen")}
        >
          <Text style={styles.footerText}>
            Vous n'avez pas encore de compte ?{" "}
            <Text style={styles.link}>Inscrivez-vous</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  inner: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "LeagueSpartan_Bold",
    color: "#0055FF",
    marginBottom: 30,
  },
  inputContainer: { width: "100%" },
  label: { fontSize: 13, fontFamily: "LeagueSpartan_Regular", marginBottom: 5 },
  input: {
    backgroundColor: "#F0F4FF",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    fontFamily: "LeagueSpartan_Regular",
    marginBottom: 15,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    borderRadius: 12,
    marginBottom: 15,
  },
  passwordInput: { flex: 1, padding: 12, fontFamily: "LeagueSpartan_Regular" },
  eyeIcon: { paddingHorizontal: 15 },
  forgotText: {
    color: "#0055FF",
    fontSize: 11,
    fontFamily: "LeagueSpartan_Bold",
    textAlign: "right",
    marginBottom: 20,
  },
  mainButton: {
    backgroundColor: "#FF0000",
    width: "100%",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "LeagueSpartan_Regular",
  },
  buttonText: { color: "#FFF", fontSize: 16, fontFamily: "LeagueSpartan_Bold" },
  socialSection: { marginTop: 40, alignItems: "center", width: "100%" },
  orText: {
    color: "#666",
    fontSize: 18,
    marginBottom: 20,
    fontFamily: "LeagueSpartan_Regular",
  },
  socialIconsContainer: { flexDirection: "row", justifyContent: "center" },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bioBg: { backgroundColor: "#DDE6FF" },
  fbBg: { backgroundColor: "#1877F2" },
  iconPlaceholderG: { fontSize: 20, fontWeight: "bold", color: "#DB4437" },
  iconPlaceholder: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
  footerLink: { marginTop: 30, alignItems: "center" },
  footerText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "LeagueSpartan_Regular",
  },
  link: { color: "#0055FF", fontFamily: "LeagueSpartan_Bold" },
});
