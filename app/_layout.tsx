import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// Removed direct import of useFrameworkReady and fonts as they are not executable in this viewer context
// import { useFrameworkReady } from '@/hooks/useFrameworkReady';
// import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';

// Prevent splash screen from auto-hiding
// SplashScreen.preventAutoHideAsync(); // This would be for the actual app runtime

export default function RootLayout() {
  // useFrameworkReady(); // Call hook

  // const [fontsLoaded, fontError] = useFonts({
  //   'Inter-Regular': Inter_400Regular,
  //   'Inter-Bold': Inter_700Bold,
  // });

  // useEffect(() => {
  //   if (fontsLoaded || fontError) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [fontsLoaded, fontError]);

  // // Return null to keep splash screen visible while fonts load
  // if (!fontsLoaded && !fontError) {
  //   return null;
  // }
  // Simplified for viewer: Assume fonts are handled by browser/OS or not critical for viewing code structure
  
  useEffect(() => {
    // Simulate hiding splash screen if it were a real app context
    SplashScreen.hideAsync?.().catch(() => {}); // Optional chaining for safety
  }, []);


  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

