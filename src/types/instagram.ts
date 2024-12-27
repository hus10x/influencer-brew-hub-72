export interface InstagramAuthConfig {
  clientId: string;
  redirectUri: string;
  scope?: string;
}

export interface InstagramAuthResponse {
  code: string;
  access_token?: string;
  error?: string;
  error_description?: string;
}

export interface InstagramProfile {
  id: string;
  username: string;
  account_type?: string;
}

export interface InstagramAuthState {
  isConnected: boolean;
  isLoading: boolean;
  error?: string;
  profile?: InstagramProfile;
}