import { supabase } from "@/integrations/supabase/client";

export class InstagramService {
  private access_token: string;
  
  constructor(access_token: string) {
    this.access_token = access_token;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const baseUrl = 'https://graph.instagram.com/v21.0';
    const headers = {
      'Authorization': `Bearer ${this.access_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Instagram API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Instagram API Error: ${errorText}`);
    }

    return response.json();
  }

  async getUserProfile() {
    return this.makeRequest('/me?fields=id,username');
  }

  async getMediaItems() {
    return this.makeRequest('/me/media');
  }
}