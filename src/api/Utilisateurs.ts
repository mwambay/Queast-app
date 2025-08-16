import { get, post, put, apiFetch } from '../lib/api'

// Interface correspondant à la réponse de votre API
export interface User {
  id: number
  name: string
  email: string
  role: 'client' | 'livreur' | 'admin'
  phone: string
  created_at: string
  // Le password_hash n'est pas retourné par l'API pour des raisons de sécurité
}

// Interface pour la création d'un utilisateur
export interface CreateUserData {
  name: string
  email: string
  password: string
  role: 'client' | 'livreur' | 'admin'
  phone: string
}

// Interface pour la mise à jour d'un utilisateur
export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
  role?: 'client' | 'livreur' | 'admin'
  phone?: string
}

/**
 * Récupère la liste de tous les utilisateurs
 * Endpoint: GET /users
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const data = await get<User[]>('/users')
    console.log('Utilisateurs récupérés avec succès:', data)
    return data
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    throw new Error('Impossible de récupérer la liste des utilisateurs')
  }
}

/**
 * Récupère un utilisateur par son ID
 * Endpoint: GET /users/:id
 */
export async function getUserById(id: number): Promise<User> {
  try {
    return await get<User>(`/users/${id}`)
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error)
    throw new Error(`Impossible de récupérer l'utilisateur avec l'ID ${id}`)
  }
}

/**
 * Crée un nouveau utilisateur
 * Endpoint: POST /users
 */
export async function createUser(userData: CreateUserData): Promise<User> {
  try {
    return await post<User>('/users', userData)
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    throw new Error('Impossible de créer l\'utilisateur')
  }
}

/**
 * Met à jour un utilisateur existant
 * Endpoint: PUT /users/:id
 */
export async function updateUser(id: number, userData: UpdateUserData): Promise<User> {
  try {
    return await put<User>(`/users?id=${id}`, userData)
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error)
    throw new Error(`Impossible de mettre à jour l'utilisateur avec l'ID ${id}`)
  }
}

/**
 * Supprime un utilisateur
 * Endpoint: DELETE /users/:id
 */
export async function deleteUser(id: number): Promise<void> {
  try {
    await apiFetch(`/users?id=${id}`, {
      method: 'DELETE'
    })
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error)
    throw new Error(`Impossible de supprimer l'utilisateur avec l'ID ${id}`)
  }
}

/**
 * Récupère les utilisateurs filtrés par rôle
 * Endpoint: GET /users?role=:role
 */
export async function getUsersByRole(role: 'client' | 'livreur' | 'admin'): Promise<User[]> {
  try {
    return await get<User[]>(`/users?role=${role}`)
  } catch (error) {
    console.error(`Erreur lors de la récupération des utilisateurs ${role}:`, error)
    throw new Error(`Impossible de récupérer les utilisateurs avec le rôle ${role}`)
  }
}

/**
 * Fonction utilitaire pour wrapper les appels API avec gestion d'état
 */
export async function withApiState<T>(
  apiCall: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await apiCall()
    return { data, error: null }
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
    }
  }
}

// API wrapper conviviale
export const UserAPI = {
  /**
   * Récupère tous les utilisateurs avec gestion d'erreur
   */
  async getAll() {
    return withApiState(() => getAllUsers())
  },

  /**
   * Récupère un utilisateur par ID avec gestion d'erreur
   */
  async getById(id: number) {
    return withApiState(() => getUserById(id))
  },

  /**
   * Crée un utilisateur avec gestion d'erreur
   */
  async create(data: CreateUserData) {
    return withApiState(() => createUser(data))
  },

  /**
   * Met à jour un utilisateur avec gestion d'erreur
   */
  async update(id: number, data: UpdateUserData) {
    return withApiState(() => updateUser(id, data))
  },

  /**
   * Supprime un utilisateur avec gestion d'erreur
   */
  async delete(id: number) {
    return withApiState(() => deleteUser(id))
  },

  /**
   * Récupère les utilisateurs par rôle avec gestion d'erreur
   */
  async getByRole(role: 'client' | 'livreur' | 'admin') {
    return withApiState(() => getUsersByRole(role))
  }
}