import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { API_URL } from "../../config";

import { useRouter, useLocalSearchParams } from "expo-router";

export default function SetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userInfo = params.userInfo
    ? JSON.parse(params.userInfo as string)
    : null;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!userInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.inner}>
          <Text style={{ color: "red", textAlign: "center", marginBottom: 20 }}>
            Erreur : Les informations d'inscription n'ont pas été reçues.
          </Text>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Retourner à l'inscription</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleRegisterFinal = async () => {
    if (password.length < 6) {
      Alert.alert(
        "Erreur",
        "Le mot de passe doit faire au moins 6 caractères.",
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userInfo,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Succès", "Votre compte a été créé ! ✅");
        router.replace("/screens/LoginScreen");
      } else {
        Alert.alert("Erreur", data.message || "Erreur lors de la création.");
      }
    } catch (error) {
      Alert.alert(
        "Erreur Réseau",
        "Impossible de joindre le serveur. Vérifiez votre connexion IP.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.headerTitle}>Dernière étape</Text>

        <Text style={styles.instructions}>
          Bonjour {userInfo?.prenom || "Utilisateur"}, créez votre mot de passe
          pour {userInfo?.email}.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nouveau mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="************"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>Confirmer le mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="************"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity
          style={[styles.mainButton, loading && styles.disabledButton]}
          onPress={handleRegisterFinal}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Finaliser l'inscription</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  inner: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0055FF",
    marginBottom: 10,
  },
  instructions: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: { width: "100%" },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 5 },
  input: {
    backgroundColor: "#F0F4FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  mainButton: {
    backgroundColor: "#FF0000",
    width: "100%",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: { backgroundColor: "#CCCCCC" },
  buttonText: { color: "#FFF", fontWeight: "bold" },
});
