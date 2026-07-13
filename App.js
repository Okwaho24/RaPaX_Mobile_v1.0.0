// ─────────────────────────────────────────────────────────────
//  RaPaX™ Mobile — App Entry Point
//  Archer Chain Analytics™
//  Sovereign. Zero-Trust. Zero Compromise.
// ─────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation';
import { loadConfig } from './src/services/api';
import { Colors } from './src/theme';

// Suppress known third-party warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export default function App() {
  useEffect(() => {
    // Pre-load saved config from AsyncStorage on startup
    loadConfig().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.black}
        />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
