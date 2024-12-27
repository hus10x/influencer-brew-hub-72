export const exchangeCodeForToken = async (
  code: string,
  appId: string,
  appSecret: string,
  redirectUri: string
) => {
  console.log('Exchanging code for token with params:', { 
    appId, 
    redirectUri,
    hasCode: !!code,
    hasSecret: !!appSecret,
    codeLength: code.length
  });
  
  const tokenUrl = 'https://api.instagram.com/oauth/access_token';
  
  const formData = new FormData();
  formData.append('client_id', appId);
  formData.append('client_secret', appSecret);
  formData.append('grant_type', 'authorization_code');
  formData.append('redirect_uri', redirectUri);
  formData.append('code', code);

  try {
    console.log('Making token exchange request...');
    const response = await fetch(tokenUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to exchange code for token: ${errorText}`);
    }

    const data = await response.json();
    console.log('Token exchange successful:', {
      hasAccessToken: !!data.access_token,
      tokenType: data.token_type
    });
    return data;
  } catch (error) {
    console.error('Error in token exchange:', error);
    throw error;
  }
};

export const getInstagramProfile = async (accessToken: string) => {
  console.log('Fetching Instagram profile...');
  
  try {
    const headers = new Headers({
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    });
    
    console.log('Making profile request with Authorization header...');
    const response = await fetch(
      'https://graph.instagram.com/me?fields=id,username',
      {
        method: 'GET',
        headers: headers
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Profile fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to fetch Instagram profile: ${errorText}`);
    }

    const data = await response.json();
    console.log('Profile fetch successful:', { 
      username: data.username,
      hasId: !!data.id 
    });
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};