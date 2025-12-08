// lib/api.ts
const BACKEND_URL = 'https://apihub-br.duckdns.org'

export async function fetchAPIs(): Promise<any[]> {
  console.log('🔍 [API] Buscando APIs do backend...')
  
  try {
    // Primeiro testar o health check
    const healthResponse = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!healthResponse.ok) {
      console.error('❌ Health check falhou:', healthResponse.status)
      throw new Error(`Servidor indisponível: ${healthResponse.status}`)
    }
    
    const healthData = await healthResponse.json()
    console.log('✅ Health check ok:', healthData.status)
    
    // Agora buscar as APIs
    const response = await fetch(`${BACKEND_URL}/apis`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📡 Status da resposta /apis:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      
      if (response.status === 404) {
        console.log('⚠️ Endpoint /apis não encontrado no backend')
      }
      
      throw new Error(`Falha ao buscar APIs: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Verificar se é um array
    if (!Array.isArray(data)) {
      console.warn('⚠️ Resposta não é um array:', typeof data)
      
      // Tentar extrair array de diferentes formatos
      if (data && Array.isArray(data.data)) {
        console.log('✅ Encontrado array em data.data')
        return data.data
      }
      
      if (data && Array.isArray(data.apis)) {
        console.log('✅ Encontrado array em data.apis')
        return data.apis
      }
      
      console.log('❌ Não foi possível extrair array de dados')
      return []
    }
    
    console.log(`✅ ${data.length} APIs carregadas com sucesso`)
    return data
    
  } catch (error) {
    console.error('❌ Erro ao buscar APIs:', error)
    
    // Log detalhado para depuração
    if (error instanceof TypeError) {
      console.error('🔧 Detalhes do erro:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      // Testar conectividade básica
      console.log('🔧 Testando conectividade com o backend...')
      try {
        const testPing = await fetch(`${BACKEND_URL}`, { mode: 'no-cors' })
        console.log('🔧 Teste de conectividade:', testPing.type)
      } catch (testError) {
        console.error('🔧 Conectividade falhou:', testError)
      }
    }
    
    // Fallback para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Usando dados mock para desenvolvimento')
      return getMockAPIs()
    }
    
    return []
  }
}

// Função de fallback com dados mock
function getMockAPIs() {
  console.log('🎭 Carregando dados mock...')
  
  return [
    {
      id: '1',
      name: 'ViaCEP',
      description: 'API gratuita para consulta de CEP brasileiros. Retorna endereço completo a partir do CEP.',
      base_url: 'https://viacep.com.br/ws',
      endpoint_path: '/{cep}/json/',
      method: 'GET',
      authentication_type: 'Nenhuma',
      auth_details: null,
      tags: 'cep,localização,brasil,endereço',
      cors: true,
      https: true,
      parameters: '{"cep": "string - CEP no formato 00000000"}',
      response_format: 'json',
      usage_example: 'https://viacep.com.br/ws/01001000/json/',
      pdf_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'OpenWeatherMap',
      description: 'API de previsão do tempo em tempo real para qualquer cidade do mundo.',
      base_url: 'https://api.openweathermap.org/data/2.5',
      endpoint_path: '/weather',
      method: 'GET',
      authentication_type: 'API Key',
      auth_details: '{"api_key": "sua-chave-aqui"}',
      tags: 'clima,tempo,previsão,meteorologia',
      cors: true,
      https: true,
      parameters: '{"q": "string - nome da cidade", "appid": "string - sua API key"}',
      response_format: 'json',
      usage_example: 'https://api.openweathermap.org/data/2.5/weather?q=São Paulo&appid=SUA_CHAVE&lang=pt&units=metric',
      pdf_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Dog CEO',
      description: 'API de imagens aleatórias de cachorros. Perfeito para projetos divertidos.',
      base_url: 'https://dog.ceo/api',
      endpoint_path: '/breeds/image/random',
      method: 'GET',
      authentication_type: 'Nenhuma',
      auth_details: null,
      tags: 'animais,cachorros,imagens,divertido,pet',
      cors: true,
      https: true,
      parameters: '{}',
      response_format: 'json',
      usage_example: 'https://dog.ceo/api/breeds/image/random',
      pdf_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Bored API',
      description: 'Sugere atividades aleatórias para quando você está entediado.',
      base_url: 'https://www.boredapi.com/api',
      endpoint_path: '/activity',
      method: 'GET',
      authentication_type: 'Nenhuma',
      auth_details: null,
      tags: 'diversão,atividades,lazer,entretenimento',
      cors: true,
      https: true,
      parameters: '{}',
      response_format: 'json',
      usage_example: 'https://www.boredapi.com/api/activity',
      pdf_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '5',
      name: 'JSONPlaceholder',
      description: 'API fake para testes e prototipação. Simula uma API REST completa.',
      base_url: 'https://jsonplaceholder.typicode.com',
      endpoint_path: '/posts',
      method: 'GET',
      authentication_type: 'Nenhuma',
      auth_details: null,
      tags: 'dados,teste,protótipo,desenvolvimento',
      cors: true,
      https: true,
      parameters: '{}',
      response_format: 'json',
      usage_example: 'https://jsonplaceholder.typicode.com/posts/1',
      pdf_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '6',
      name: 'CoinGecko',
      description: 'API de criptomoedas com preços, volumes e informações do mercado.',
      base_url: 'https://api.coingecko.com/api/v3',
      endpoint_path: '/simple/price',
      method: 'GET',
      authentication_type: 'Nenhuma',
      auth_details: null,
      tags: 'criptomoedas,financeiro,bitcoin,investimento',
      cors: true,
      https: true,
      parameters: '{"ids": "bitcoin", "vs_currencies": "usd"}',
      response_format: 'json',
      usage_example: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      pdf_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '7',
      name: 'TheCatAPI',
      description: 'API de imagens aleatórias de gatos com várias raças e categorias.',
      base_url: 'https://api.thecatapi.com/v1',
      endpoint_path: '/images/search',
      method: 'GET',
      authentication_type: 'Nenhuma',
      auth_details: null,
      tags: 'animais,gatos,imagens,pet,divertido',
      cors: true,
      https: true,
      parameters: '{}',
      response_format: 'json',
      usage_example: 'https://api.thecatapi.com/v1/images/search',
      pdf_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '8',
      name: 'NewsAPI',
      description: 'API de notícias de várias fontes e países em tempo real.',
      base_url: 'https://newsapi.org/v2',
      endpoint_path: '/everything',
      method: 'GET',
      authentication_type: 'API Key',
      auth_details: '{"api_key": "sua-chave-aqui"}',
      tags: 'notícias,jornalismo,informação,atualidades',
      cors: true,
      https: true,
      parameters: '{"q": "string - termo de busca", "apiKey": "string - sua chave"}',
      response_format: 'json',
      usage_example: 'https://newsapi.org/v2/everything?q=tecnologia&apiKey=SUA_CHAVE',
      pdf_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

export async function fetchAPIBySlug(slug: string): Promise<any | null> {
  try {
    console.log('🔍 [API] Buscando por slug:', slug)
    
    const response = await fetch(`${BACKEND_URL}/api-by-slug/${slug}`)
    
    if (!response.ok) {
      console.log('❌ API não encontrada por slug, tentando por nome...')
      
      // Fallback: buscar todas e filtrar
      const allApis = await fetchAPIs()
      const normalizedSlug = slug.toLowerCase().replace(/-/g, ' ')
      
      const api = allApis.find(a => 
        a.name.toLowerCase().includes(normalizedSlug) ||
        a.name.toLowerCase().replace(/[^a-z0-9]/g, ' ') === normalizedSlug
      )
      
      return api || null
    }
    
    const data = await response.json()
    return data
    
  } catch (error) {
    console.error('❌ Erro ao buscar API por slug:', error)
    return null
  }
}

export async function fetchAPIById(id: string): Promise<any | null> {
  try {
    console.log('🔍 [API] Buscando por ID:', id)
    
    const response = await fetch(`${BACKEND_URL}/api/${id}`)
    
    if (!response.ok) {
      console.error('❌ Erro ao buscar API por ID:', response.status)
      return null
    }
    
    const data = await response.json()
    return data
    
  } catch (error) {
    console.error('❌ Erro ao buscar API por ID:', error)
    return null
  }
}

export async function fetchUserFavorites(userId: string): Promise<any[]> {
  try {
    console.log('⭐ [API] Buscando favoritos para usuário:', userId)
    
    const response = await fetch(`${BACKEND_URL}/favoritos/${userId}`)
    
    if (!response.ok) {
      console.error('❌ Erro ao buscar favoritos:', response.status)
      return []
    }
    
    const data = await response.json()
    return Array.isArray(data) ? data : []
    
  } catch (error) {
    console.error('❌ Erro ao buscar favoritos:', error)
    return []
  }
}

export async function fetchCompleteFavorites(userId: string): Promise<any[]> {
  try {
    console.log('⭐ [API] Buscando favoritos completos para usuário:', userId)
    
    const response = await fetch(`${BACKEND_URL}/favoritos/${userId}`)
    
    if (!response.ok) {
      console.error('❌ Erro ao buscar favoritos completos:', response.status)
      return []
    }
    
    const data = await response.json()
    return Array.isArray(data) ? data : []
    
  } catch (error) {
    console.error('❌ Erro ao buscar favoritos completos:', error)
    return []
  }
}

export async function toggleFavorite(userId: string, apiId: string, isFavorite: boolean): Promise<boolean> {
  try {
    console.log('⭐ [API] Alternando favorito:', { userId, apiId, isFavorite })
    
    const endpoint = `${BACKEND_URL}/favoritos`
    const method = isFavorite ? 'DELETE' : 'POST'
    
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId, api_id: apiId })
    })
    
    if (!response.ok) {
      console.error('❌ Erro ao alternar favorito:', response.status)
      return false
    }
    
    const data = await response.json()
    console.log('✅ Operação de favorito realizada:', data.success)
    
    return data.success === true
    
  } catch (error) {
    console.error('❌ Erro ao alternar favorito:', error)
    return false
  }
}