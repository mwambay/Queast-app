import { get, post, put, apiFetch } from '../lib/api'

// Interface correspondant à la table restaurants de la DB
export interface Restaurant {
  id: number
  name: string
  image: string | null
  description: string | null
  location: string | null
  created_at: string
}

// Interface pour la création d'un restaurant (sans id et created_at)
export interface CreateRestaurantData {
  name: string
  image?: string
  description?: string
  location?: string
}

// Interface pour la mise à jour d'un restaurant
export interface UpdateRestaurantData {
  name?: string
  image?: string
  description?: string
  location?: string
}

/**
 * Récupère la liste de tous les restaurants
 * Endpoint: GET /restaurants
 */
export async function getAllRestaurants(): Promise<Restaurant[]> {
  try {
    return await get<Restaurant[]>('/restaurants')
  } catch (error) {
    console.error('Erreur lors de la récupération des restaurants:', error)
    throw new Error('Impossible de récupérer la liste des restaurants')
  }
}

/**
 * Récupère un restaurant par son ID
 * Endpoint: GET /restaurants/:id
 */
export async function getRestaurantById(id: number): Promise<Restaurant> {
  try {
    return await get<Restaurant>(`/restaurants/${id}`)
  } catch (error) {
    console.error(`Erreur lors de la récupération du restaurant ${id}:`, error)
    throw new Error(`Impossible de récupérer le restaurant avec l'ID ${id}`)
  }
}

/**
 * Crée un nouveau restaurant
 * Endpoint: POST /restaurants
 */
export async function createRestaurant(restaurantData: CreateRestaurantData): Promise<Restaurant> {
  try {
    return await post<Restaurant>('/restaurants', restaurantData)
  } catch (error) {
    console.error('Erreur lors de la création du restaurant:', error)
    throw new Error('Impossible de créer le restaurant')
  }
}

/**
 * Met à jour un restaurant existant
 * Endpoint: PUT /restaurants/:id
 */
export async function updateRestaurant(id: number, restaurantData: UpdateRestaurantData): Promise<Restaurant> {
  try {
    return await put<Restaurant>(`/restaurants/${id}`, restaurantData)
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du restaurant ${id}:`, error)
    throw new Error(`Impossible de mettre à jour le restaurant avec l'ID ${id}`)
  }
}

/**
 * Supprime un restaurant
 * Endpoint: DELETE /restaurants/:id
 */
export async function deleteRestaurant(id: number): Promise<void> {
  try {
    await apiFetch(`/restaurants/${id}`, {
      method: 'DELETE'
    })
  } catch (error) {
    console.error(`Erreur lors de la suppression du restaurant ${id}:`, error)
    throw new Error(`Impossible de supprimer le restaurant avec l'ID ${id}`)
  }
}

/**
 * Récupère les plats d'un restaurant
 * Endpoint: GET /restaurants/:id/plats
 */
export async function getRestaurantPlats(restaurantId: number): Promise<any[]> {
  try {
    return await get<any[]>(`/restaurants/${restaurantId}/plats`)
  } catch (error) {
    console.error(`Erreur lors de la récupération des plats du restaurant ${restaurantId}:`, error)
    throw new Error(`Impossible de récupérer les plats du restaurant avec l'ID ${restaurantId}`)
  }
}

/**
 * Hook personnalisé pour gérer les états de loading et d'erreur
 */
export interface RestaurantApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
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

// Exemples d'utilisation avec gestion d'erreur intégrée
export const RestaurantAPI = {
  /**
   * Récupère tous les restaurants avec gestion d'erreur
   */
  async getAll() {
    return withApiState(() => getAllRestaurants())
  },

  /**
   * Récupère un restaurant par ID avec gestion d'erreur
   */
  async getById(id: number) {
    return withApiState(() => getRestaurantById(id))
  },

  /**
   * Crée un restaurant avec gestion d'erreur
   */
  async create(data: CreateRestaurantData) {
    return withApiState(() => createRestaurant(data))
  },

  /**
   * Met à jour un restaurant avec gestion d'erreur
   */
  async update(id: number, data: UpdateRestaurantData) {
    return withApiState(() => updateRestaurant(id, data))
  },

  /**
   * Supprime un restaurant avec gestion d'erreur
   */
  async delete(id: number) {
    return withApiState(() => deleteRestaurant(id))
  },

  /**
   * Récupère les plats d'un restaurant avec gestion d'erreur
   */
  async getPlats(id: number) {
    return withApiState(() => getRestaurantPlats(id))
  }
}