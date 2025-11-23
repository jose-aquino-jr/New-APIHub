import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos baseados no seu schema
export interface User {
  id: string
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface API {
  id: string
  name: string
  description: string
  base_url: string
  endpoint_path: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  authentication_type: string
  auth_details: any
  tags: string
  created_by: string
  created_at: string
  updated_at: string
  cors: boolean
  https: boolean
  parameters: string
  response_format: string
  usage_example: string
  pdf_url?: string
}

export interface UserFavorite {
  id: string
  user_id: string
  api_id: string
  created_at: string
  apis: API

}
