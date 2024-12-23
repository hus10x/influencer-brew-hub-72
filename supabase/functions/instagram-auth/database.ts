import { createClient } from '@supabase/supabase-js';

export async function updateUserInstagramProfile(
  supabaseUrl: string,
  serviceRoleKey: string,
  profile: {
    username: string;
    isBusinessAccount: boolean;
    accessToken: string;
  }
) {
  console.log('Updating user Instagram profile in database...');
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  const { error } = await supabase
    .from('profiles')
    .update({
      instagram_handle: profile.username,
      instagram_connected: true,
      instagram_business_account: profile.isBusinessAccount,
      instagram_access_token: profile.accessToken,
      updated_at: new Date().toISOString(),
    })
    .eq('instagram_handle', profile.username);

  if (error) {
    console.error('Database update error:', error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}