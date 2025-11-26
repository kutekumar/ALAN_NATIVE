import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Suranna_400Regular } from '@expo-google-fonts/suranna';
import * as SplashScreen from 'expo-splash-screen';
import { OnboardingProvider } from './src/context/OnboardingProvider';
import { AuthProvider } from './src/context/AuthProvider';
import RootNavigation from './src/navigation/RootNavigation';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  let [fontsLoaded] = useFonts({
    Suranna_400Regular,
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigation />
            <StatusBar style="auto" />
          </NavigationContainer>
        </AuthProvider>
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}