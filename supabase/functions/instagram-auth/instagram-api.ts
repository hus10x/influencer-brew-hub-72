export interface FacebookTokenResponse {
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
): Promise<FacebookTokenResponse> {
  console.log('Exchanging code for Facebook access token...');
  
  const tokenUrl = 'https://graph.facebook.com/v19.0/oauth/access_token';
  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code: code,
  });

  try {
    const response = await fetch(`${tokenUrl}?${params}`);
    const data = await response.json();

    if (!response.ok) {
      console.error('Token exchange error:', data);
      throw new Error(`Token exchange failed: ${data.error?.message || 'Unknown error'}`);
    }

    console.log('Successfully exchanged code for token');
    return data;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

export async function getInstagramProfile(accessToken: string): Promise<InstagramProfile> {
  console.log('Fetching Instagram business accounts...');
  
  try {
    // First, get the user's pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
    );
    
    if (!pagesResponse.ok) {
      const error = await pagesResponse.json();
      console.error('Failed to fetch Facebook pages:', error);
      throw new Error(`Failed to fetch Facebook pages: ${error.error?.message || 'Unknown error'}`);
    }
    
    const pages = await pagesResponse.json();
    console.log('Found Facebook pages:', pages.data?.length || 0);
    
    if (!pages.data || pages.data.length === 0) {
      throw new Error('No Facebook pages found. Please create a Facebook page first.');
    }
    
    // Get the Instagram business account for the first page
    const pageId = pages.data[0].id;
    const pageAccessToken = pages.data[0].access_token;
    
    console.log('Fetching Instagram business account for page:', pageId);
    const instagramResponse = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
    );
    
    if (!instagramResponse.ok) {
      const error = await instagramResponse.json();
      console.error('Failed to fetch Instagram account:', error);
      throw new Error(`Failed to fetch Instagram account: ${error.error?.message || 'Unknown error'}`);
    }
    
    const instagramData = await instagramResponse.json();
    
    if (!instagramData.instagram_business_account) {
      console.error('No Instagram business account found');
      throw new Error('No Instagram business account connected to this Facebook page.');
    }
    
    // Get Instagram account details
    const igAccountId = instagramData.instagram_business_account.id;
    console.log('Fetching Instagram profile details for account:', igAccountId);
    
    const igResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}?fields=username,id&access_token=${pageAccessToken}`
    );
    
    if (!igResponse.ok) {
      const error = await igResponse.json();
      console.error('Failed to fetch Instagram profile:', error);
      throw new Error(`Failed to fetch Instagram profile: ${error.error?.message || 'Unknown error'}`);
    }
    
    const igProfile = await igResponse.json();
    console.log('Successfully fetched Instagram profile for:', igProfile.username);
    
    return {
      id: igProfile.id,
      username: igProfile.username,
      account_type: 'BUSINESS'
    };
  } catch (error) {
    console.error('Error in getInstagramProfile:', error);
    throw error;
  }
}