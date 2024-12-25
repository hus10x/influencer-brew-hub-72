import { supabase } from "@/integrations/supabase/client";

export const checkInstagramConnection = async (email: string) => {
  try {
    console.log('Checking Instagram connection for email:', email);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('instagram_connected, instagram_handle, instagram_business_account')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Error checking Instagram connection:', error);
      throw error;
    }

    console.log('Instagram connection data:', data);
    return data;
  } catch (error) {
    console.error('Error in checkInstagramConnection:', error);
    throw error;
  }
};