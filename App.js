import React, { useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './src/screens/HomeScreen';
import ResourceScreen from './src/screens/ResourceScreen';
import HousingRightsScreen from './src/screens/HousingRightsScreen';
import FairHousingSupportScreen from './src/screens/FairHousingSupportScreen';
import AboutScreen from './src/screens/AboutScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import ChatInterface from './src/screens/ChatInterface';

import { AuthProvider, AuthContext } from './src/context/AuthContext';

const Stack = createStackNavigator();

function MainNavigator() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#2E7D32' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          headerTitle: 'FairNest',
          headerRight: () =>
            user ? (
              <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  Logout
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: 'row', marginRight: 10 }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  style={{ marginRight: 15 }}>
                  <Text style={{ color: '#fff' }}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            ),
        })}
      />

      {/* PUBLIC SCREENS */}
      <Stack.Screen name="Resources" component={ResourceScreen} />
      <Stack.Screen
        name="HousingRights"
        component={HousingRightsScreen}
        options={{ title: 'Housing Rights' }}
      />
      <Stack.Screen
        name="FairHousingSupport"
        component={FairHousingSupportScreen}
        options={{ title: 'Fair Housing Support' }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About FairNest' }}
      />

      {/* AUTH SCREENS (always accessible) */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />

      <Stack.Screen
        name="ChatInterface"
        component={ChatInterface}
        options={{ title: 'AI Assistant' }}
      />

      {/* PROTECTED SCREENS will be added later */}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
