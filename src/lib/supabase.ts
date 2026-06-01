import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdjapmyuvkqqqoyankxe.supabase.co';
const supabaseKey = 'sb_publishable_6O7EcW50vE9NBN4e-Br8fA_FrFxpr29';

export const supabase = createClient(supabaseUrl, supabaseKey);
