import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";

interface DoctorCardProps {
  name: string;
  specialty: string;
  image: any;
  onInfoPress?: () => void;
}

export default function DoctorCard({ name, specialty, image, onInfoPress }: DoctorCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.specialty}>{specialty}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.infoButton} onPress={onInfoPress}>
            <Text style={styles.infoText}>Info</Text>
          </TouchableOpacity>
          
          <View style={styles.iconRow}>
            <TouchableOpacity style={styles.iconCircle}>
                <Ionicons name="calendar-outline" size={16} color="#4F8EF7" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle}>
                <Ionicons name="information-circle-outline" size={18} color="#4F8EF7" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle}>
                <Ionicons name="help-circle-outline" size={18} color="#4F8EF7" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle}>
                <Ionicons name="heart-outline" size={16} color="#4F8EF7" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#DCE5FF",
    borderRadius: 25,
    padding: 15,
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: "#EEE",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0055FF",
    fontFamily: "LeagueSpartan_Bold",
  },
  specialty: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
    fontFamily: "LeagueSpartan_Medium",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoButton: {
    backgroundColor: "#2E69FF",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  infoText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  iconRow: {
    flexDirection: "row",
    gap: 8,
  },
  iconCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
  }
});
