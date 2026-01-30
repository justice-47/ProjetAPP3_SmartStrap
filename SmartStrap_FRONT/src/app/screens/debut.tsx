import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, Image } from "react-native";
import AppButton from "../composants/boutton";
import { useRouter } from "expo-router";

export default function Debut() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../../../assets/images/logo.png")}
        style={{ width: 300, height: 300, marginBottom: -80 }}
      />
      <Text
        style={{
          fontSize: 40,
          fontWeight: "300",
          textAlign: "center",
          justifyContent: "center",
          fontFamily: "LeagueSpartan_Thin",
          marginTop: 0,
        }}
      >
        Smart
      </Text>
      <Text
        style={{
          fontSize: 40,
          fontWeight: "300",
          textAlign: "center",
          justifyContent: "center",
          fontFamily: "LeagueSpartan_Thin",
          marginTop: -20,
        }}
      >
        Strap
      </Text>
      <Text
        style={{
          fontSize: 20,
          textAlign: "center",
          justifyContent: "center",
          fontFamily: "LeagueSpartan_SemiBold",
          marginTop: 15,
        }}
      >
        Bracelet Intelligent
      </Text>
      <Text
        style={{
          fontSize: 16,
          fontFamily: "LeagueSpartan_Medium",
          textAlign: "center",
          justifyContent: "center",
          margin: 65,
          marginTop: 30,
          marginBottom: 60,
        }}
      >
        Suivez votre santé et vos performances en temps réel grâce à Smart
        Strap. Un bracelet intelligent conçu pour vous accompagner au quotidien.
      </Text>
      <AppButton
        titre="connexion"
        couleurbouton="#00386A"
        couleurtitre="#ffffffff"
        largeur={250}
        onPress={() => {
          router.push("/screens/LoginScreen");
        }}
      />
      <AppButton
        titre="inscription"
        couleurbouton="#2260FF"
        couleurtitre="#ffffffff"
        largeur={250}
        onPress={() => {
          router.push("/screens/SignupScreen");
        }}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -80,
  },
});
