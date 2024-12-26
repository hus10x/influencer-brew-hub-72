import { corsHeaders } from './response.ts';

export async function exchangeCodeForToken(
  code: string,
  appId: string,
  appSecret: string,
  redirectUri: string
) {
  console.log('Exchanging code for token...');
  
  const tokenUrl = 'https://api.instagram.com/oauth/access_token';
  const formData = new FormData();
  formData.append('client_id', appId);
  formData.append('client_secret', appSecret);
  formData.append('grant_type', 'authorization_code');
  formData.append('redirect_uri', redirectUri);
  formData.append('code', code);

  const response = await fetch(tokenUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Token exchange error:', error);
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  const data = await response.json();
  
  // Get the long-lived token
  const longLivedTokenUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${data.access_token}`;
  
  const longLivedResponse = await fetch(longLivedTokenUrl);
  if (!longLivedResponse.ok) {
    const error = await longLivedResponse.text();
    console.error('Long-lived token exchange error:', error);
    throw new Error(`Failed to get long-lived token: ${error}`);
  }

  const longLivedData = await longLivedResponse.json();
  
  return {
    access_token: longLivedData.access_token,
    expires_in: longLivedData.expires_in
  };
}

export async function getInstagramProfile(accessToken: string) {
  console.log('Fetching Instagram profile...');
  
  const url = new URL('https://graph.instagram.com/me');
  url.searchParams.append('fields', 'id,username,account_type');
  url.searchParams.append('access_token', accessToken);
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      ...corsHeaders,
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Profile fetch error:', error);
    throw new Error(`Failed to fetch Instagram profile: ${error}`);
  }

  const data = await response.json();
  console.log('Profile fetch successful:', { username: data.username });
  
  return {
    id: data.id,
    username: data.username,
    account_type: data.account_type
  };
}