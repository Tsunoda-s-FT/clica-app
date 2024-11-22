import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Alert, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator, 
  StatusBar, 
  Switch 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { LoginData, SettingsScreenProps } from '../types';

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation, route }) => {
  const [userID, setUserID] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [webviewUrl, setWebviewUrl] = useState<string | null>(null);
  const [autoLoginEnabled, setAutoLoginEnabled] = useState<boolean>(false);

  useEffect(() => {
    const fetchLoginData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('loginData');
        if (storedData) {
          const parsedData: LoginData = JSON.parse(storedData);
          setUserID(parsedData.userID);
          setPassword(parsedData.password);
          setAutoLoginEnabled(parsedData.autoLoginEnabled);
        }
      } catch (error) {
        console.error('Error loading login data:', error);
        Alert.alert('Error', 'Failed to load settings');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchLoginData();
  }, []);

  const handleAutoLoginToggle = async (newValue: boolean) => {
    setAutoLoginEnabled(newValue);
    try {
      const storedData = await AsyncStorage.getItem('loginData');
      if (storedData) {
        const parsedData: LoginData = JSON.parse(storedData);
        await AsyncStorage.setItem('loginData', JSON.stringify({
          ...parsedData,
          autoLoginEnabled: newValue
        }));
      }
    } catch (error) {
      console.error('Error saving auto-login state:', error);
    }
  };

  const saveLoginData = async () => {
    if (!userID || !password) {
      Alert.alert('Error', 'Please fill out both fields');
      return;
    }

    const loginData: LoginData = {
      userID,
      password,
      autoLoginEnabled
    };

    try {
      await AsyncStorage.setItem('loginData', JSON.stringify(loginData));
      Alert.alert('Success', 'Login data saved', [{
        text: 'OK',
        onPress: () => navigation.navigate('Login' as never)
      }]);
    } catch (error) {
      console.error('Error saving login data:', error);
      Alert.alert('Error', 'Failed to save login data');
    }
  };

  if (isLoadingData) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (webviewUrl) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <WebView source={{ uri: webviewUrl }} style={{ flex: 1 }} />
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setWebviewUrl(null)}
        >
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.formContainer}>
        <TextInput
          placeholder="ログインIDを入力"
          value={userID}
          onChangeText={setUserID}
          style={styles.input}
        />
        <TextInput
          placeholder="パスワードを入力"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <View style={styles.switchContainer}>
          <Text>自動ログイン</Text>
          <Switch
            value={autoLoginEnabled}
            onValueChange={handleAutoLoginToggle}
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveLoginData}
        >
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => setWebviewUrl('https://clica.jp/app/signup/user_entry.aspx')}
        >
          <Text style={styles.linkText}>受講者アカウント登録</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => setWebviewUrl('https://clica.jp/app/remind/_sub/remind.aspx')}
        >
          <Text style={styles.linkText}>パスワードを忘れた方</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    padding: 20,
    flex: 1,
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    padding: 10,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  linkButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SettingsScreen; 