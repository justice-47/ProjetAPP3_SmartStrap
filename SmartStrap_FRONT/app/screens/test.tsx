import Navigation from "../composants/navigation";
import AppButton from "../composants/boutton";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
export default function test() {
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'LeagueSpartan_Black', fontSize: 50 }}>Test</Text>
            <AppButton titre="connexion" couleurbouton="#ff0000" couleurtitre="#ffffffff" largeur={250} onPress={() => {alert('connexion en cours.......')}} />
            <Navigation />
        </SafeAreaView>
    );
}