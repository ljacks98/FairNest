import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import ResourceScreen from './src/screens/ResourceScreen';
import HousingRightsScreen from './src/screens/HousingRightsScreen';
import FairHousingSupportScreen from './src/screens/FairHousingSupportScreen';
import AboutScreen from './src/screens/AboutScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#2E7D32',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />

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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
