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
  
  const response = await fetch('https://graph.facebook.com/v19.0/oauth/access_token', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code: code,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Token exchange error:', error);
    throw new Error(`Token exchange failed: ${error.error.message}`);
  }

  return response.json();
}

export async function getInstagramProfile(accessToken: string): Promise<InstagramProfile> {
  console.log('Fetching Instagram profile...');
  
  // First get the Instagram Business Account ID
  const accountsResponse = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
  );
  
  if (!accountsResponse.ok) {
    const error = await accountsResponse.json();
    throw new Error(`Failed to fetch Facebook pages: ${error.error.message}`);
  }
  
  const accounts = await accountsResponse.json();
  if (!accounts.data || accounts.data.length === 0) {
    throw new Error('No Facebook pages found. Please ensure you have a Facebook page connected to your Instagram account.');
  }
  
  // Get the Instagram Business Account connected to the page
  const pageId = accounts.data[0].id;
  const instagramResponse = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
  );
  
  if (!instagramResponse.ok) {
    const error = await instagramResponse.json();
    throw new Error(`Failed to fetch Instagram business account: ${error.error.message}`);
  }
  
  const instagramData = await instagramResponse.json();
  if (!instagramData.instagram_business_account) {
    throw new Error('No Instagram Business Account found. Please ensure your Facebook page is connected to an Instagram Professional account.');
  }
  
  // Get the Instagram Business Account details
  const igAccountId = instagramData.instagram_business_account.id;
  const profileResponse = await fetch(
    `https://graph.facebook.com/v19.0/${igAccountId}?fields=username,id&access_token=${accessToken}`
  );
  
  if (!profileResponse.ok) {
    const error = await profileResponse.json();
    throw new Error(`Failed to fetch Instagram profile: ${error.error.message}`);
  }
  
  const profile = await profileResponse.json();
  return {
    id: profile.id,
    username: profile.username,
    account_type: 'BUSINESS'
  };
}