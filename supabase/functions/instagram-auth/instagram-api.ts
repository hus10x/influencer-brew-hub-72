export const exchangeCodeForToken = async (
  code: string,
  appId: string,
  appSecret: string,
  redirectUri: string
) => {
  console.log('Starting token exchange with params:', { 
    hasCode: !!code, 
    appId, 
    hasAppSecret: !!appSecret, 
    redirectUri 
  });
  
  const tokenUrl = 'https://api.instagram.com/oauth/access_token';
  
  const formData = new FormData();
  formData.append('client_id', appId);
  formData.append('client_secret', appSecret);
  formData.append('grant_type', 'authorization_code');
  formData.append('redirect_uri', redirectUri);
  formData.append('code', code);

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Token exchange response:', {
      status: response.status,
      ok: response.ok,
      hasAccessToken: !!data.access_token,
      error: data.error,
      errorDescription: data.error_description
    });

    if (!response.ok) {
      console.error('Token exchange failed:', data);
      throw new Error(`Failed to exchange code for token: ${data.error_description || response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Error in token exchange:', error);
    throw error;
  }
};

export const getInstagramProfile = async (accessToken: string) => {
  console.log('Fetching Instagram profile with token:', !!accessToken);
  
  try {
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    );

    const data = await response.json();
    console.log('Instagram profile response:', {
      status: response.status,
      ok: response.ok,
      hasUsername: !!data.username,
      error: data.error
    });

    if (!response.ok) {
      console.error('Profile fetch failed:', data);
      throw new Error(`Failed to fetch Instagram profile: ${data.error?.message || response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    throw error;
  }
};