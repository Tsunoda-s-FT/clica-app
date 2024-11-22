import React, { useState, useEffect } from 'react';
import { SafeAreaView, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import SettingsScreen from './screens/SettingsScreen';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LoginData, RootStackParamList, TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

interface AuthTabsProps {
  onLogin: (loginData: LoginData) => void;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ onLogin }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string = '';

        if (route.name === 'Login') {
          iconName = focused ? 'log-in' : 'log-in-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#87CEFA',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen 
      name="Login" 
      children={(props) => <LoginScreen {...props} />}
      initialParams={{ onLogin }}
    />
    <Tab.Screen 
      name="Settings" 
      children={(props) => <SettingsScreen {...props} />}
      initialParams={{ onLogin }}
    />
  </Tab.Navigator>
);

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loginData = await AsyncStorage.getItem('loginData');
        setIsLoggedIn(!!loginData);
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async (loginData: LoginData) => {
    try {
      await AsyncStorage.setItem('loginData', JSON.stringify(loginData));
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error saving login data:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="AuthTabs">
            {props => <AuthTabs {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen 
            name="Main" 
            component={WebView}
            initialParams={{ uri: 'https://clica.jp/app/' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
