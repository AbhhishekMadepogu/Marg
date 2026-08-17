import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/hooks/useAuth';
import AppStack from './src/navigation/AppStack';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppStack />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
