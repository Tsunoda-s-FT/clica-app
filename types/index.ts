import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

export interface LoginData {
  userID: string;
  password: string;
  autoLoginEnabled: boolean;
}

export interface NavigationState {
  url: string;
}

export interface WebViewNavigationEvent {
  url: string;
  navigationType?: string;
}

export interface WebViewMessage {
  nativeEvent: {
    data: string;
  };
}

export type RootStackParamList = {
  AuthTabs: undefined;
  Main: { uri: string };
  Settings: undefined;
  Login: undefined;
};

export type TabParamList = {
  Login: { onLogin: (loginData: LoginData) => void };
  Settings: { onLogin: (loginData: LoginData) => void };
};

export type LoginScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Login'>,
  StackScreenProps<RootStackParamList>
>;

export type SettingsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Settings'>,
  StackScreenProps<RootStackParamList>
>; 