import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { LoginData, WebViewMessage, LoginScreenProps } from '../types';

const MAX_LOGIN_ATTEMPTS = 10;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
  const [loginData, setLoginData] = useState<LoginData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [webViewKey, setWebViewKey] = useState<number>(0);
  const [currentUrl, setCurrentUrl] = useState<string>('https://clica.jp/app/');
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  const isFocused = useIsFocused();

  const fetchLoginData = useCallback(async () => {
    try {
      const storedData = await AsyncStorage.getItem('loginData');
      if (storedData) {
        setLoginData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error fetching login data:', error);
      Alert.alert('Error', 'Failed to fetch login data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoginData();
  }, [fetchLoginData]);

  useEffect(() => {
    if (isFocused) {
      fetchLoginData();
      setWebViewKey(prev => prev + 1);
    }
  }, [isFocused, fetchLoginData]);

  const injectJavaScriptToFillForm = useCallback(() => {
    if (!loginData?.autoLoginEnabled) return '';

    return `
      (function() {
        var userInput = document.getElementById('ctl00_cplPageContent_txtUserID');
        var passwordInput = document.getElementById('ctl00_cplPageContent_txtPassword');

        if (userInput && passwordInput) {
          userInput.value = '${loginData.userID}';
          passwordInput.value = '${loginData.password}';
          setTimeout(() => {
            __doPostBack('ctl00$cplPageContent$LinkButton1', '');
          }, 1000);
        }

        var logoutButton = document.querySelector('a[href="https://clica.jp/app/logout.aspx"]');
        if (logoutButton) {
          logoutButton.addEventListener('click', function() {
            window.ReactNativeWebView.postMessage('logout');
          });
        }
      })();
    `;
  }, [loginData]);

  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    if (navState.url.includes('home/default.aspx')) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    if (navState.url.includes('default.aspx') && loginData?.autoLoginEnabled) {
      setLoginAttempts(prev => {
        const newAttempts = prev + 1;
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          AsyncStorage.removeItem('loginData').then(() => {
            Alert.alert('Login Error', 'Too many login attempts', [{
              text: 'OK',
              onPress: () => navigation.navigate('Settings' as never)
            }]);
          });
          return 0;
        }
        return newAttempts;
      });
    }

    if (navState.url.includes('logout.aspx')) {
      try {
        const storedData = await AsyncStorage.getItem('loginData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          await AsyncStorage.setItem('loginData', JSON.stringify({
            ...parsedData,
            autoLoginEnabled: false
          }));
        }
      } catch (error) {
        console.error('Error handling logout:', error);
      }
      navigation.navigate('AuthTabs' as never);
    }
  };

  const handleMessage = (event: WebViewMessage) => {
    if (event.nativeEvent.data === 'logout') {
      handleNavigationStateChange({ url: 'logout.aspx' } as WebViewNavigation);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView
        key={webViewKey}
        source={{ uri: currentUrl }}
        injectedJavaScript={injectJavaScriptToFillForm()}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
};

export default LoginScreen; 