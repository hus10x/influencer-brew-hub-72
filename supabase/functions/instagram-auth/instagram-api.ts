export interface InstagramTokenResponse {
  access_token: string;
  token_type: string;
}

export interface InstagramProfile {
  id: string;
  username: string;
  account_type: string;
}

export async function exchangeCodeForToken(
  code: string,
  appId: string,
  appSecret: string,
  redirectUri: string
): Promise<InstagramTokenResponse> {
  console.log('Exchanging code for access token...');
  
  const tokenUrl = 'https://graph.facebook.com/v19.0/oauth/access_token';
  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code: code,
  });

  const response = await fetch(`${tokenUrl}?${params}`);

  if (!response.ok) {
    const error = await response.json();
    console.error('Token exchange error:', error);
    throw new Error(`Token exchange failed: ${error.error?.message || 'Unknown error'}`);
  }

  return response.json();
}

export async function getInstagramProfile(accessToken: string): Promise<InstagramProfile> {
  console.log('Fetching Instagram profile...');
  
  const response = await fetch(
    `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${accessToken}`
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch Instagram profile: ${error.error?.message || 'Unknown error'}`);
  }
  
  const profile = await response.json();
  return {
    id: profile.id,
    username: profile.username,
    account_type: profile.account_type || 'BUSINESS'
  };
}