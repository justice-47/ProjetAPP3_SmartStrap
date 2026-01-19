import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import Navigation from "../composants/navigation";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "../../src/config";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
 
  const [profile, setProfile] = useState({
    nom: "",
    prenom: "",
    email: "",
    age: "",
    poids: "",
    taille: "",
    genre: "Homme",
    antecedents: "",
    password: "", 
  });

  const [bmi, setBmi] = useState(0);
  const [bmiStatus, setBmiStatus] = useState("normal");
  const [bmiColor, setBmiColor] = useState("#4caf50");

  useEffect(() => {
    const initializeProfile = async () => {
      const storedId = await AsyncStorage.getItem("userId");
      if (storedId) {
        setUserId(storedId);
        await fetchProfile(storedId);
      }
    };
    
    initializeProfile();
  }, []);

  useEffect(() => {
    calculateBMI();
  }, [profile.poids, profile.taille]);

  const fetchProfile = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/users/profile/${id}`);
      const data = await response.json();
      if (response.ok) {
        setProfile({
          ...profile,
          nom: data.nom || "",
          prenom: data.prenom || "",
          email: data.email || "",
          age: data.age?.toString() || "",
          poids: data.poids?.toString() || "",
          taille: data.taille?.toString() || "",
          genre: data.genre || "Homme",
          antecedents: data.antecedents || "",
        });
      }
    } catch (error) {
      console.log("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = () => {
    const weight = parseFloat(profile.poids);
    const heightCm = parseFloat(profile.taille);
    
    if (weight > 0 && heightCm > 0) {
      const heightM = heightCm / 100;
      const bmiValue = weight / (heightM * heightM);
      setBmi(parseFloat(bmiValue.toFixed(1)));
      
      if (bmiValue < 18.5) {
        setBmiStatus("insuffisance pondérale");
        setBmiColor("#FFC107");
      } else if (bmiValue >= 18.5 && bmiValue < 25) {
        setBmiStatus("normal");
        setBmiColor("#4caf50");
      } else if (bmiValue >= 25 && bmiValue < 30) {
        setBmiStatus("surpoids");
        setBmiColor("#FF9800");
      } else {
        setBmiStatus("obésité");
        setBmiColor("#f44336");
      }
    } else {
      setBmi(0);
      setBmiStatus("--");
      setBmiColor("#e0e0e0");
    }
  };

  const handleUpdate = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: profile.nom,
          prenom: profile.prenom,
          email: profile.email,
          age: parseInt(profile.age),
          poids: parseFloat(profile.poids),
          taille: parseFloat(profile.taille),
          genre: profile.genre,
          antecedents: profile.antecedents,
        }),
      });

      if (response.ok) {
        Alert.alert("Succès", "Profil mis à jour avec succès !");
      } else {
        Alert.alert("Erreur", "Impossible de mettre à jour le profil.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Se déconnecter",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userName');
            
            Alert.alert("Déconnecté", "Vous avez été déconnecté avec succès");
            router.replace("/screens/LoginScreen"); 
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: "https://i.pravatar.cc/300" }} // Placeholder
              style={styles.avatar}
            />
            <View style={styles.editIconContainer}>
              <MaterialIcons name="edit" size={16} color="#FFF" />
            </View>
          </View>
          <Text style={styles.userName}>{profile.nom} {profile.prenom}</Text>
        </View>

        {/* BMI Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Indice de Masse Corporelle</Text>
          <View style={styles.bmiContainer}>
            <Text style={styles.bmiValue}>{bmi}</Text>
            <Text style={[styles.bmiStatus, { color: bmiColor }]}>{bmiStatus}</Text>
          </View>
          <View style={styles.bmiBarContainer}>
            <View style={[styles.bmiBarFill, { backgroundColor: bmiColor, width: `${Math.min((bmi / 40) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.bmiFooter}>Calculé À Partir De Votre Poids Et De Votre Taille</Text>
        </View>

        {/* Personal Info Form */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Informations Personnelles</Text>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                value={profile.nom}
                onChangeText={(text) => setProfile({...profile, nom: text})}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                value={profile.prenom}
                onChangeText={(text) => setProfile({...profile, prenom: text})}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={profile.age}
                keyboardType="numeric"
                onChangeText={(text) => setProfile({...profile, age: text})}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Poids</Text>
              <View style={styles.inputWithUnit}>
                 <TextInput
                  style={[styles.input, {borderWidth:0, flex:1}]}
                  value={profile.poids}
                  keyboardType="numeric"
                  onChangeText={(text) => setProfile({...profile, poids: text})}
                />
                <Text style={styles.unitText}>Kg</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Genre</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={profile.genre}
                  onValueChange={(itemValue) => setProfile({...profile, genre: itemValue})}
                  style={styles.picker}
                >
                  <Picker.Item label="Homme" value="Homme" />
                  <Picker.Item label="Femme" value="Femme" />
                </Picker>
              </View>
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Taille</Text>
              <View style={styles.inputWithUnit}>
                 <TextInput
                  style={[styles.input, {borderWidth:0, flex:1}]}
                  value={profile.taille}
                  keyboardType="numeric"
                  onChangeText={(text) => setProfile({...profile, taille: text})}
                />
                <Text style={styles.unitText}>Cm</Text>
              </View>
            </View>
          </View>

           <View style={styles.fullInput}>
              <Text style={styles.label}>Antécédents Medicaux</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={profile.antecedents}
                multiline
                numberOfLines={3}
                onChangeText={(text) => setProfile({...profile, antecedents: text})}
              />
            </View>
             
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
              <Text style={styles.saveButtonText}>Sauvegarder Les Modification</Text>
            </TouchableOpacity>

        </View>

        <View style={styles.card}>
           <Text style={styles.sectionHeader}>Sécurité & Confidentialité</Text>
            
           <View style={styles.fullInput}>
              <Text style={styles.label}>Mail</Text>
              <View style={styles.iconInputContainer}>
                <MaterialIcons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.iconInput}
                  value={profile.email}
                  editable={false} 
                />
              </View>
            </View>

             <View style={styles.fullInput}>
              <Text style={styles.label}>Mot De Passe</Text>
               <View style={styles.iconInputContainer}>
                <FontAwesome5 name="lock" size={18} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.iconInput}
                  value=".................." 
                  editable={false}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.encryptionInfo}>
              <MaterialIcons name="security" size={24} color="#1565C0" />
              <View style={{marginLeft: 10, flex: 1}}>
                 <Text style={styles.encryptionTitle}>Données cryptées</Text>
                 <Text style={styles.encryptionDesc}>Vos données de santé sont cryptées localement et protégées par des protocoles de sécurité avancés</Text>
              </View>
            </View>

             <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Se Deconnecter</Text>
            </TouchableOpacity>

        </View>

      </ScrollView>
      <Navigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007AFF",
  },
  backButton: {
    padding: 5,
  },
  settingsButton: {
    padding: 5,
  },
  scrollContent: {
    paddingBottom: 100, 
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginTop: 10,
  },
  card: {
    backgroundColor: "#BBDEFB", 
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
  },
  cardTitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  bmiContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: "300",
    color: "#333",
  },
  bmiStatus: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: -5,
  },
  bmiBarContainer: {
    height: 6,
    backgroundColor: "#FFF",
    borderRadius: 3,
    marginVertical: 10,
    overflow: "hidden",
  },
  bmiBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  bmiFooter: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF", 
    alignSelf: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 1
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  halfInput: {
    width: "48%",
  },
  fullInput: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
     backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 5,
  },
  unitText: {
    paddingRight: 10,
    color: '#666'
  },
  pickerContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: 'hidden',
    height: 48, 
    justifyContent: 'center'
  },
  picker: {
    width: '100%',
     color: "#333",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#000",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  iconInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  iconInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#555",
  },
  encryptionInfo: {
    flexDirection: 'row',
    backgroundColor: "#2196F3", 
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  encryptionTitle: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  encryptionDesc: {
    color: "#E3F2FD",
    fontSize: 11,
    marginTop: 2,
    flexWrap: 'wrap'
  },
  logoutButton: {
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#f44336"
  },
  logoutButtonText: {
    color: "#f44336",
    fontWeight: "600",
    fontSize: 16,
  }
});
