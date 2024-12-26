export const exchangeCodeForToken = async (
  code: string,
  appId: string,
  appSecret: string,
  redirectUri: string
) => {
  console.log('Starting token exchange process...', { 
    hasCode: !!code,
    hasAppId: !!appId,
    hasSecret: !!appSecret,
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
    console.log('Making token exchange request to:', tokenUrl);
    const response = await fetch(tokenUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
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
      responseData: data 
    });
    return data;
  } catch (error) {
    console.error('Error in token exchange:', error);
    throw error;
  }
};

export const getInstagramProfile = async (accessToken: string) => {
  console.log('Starting Instagram profile fetch...');
  
  try {
    const url = `https://graph.instagram.com/v21.0/me?fields=id,username&access_token=${encodeURIComponent(accessToken)}`;
    console.log('Making profile request to Instagram API');
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };

    console.log('Request headers:', {
      hasAuthHeader: !!headers.Authorization,
      headers: Object.keys(headers)
    });
    
    const response = await fetch(url, { headers });

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
      hasUsername: !!data.username,
      hasId: !!data.id,
      responseData: data
    });
    return data;
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    throw error;
  }
};