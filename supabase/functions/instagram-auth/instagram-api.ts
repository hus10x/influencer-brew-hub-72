import { corsHeaders } from './response.ts';

export async function exchangeCodeForToken(
  code: string,
  appId: string,
  appSecret: string,
  redirectUri: string
) {
  console.log('Exchanging code for token with app ID:', appId);
  
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
  console.log('Token exchange successful');
  
  return {
    access_token: data.access_token,
    user_id: data.user_id
  };
}

export async function getInstagramProfile(accessToken: string) {
  console.log('Fetching Instagram profile...');
  
  const response = await fetch(
    `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`,
    {
      headers: corsHeaders,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Profile fetch error:', error);
    throw new Error(`Failed to fetch Instagram profile: ${error}`);
  }

  const data = await response.json();
  console.log('Profile fetch successful:', { username: data.username });
  
  return {
    id: data.id,
    username: data.username
  };
}