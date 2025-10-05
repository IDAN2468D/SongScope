/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme, Text, View, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

// DEV-only: wrap console methods to stringify arguments so LogBox won't attempt
// to render objects or arrays as React children, which can trigger the
// "Text strings must be rendered within a <Text> component." error.
if (__DEV__) {
  const safe = (args: any[]) => args.map((a) => {
    try {
      if (typeof a === 'string') return a;
      if (a instanceof Error) return a.message || String(a);
      return typeof a === 'object' ? JSON.stringify(a) : String(a);
    } catch (e) {
      return String(a);
    }
  }).join(' ');

  const origLog = console.log.bind(console);
  const origWarn = console.warn.bind(console);
  const origError = console.error.bind(console);

  console.log = (...args: any[]) => origLog(safe(args));
  console.warn = (...args: any[]) => origWarn(safe(args));
  console.error = (...args: any[]) => origError(safe(args));
}

// DEV diagnostic: detect host components that receive raw text children
if (__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const origCreateElement: any = React.createElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.createElement = (type: any, props: any, ...children: any[]) => {
    try {
      if (typeof type === 'string' && children && children.length > 0) {
        const hasRaw = children.some((c) => typeof c === 'string' || typeof c === 'number');
        if (hasRaw) {
          // Log diagnostic info: host type and children preview and stack
          const preview = children.map((c) => (typeof c === 'string' ? c : typeof c === 'number' ? String(c) : typeof c)).slice(0, 5);
          const err = new Error('Raw text child detected in host element');
          // This will be stringified by our safe console wrapper
          console.warn(`DEV_DIAG_RAW_TEXT: type=${String(type)} preview=${JSON.stringify(preview)} stack=${err.stack}`);
        }
      }
    } catch (e) {
      // ignore diagnostics failures
    }
    return origCreateElement(type, props, ...children);
  };
}

// Temporarily silence LogBox UI in development to avoid the runtime
// "Text strings must be rendered within a <Text> component." crash
// originating from LogBox attempting to render complex logs.
if (__DEV__) {
  try {
    LogBox.ignoreAllLogs(true);
  } catch (e) {
    // ignore
  }
}

class ErrorBoundary extends React.Component<any, { hasError: boolean; error: any; info: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  componentDidCatch(error: any, info: any) {
    this.setState({ hasError: true, error, info });
    // Safer logging: log a single string to avoid LogBox rendering complex objects
    try {
      const msg = `ErrorBoundary caught an error: ${error && error.message ? error.message : String(error)}`;
      console.error(msg);
      if (info && info.componentStack) console.error(`Component stack: ${info.componentStack}`);
    } catch (e) {
      // fallback
      console.error('ErrorBoundary caught an error (unable to stringify):', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaProvider>
          <StatusBar barStyle={useColorScheme() === 'dark' ? 'light-content' : 'dark-content'} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>An unexpected error occurred.</Text>
            <Text style={{ color: '#ddd', fontSize: 12 }}>{this.state.error && this.state.error.message ? this.state.error.message : 'See adb logcat for details.'}</Text>
          </View>
        </SafeAreaProvider>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ErrorBoundary>
        <AppNavigator />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

export default App;
