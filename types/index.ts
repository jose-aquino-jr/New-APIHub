// types/index.ts
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
  auth_details?: any  
  tags: string
  created_by?: string  
  created_at: string
  updated_at: string
  cors: boolean
  https: boolean
  parameters?: string
  response_format?: string 
  usage_example?: string  
  pdf_url?: string  
  language_api?: string 
  status?: string  
}

export interface UserFavorite {
  id: string
  user_id: string
  api_id: string
  created_at: string
}

export interface PasswordReset {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}
