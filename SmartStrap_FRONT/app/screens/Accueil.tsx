import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Navigation from "../composants/navigation";
import { Text } from "react-native";


export default function Accueil() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={{ fontFamily: 'LeagueSpartan_Black', fontSize: 50 }}>Accueil</Text>
            <Navigation />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'LeagueSpartan_Black',
    },
});