// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ahtozhqhjdkivyaqskko.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodG96aHFoamRraXZ5YXFza2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4MjA0NTQsImV4cCI6MjA1MDM5NjQ1NH0.oNtOmzCeZQCI8em-qWU9rOppAXCXqoUjscFpi_c_WtI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);