// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/',
  '/apis',
  '/login',
  '/cadastro',
  '/recuperar-senha',
  '/documentacao-oficial-apihub.pdf',
]

// Rotas que requerem autenticação
const protectedRoutes = [
  '/academy',
  '/perfil',
  '/dashboard',
  '/favoritos',
]

// Rotas de API que requerem autenticação
const protectedApiRoutes = [
  '/api/user',
  '/api/favorites',
  '/api/progress',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verificar se é uma rota de API
  const isApiRoute = pathname.startsWith('/api/')
  const isProtectedApi = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Se for rota pública, permitir acesso
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Se não for rota protegida (e não for pública), permitir
  if (!isProtectedRoute && !isProtectedApi) {
    return NextResponse.next()
  }
  
  // Para rotas protegidas, verificar token
  const token = request.cookies.get('authToken')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    // Se for API route, retornar 401
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      )
    }
    
    // Para páginas, redirecionar para login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Opcional: Validar token com backend
  try {
    const response = await fetch('https://apihub-br.duckdns.org/auth/session', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Importante: não usar cache para validação de token
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Token inválido')
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error('Sessão inválida')
    }
    
    // Adicionar informações do usuário aos headers para uso nas páginas
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', data.data?.user?.id || '')
    requestHeaders.set('x-user-email', data.data?.user?.email || '')
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    // Token inválido ou expirado
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, message: 'Sessão expirada' },
        { status: 401 }
      )
    }
    
    // Limpar cookie inválido
    const response = NextResponse.redirect(
      new URL(`/login?redirect=${pathname}&error=session_expired`, request.url)
    )
    response.cookies.delete('authToken')
    
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}