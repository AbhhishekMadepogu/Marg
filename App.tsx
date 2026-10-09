import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/hooks/useAuth';
import AppStack from './src/navigation/AppStack';
import { queryClient } from './src/utility/queryClient';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppStack />
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
