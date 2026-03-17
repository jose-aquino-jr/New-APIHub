// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = [
  '/',
  '/apis',
  '/login',
  '/cadastro',
  '/recuperar-senha',
  '/documentacao-oficial-apihub.pdf',
]

const protectedRoutes = [
  '/academy',
  '/perfil',
  '/dashboard',
  '/favoritos',
]

const protectedApiRoutes = [
  '/api/user',
  '/api/favorites',
  '/api/progress',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ─── BYPASS DE DESENVOLVIMENTO ────────────────────────────────────────────
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }
  // ──────────────────────────────────────────────────────────────────────────

  const isApiRoute = pathname.startsWith('/api/')
  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Rota pública — deixa passar sempre
  if (isPublicRoute) return NextResponse.next()

  // Nem pública nem protegida — deixa passar
  if (!isProtectedRoute && !isProtectedApi) return NextResponse.next()

  // Apenas verifica se o cookie existe — a validação real do token
  // acontece no AuthProvider e nas chamadas de API individuais.
  // Validar aqui com o backend causava problemas de timing: o middleware
  // rodava antes do AuthProvider criar o cookie, gerando redirect falso.
  const token = request.cookies.get('authToken')?.value

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      )
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Token existe no cookie — deixa passar
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}