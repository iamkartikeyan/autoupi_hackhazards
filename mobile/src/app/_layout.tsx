import { DarkTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

const AutoupiDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#020617', // Slate 950
    card: '#0f172a', // Slate 900
    text: '#ffffff',
    border: 'rgba(255, 255, 255, 0.05)',
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Standard system fonts will fall back gracefully, but we can check font loads if we configure them.
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Hide splash screen immediately if font load isn't being tracked
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={AutoupiDarkTheme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="process" options={{ gestureEnabled: false }} />
          <Stack.Screen name="success" options={{ gestureEnabled: false }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
