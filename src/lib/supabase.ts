import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bxfkfcczldqtsddbwugw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZmtmY2N6bGRxdHNkZGJ3dWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1NTEzNjUsImV4cCI6MjA0NzEyNzM2NX0.HyJabl9tRwxByJynkuMHipPGJJp23XHoNzeTWY_xWKA';

export const supabase = createClient(supabaseUrl, supabaseKey);