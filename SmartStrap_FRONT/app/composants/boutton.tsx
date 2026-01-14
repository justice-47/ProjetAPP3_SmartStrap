import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

type AppButtonProps = {
  largeur?: ViewStyle["width"];
  couleurbouton?: string;
  couleurtitre?: string;
  couleurbordure?: string;
  bordure?: number;
  titre: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function AppButton({
  bordure,
  couleurbouton = "#00386A",
  couleurtitre = "#ffffffff",
  couleurbordure = "#00386A",
  largeur = 200,
  titre,
  onPress,
  disabled = false,
}: AppButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { width: largeur },
        { height: 45 },
        { backgroundColor: couleurbouton },
        { borderColor: couleurbordure },
        { borderWidth: bordure },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: couleurtitre }]}>{titre}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingBottom: 8,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
    marginHorizontal: 10,
  },

  disabledButton: {
    backgroundColor: "#A0A0A0",
    elevation: 0,
    shadowOpacity: 0,
  },
  text: {
    fontSize: 25,
    textAlign: "center",
    fontFamily: "LeagueSpartan_Regular",
  },
});
