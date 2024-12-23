export interface InstagramTokenResponse {
  access_token: string;
  user_id: string;
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
  
  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    }),
  });

  const data = await response.json();
  
  if (data.error) {
    console.error('Token exchange error:', data);
    throw new Error(`Token exchange failed: ${data.error_message || data.error}`);
  }

  return data;
}

export async function getLongLivedToken(
  shortLivedToken: string,
  appSecret: string
): Promise<string> {
  console.log('Getting long-lived token...');
  
  const response = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`
  );
  
  const data = await response.json();
  
  if (data.error) {
    console.error('Long-lived token error:', data);
    throw new Error(`Long-lived token exchange failed: ${data.error_message || data.error}`);
  }

  return data.access_token;
}

export async function getInstagramProfile(accessToken: string): Promise<InstagramProfile> {
  console.log('Fetching Instagram profile...');
  
  const response = await fetch(
    `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${accessToken}`
  );
  
  const data = await response.json();
  
  if (data.error) {
    console.error('Profile fetch error:', data);
    throw new Error(`Profile fetch failed: ${data.error_message || data.error}`);
  }

  return data;
}