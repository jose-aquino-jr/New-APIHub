import { NextResponse } from 'next/server'

export async function GET() {
  const debugInfo = {
    // Verifica se as variáveis existem
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT FOUND',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'EXISTS' : 'NOT FOUND',
    
    // Verifica o ambiente
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    
    // Verifica se a URL é válida
    isUrlValid: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
      process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://') : false,
    
    // Timestamp para verificar se é novo
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(debugInfo)
}