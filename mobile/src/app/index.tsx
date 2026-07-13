import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { isAuthenticated } from '../lib/api';

export default function EntryPoint() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      // Small artificial delay to show splash / load nicely
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const loggedIn = await isAuthenticated();
      if (loggedIn) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/login');
      }
    }
    checkAuth();
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Slate 950
    alignItems: 'center',
    justifyContent: 'center',
  },
});
