import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rrbuizpvstdjwafnxhtl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyYnVpenB2c3RkandhZm54aHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNDc1MTUsImV4cCI6MjA3NzgyMzUxNX0.fqWDwJUv3D0jZ21wEyMCtg0h94kxnaRQtzUPWpqEf0Y'
export const supabase = createClient(supabaseUrl, supabaseKey)