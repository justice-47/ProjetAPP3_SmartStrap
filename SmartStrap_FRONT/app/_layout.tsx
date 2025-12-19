import { Stack } from "expo-router";
import { useFonts } from 'expo-font';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'LeagueSpartan_Thin': require('../assets/fonts/LeagueSpartan-Thin.ttf'),
    'LeagueSpartan_Light': require('../assets/fonts/LeagueSpartan-Light.ttf'),
    'LeagueSpartan_Regular': require('../assets/fonts/LeagueSpartan-Regular.ttf'),
    'LeagueSpartan_Medium': require('../assets/fonts/LeagueSpartan-Medium.ttf'),
    'LeagueSpartan_SemiBold': require('../assets/fonts/LeagueSpartan-SemiBold.ttf'),
    'LeagueSpartan_Bold': require('../assets/fonts/LeagueSpartan-Bold.ttf'),
    'LeagueSpartan_ExtraBold': require('../assets/fonts/LeagueSpartan-ExtraBold.ttf'),
    'LeagueSpartan_Black': require('../assets/fonts/LeagueSpartan-Black.ttf'),
    'LeagueSpartan_ExtraLight': require('../assets/fonts/LeagueSpartan-ExtraLight.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }
  return <Stack 
  screenOptions={{
    headerShown: false,
  }}
    />;
}
