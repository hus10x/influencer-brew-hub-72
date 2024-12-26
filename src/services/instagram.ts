import { supabase } from "@/integrations/supabase/client";

export class InstagramService {
  private access_token: string;
  
  constructor(access_token: string) {
    this.access_token = access_token;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const baseUrl = 'https://graph.instagram.com/v21.0';
    
    // Build URL with access token as query parameter
    const url = new URL(`${baseUrl}${endpoint}`);
    if (!endpoint.includes('access_token')) {
      url.searchParams.append('access_token', this.access_token);
    }

    console.log('Making Instagram API request:', {
      url: url.toString(),
      hasToken: !!this.access_token,
      method: options.method || 'GET',
      headers: Object.keys(options.headers || {})
    });

    const response = await fetch(url.toString(), {
      ...options,
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Instagram API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        endpoint,
      });
      throw new Error(`Instagram API Error: ${errorText}`);
    }

    const data = await response.json();
    console.log('Instagram API response:', { endpoint, data });
    return data;
  }

  async getUserProfile() {
    return this.makeRequest('/me?fields=id,username');
  }

  async getMediaItems() {
    return this.makeRequest('/me/media');
  }
}