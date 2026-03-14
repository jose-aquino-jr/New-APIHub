// types/index.ts (seus tipos existentes + adições)
export interface User {
  id: string
  name: string
  email: string
  created_at: string
  updated_at: string
  // Campos opcionais que podem vir do OAuth
  avatar_url?: string
  provider?: string
  bio?: string
  preferredLanguages?: string[]
  accept_terms?: boolean
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
  created_by_id?: string  
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
  ranking_position?: number
  total_ranked?: number
  rating?: number
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

// Novos tipos para autenticação
export interface AuthSession {
  access_token: string
  refresh_token?: string
  expires_at?: string
  user: User
}

export interface AuthResponse {
  success: boolean
  data?: {
    user: User
    session: AuthSession
  }
  message?: string
}

export interface Course {
  id: string
  title: string
  description: string
  slug: string
  thumbnail_url?: string
  created_at: string
  updated_at: string
}

export interface Module {
  id: string
  course_id: string
  title: string
  description?: string
  order: number
  created_at: string
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  content?: string
  video_url?: string
  duration?: number
  order: number
  created_at: string
}

export interface CourseProgress {
  id: string
  user_id: string
  course_id: string
  lesson_id: string
  progress_percentual: number
  completed: boolean
  created_at: string
  updated_at: string
}