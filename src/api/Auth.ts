import { post, apiFetch } from '../lib/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  user: {
    id: number
    role: 'client' | 'livreur' | 'admin'
  }
  session: {
    id: string
    expires: number
  }
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: 'client' | 'livreur' | 'admin'
  phone: string
}

/**
 * Connexion utilisateur
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await post<LoginResponse>('/auth/login', credentials)
    console.log('Connexion réussie:', response)
    return response
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    throw error
  }
}

/**
 * Inscription utilisateur
 */
export async function register(userData: RegisterRequest): Promise<any> {
  try {
    const response = await post('/auth/register', userData)
    console.log('Inscription réussie:', response)
    return response
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    throw error
  }
}

/**
 * Déconnexion utilisateur
 */
export async function logout(): Promise<void> {
  try {
    // Note: Le backend n'a pas d'endpoint logout, on peut juste nettoyer le localStorage
    localStorage.removeItem('queast_admin_token')
    localStorage.removeItem('queast_admin_user')
    
    // Optionnel: appeler le backend pour invalider la session
    // await post('/auth/logout')
    
    console.log('Déconnexion réussie')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    throw error
  }
}

/**
 * Vérifier si l'utilisateur est connecté
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('queast_admin_token')
  const user = localStorage.getItem('queast_admin_user')
  return !!(token && user)
}

/**
 * Récupérer l'utilisateur connecté
 */
export function getCurrentUser(): any | null {
  const userStr = localStorage.getItem('queast_admin_user')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch (error) {
      console.error('Erreur parsing user:', error)
      return null
    }
  }
  return null
}

/**
 * Sauvegarder les informations de session après connexion
 */
export function saveSession(loginResponse: LoginResponse, userDetails?: any): void {
  // Sauvegarder le token de session
  localStorage.setItem('queast_admin_token', `session_${loginResponse.session.id}`)
  
  // Sauvegarder les informations utilisateur
  const userData = {
    id: loginResponse.user.id,
    role: loginResponse.user.role,
    email: userDetails?.email || '',
    name: userDetails?.name || 'Utilisateur',
    session_expires: loginResponse.session.expires
  }
  
  localStorage.setItem('queast_admin_user', JSON.stringify(userData))
}

/**
 * Wrapper API avec gestion d'état
 */
export async function withAuthState<T>(
  apiCall: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await apiCall()
    return { data, error: null }
  } catch (error: any) {
    let errorMessage = 'Une erreur inconnue est survenue'
    
    if (error?.response?.status === 401) {
      errorMessage = 'Identifiants incorrects'
    } else if (error?.response?.status === 403) {
      errorMessage = 'Accès non autorisé'
    } else if (error?.response?.status === 500) {
      errorMessage = 'Erreur serveur'
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    return { data: null, error: errorMessage }
  }
}

// API wrapper pour faciliter l'utilisation
export const AuthAPI = {
  /**
   * Connexion avec gestion d'erreur
   */
  async login(credentials: LoginRequest) {
    return withAuthState(() => login(credentials))
  },

  /**
   * Inscription avec gestion d'erreur
   */
  async register(userData: RegisterRequest) {
    return withAuthState(() => register(userData))
  },

  /**
   * Déconnexion avec gestion d'erreur
   */
  async logout() {
    return withAuthState(() => logout())
  },

  /**
   * Vérifications d'état
   */
  isAuthenticated,
  getCurrentUser,
  saveSession
}