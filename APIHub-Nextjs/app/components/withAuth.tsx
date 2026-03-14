// app/components/withAuth.tsx
'use client'

import { useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { useRouter } from 'next/navigation'

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options = { redirectTo: '/login' }
) {
  return function WithAuthComponent(props: P) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        const redirectUrl = `${options.redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`
        router.push(redirectUrl)
      }
    }, [user, loading, router])

    if (loading) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      )
    }

    if (!user) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}