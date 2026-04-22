import React from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';

import HomeScreen from './src/screens/HomeScreen';
import ResourceScreen from './src/screens/ResourceScreen';
import HousingRightsScreen from './src/screens/HousingRightsScreen';
import FairHousingSupportScreen from './src/screens/FairHousingSupportScreen';
import AboutScreen from './src/screens/AboutScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import ChatInterface from './src/screens/ChatInterface';
import ProfileScreen from './src/screens/ProfileScreen';
import ReportScreen from './src/screens/ReportScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import DiscriminationCheckerScreen from './src/screens/DiscriminationCheckerScreen';
import ScheduleCallScreen from './src/screens/ScheduleCallScreen';

import { AuthProvider, AuthContext } from './src/context/AuthContext';

const Stack = createStackNavigator();

function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#2E7D32' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

      {/* PUBLIC SCREENS */}
      <Stack.Screen name="Resources" component={ResourceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HousingRights" component={HousingRightsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FairHousingSupport" component={FairHousingSupportScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ headerShown: false }}
      />

      {/* AUTH SCREENS (always accessible) */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />

      <Stack.Screen
        name="ChatInterface"
        component={ChatInterface}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Report" component={ReportScreen} options={{ headerShown: false }} />

      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />

      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DiscriminationChecker"
        component={DiscriminationCheckerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ScheduleCall"
        component={ScheduleCallScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

const linking = {
  prefixes: [],
  config: {
    screens: {
      Home: '',
      Resources: 'resources',
      HousingRights: 'housing-rights',
      FairHousingSupport: 'fair-housing-support',
      About: 'about',
      Login: 'login',
      SignUp: 'signup',
      ChatInterface: 'chat',
      Report: 'report',
      Profile: 'profile',
      AdminDashboard: 'admin',
      DiscriminationChecker: 'discrimination-checker',
      ScheduleCall: 'schedule-call',
    },
  },
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <AuthProvider>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer linking={linking}>
          <MainNavigator />
        </NavigationContainer>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
