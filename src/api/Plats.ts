import { get, post, put, apiFetch } from '../lib/api'

// Interface correspondant à la table menu_items de la DB
export interface MenuItem {
  id: number
  restaurant_id: number
  name: string
  description?: string
  price: number
  category?: string
  image_url: string
  is_available: boolean
}

// Interface pour la création d'un plat
export interface CreateMenuItemData {
  restaurant_id: number
  name: string
  description?: string
  price: number
  category?: string
  image_url?: string
  is_available?: boolean
}

// Interface pour la mise à jour d'un plat
export interface UpdateMenuItemData {
  name?: string
  description?: string
  price?: number
  category?: string
  image_url?: string
  is_available?: boolean
  restaurant_id?: number
}

// Interface pour les restaurants (simplifié)
export interface Restaurant {
  id: number
  name: string
  address?: string
  phone?: string
}

/**
 * Récupère tous les plats d'un restaurant
 * Endpoint: GET /restaurants/plats?id=X
 */
export async function getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]> {
  try {
    const response = await get<{menu_items: MenuItem[]}>(`/restaurants/plats?id=${restaurantId}`)
    return response.menu_items || []
  } catch (error) {
    console.error(`Erreur lors de la récupération des plats du restaurant ${restaurantId}:`, error)
    throw new Error(`Impossible de récupérer les plats du restaurant avec l'ID ${restaurantId}`)
  }
}

/**
 * Récupère tous les plats de tous les restaurants
 * Endpoint: GET /menu-items (à créer)
 */
export async function getAllMenuItems(): Promise<MenuItem[]> {
  try {
    const response = await get<{menu_items: MenuItem[]}>('/menu-items')
    return response.menu_items || []
  } catch (error) {
    console.error('Erreur lors de la récupération des plats:', error)
    throw new Error('Impossible de récupérer la liste des plats')
  }
}

/**
 * Récupère un plat par son ID
 * Endpoint: GET /menu-item?id=X (à créer)
 */
export async function getMenuItemById(id: number): Promise<MenuItem> {
  try {
    return await get<MenuItem>(`/menu-item?id=${id}`)
  } catch (error) {
    console.error(`Erreur lors de la récupération du plat ${id}:`, error)
    throw new Error(`Impossible de récupérer le plat avec l'ID ${id}`)
  }
}

/**
 * Crée un nouveau plat
 * Endpoint: POST /menu-items (à créer)
 */
export async function createMenuItem(menuItemData: CreateMenuItemData): Promise<MenuItem> {
  try {
    return await post<MenuItem>('/menu-items', menuItemData)
  } catch (error) {
    console.error('Erreur lors de la création du plat:', error)
    throw new Error('Impossible de créer le plat')
  }
}

/**
 * Met à jour un plat existant
 * Endpoint: PUT /menu-item?id=X (à créer)
 */
export async function updateMenuItem(id: number, menuItemData: UpdateMenuItemData): Promise<MenuItem> {
  try {
    return await put<MenuItem>(`/menu-item?id=${id}`, menuItemData)
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du plat ${id}:`, error)
    throw new Error(`Impossible de mettre à jour le plat avec l'ID ${id}`)
  }
}

/**
 * Supprime un plat
 * Endpoint: DELETE /menu-item?id=X (à créer)
 */
export async function deleteMenuItem(id: number): Promise<void> {
  try {
    await apiFetch(`/menu-item?id=${id}`, {
      method: 'DELETE'
    })
  } catch (error) {
    console.error(`Erreur lors de la suppression du plat ${id}:`, error)
    throw new Error(`Impossible de supprimer le plat avec l'ID ${id}`)
  }
}

/**
 * Récupère la liste des restaurants (depuis l'API restaurants)
 */
export async function getRestaurants(): Promise<Restaurant[]> {
  try {
    const response = await get<{restaurants: Restaurant[]}>('/restaurants')
    return response.restaurants || []
  } catch (error) {
    console.error('Erreur lors de la récupération des restaurants:', error)
    throw new Error('Impossible de récupérer la liste des restaurants')
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

// API wrapper avec gestion d'erreur intégrée
export const MenuAPI = {
  /**
   * Récupère tous les plats avec gestion d'erreur
   */
  async getAll() {
    return withApiState(() => getAllMenuItems())
  },

  /**
   * Récupère les plats d'un restaurant avec gestion d'erreur
   */
  async getByRestaurant(restaurantId: number) {
    return withApiState(() => getMenuItemsByRestaurant(restaurantId))
  },

  /**
   * Récupère un plat par ID avec gestion d'erreur
   */
  async getById(id: number) {
    return withApiState(() => getMenuItemById(id))
  },

  /**
   * Crée un plat avec gestion d'erreur
   */
  async create(data: CreateMenuItemData) {
    return withApiState(() => createMenuItem(data))
  },

  /**
   * Met à jour un plat avec gestion d'erreur
   */
  async update(id: number, data: UpdateMenuItemData) {
    return withApiState(() => updateMenuItem(id, data))
  },

  /**
   * Supprime un plat avec gestion d'erreur
   */
  async delete(id: number) {
    return withApiState(() => deleteMenuItem(id))
  },

  /**
   * Récupère la liste des restaurants avec gestion d'erreur
   */
  async getRestaurants() {
    return withApiState(() => getRestaurants())
  }
}
