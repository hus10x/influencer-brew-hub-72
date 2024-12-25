export const exchangeCodeForToken = async (
  code: string,
  appId: string,
  appSecret: string,
  redirectUri: string
) => {
  console.log('Exchanging code for token with params:', { appId, redirectUri });
  
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
    console.error('Token exchange failed:', error);
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  const data = await response.json();
  console.log('Token exchange successful');
  return data;
};

export const getInstagramProfile = async (accessToken: string) => {
  console.log('Fetching Instagram profile...');
  
  const response = await fetch(
    `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Profile fetch failed:', error);
    throw new Error(`Failed to fetch Instagram profile: ${error}`);
  }

  const data = await response.json();
  console.log('Profile fetch successful');
  return data;
};