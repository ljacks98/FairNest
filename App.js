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
import ProfileScreen from './src/screens/ProfileScreen';
import ReportScreen from './src/screens/ReportScreen';

import { doc, getDoc } from 'firebase/firestore';
import { db } from './src/firebaseConfig';

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
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => {
          const { user, logout } = React.useContext(AuthContext);
          const [displayName, setDisplayName] = React.useState('');

          React.useEffect(() => {
            const fetchName = async () => {
              if (user) {
                const docRef = doc(db, 'users', user.uid);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                  setDisplayName(snap.data().firstName || '');
                }
              }
            };
            fetchName();
          }, [user]);

          return {
            headerTitle: 'FairNest',
            headerRight: () =>
              user ? (
                <View style={{ flexDirection: 'row', marginRight: 10 }}>
                  <Text
                    style={{ color: '#fff', marginRight: 15 }}
                    onPress={() => navigation.navigate('Profile')}>
                    {displayName || 'Account'}
                  </Text>

                  <Text
                    style={{ color: '#fff', fontWeight: 'bold' }}
                    onPress={logout}>
                    Logout
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', marginRight: 10 }}>
                  <Text
                    style={{ color: '#fff', marginRight: 15 }}
                    onPress={() => navigation.navigate('Login')}>
                    Login
                  </Text>
                  <Text
                    style={{ color: '#fff', fontWeight: 'bold' }}
                    onPress={() => navigation.navigate('SignUp')}>
                    Sign Up
                  </Text>
                </View>
              ),
          };
        }}
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
      <Stack.Screen
        name="Report"
        component={ReportScreen}
        options={{ title: 'File Report' }}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
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
