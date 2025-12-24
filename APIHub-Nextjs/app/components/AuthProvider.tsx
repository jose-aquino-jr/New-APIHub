// components/AuthProvider.tsx - Atualize a função handleLogin:

const handleLogin = async (email: string, password: string) => {
  setIsLoading(true)
  try {
    const response = await fetch('https://apihub-br.duckdns.org/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: email.trim().toLowerCase(), 
        senha: password 
      })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      const userData = data.user
      // SALVAR O TOKEN REAL
      if (data.session?.access_token) {
        localStorage.setItem('authToken', data.session.access_token)
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Carregar favoritos após login
      await loadFavorites()
      return { error: null }
    }
    return { error: new Error(data.message || 'Erro no login') }
  } catch (error) {
    return { error: new Error('Erro de conexão') }
  } finally {
    setIsLoading(false)
  }
}

// Atualize a função loadFavorites:
const loadFavorites = async () => {
  if (!user) return

  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.log('❌ Token não encontrado para carregar favoritos')
      return
    }

    const response = await fetch(`https://apihub-br.duckdns.org/favoritos/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.status === 401) {
      console.error('Token expirado ou inválido')
      handleLogout()
      return
    }
    
    if (!response.ok) return
      
    const data = await response.json()
    const favoriteIds = data?.map((fav: any) => fav.api_id) || []
    setFavorites(favoriteIds)
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favoriteIds))
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error)
  }
}

// Atualize a função toggleFavorite:
const toggleFavorite = async (apiId: string) => {
  if (!user) {
    alert('Você precisa estar logado para favoritar APIs')
    return
  }

  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      alert('Sessão expirada. Por favor, faça login novamente.')
      handleLogout()
      return
    }

    const isCurrentlyFavorite = favorites.includes(apiId)

    const response = await fetch('https://apihub-br.duckdns.org/favoritos', {
      method: isCurrentlyFavorite ? 'DELETE' : 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: user.id,
        api_id: apiId
      })
    })

    if (response.status === 401) {
      alert('Sessão expirada. Por favor, faça login novamente.')
      handleLogout()
      return
    }

    if (response.ok) {
      const newFavorites = isCurrentlyFavorite
        ? favorites.filter(id => id !== apiId)
        : [...favorites, apiId]
      
      setFavorites(newFavorites)
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites))
    } else {
      alert('Erro ao favoritar/desfavoritar API')
    }
  } catch (error: any) {
    console.error('Erro ao alternar favorito:', error)
    alert('Erro ao favoritar/desfavoritar API')
  }
}
