import { supabase } from "@/integrations/supabase/client";

export class InstagramService {
  private access_token: string;
  
  constructor(access_token: string) {
    this.access_token = access_token;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const baseUrl = 'https://graph.instagram.com/v21.0';
    const url = new URL(`${baseUrl}${endpoint}`);
    url.searchParams.append('access_token', this.access_token);

    console.log('Making Instagram API request:', {
      url: url.toString(),
      method: options.method || 'GET',
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
      });
      throw new Error(`Instagram API Error: ${errorText}`);
    }

    const data = await response.json();
    return data;
  }

  async getUserProfile() {
    return this.makeRequest('/me?fields=id,username,account_type');
  }

  async getMediaItems() {
    return this.makeRequest('/me/media');
  }
}