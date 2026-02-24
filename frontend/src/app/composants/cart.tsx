import React from "react";
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  ImageResizeMode,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type CartProps = {
  style?: ViewStyle;
  text?: string;
  icons?: React.ReactNode;
  styleText?: TextStyle;
  images?: ImageSourcePropType;
  resizeMode?: ImageResizeMode;
  imageStyle?: ImageStyle;
  vertical?: boolean; // permet de changer l'alignement image/texte/icône
};

export default function Cart({
  style,
  text,
  icons,
  styleText,
  images,
  resizeMode = "cover",
  imageStyle,
  vertical = false,
}: CartProps) {
  return (
    <View
      style={[
        styles.container,
        style,
        vertical && { flexDirection: "column" }, // alignement vertical si demandé
      ]}
    >
      {images && (
        <Image
          style={[styles.images, imageStyle]}
          source={images}
          resizeMode={resizeMode}
        />
      )}
      {icons && icons}
      {text && <Text style={[styles.text, styleText]}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    flexDirection: "row", // horizontal par défaut
    alignItems: "center",
    justifyContent: "center",
    gap: 5,

    
    
  },
  text: {
    fontWeight: "600",
    fontSize: 20,
    fontFamily: "LeagueSpartan_Medium",
    textAlign: "center",
  },
  icon: {
    fontSize: 24,
    color: "black",
  },
  images: {
    width: "100%",
    height: "100%",
    borderRadius: 100, // permet de rendre l'image circulaire si carré
  },
});
