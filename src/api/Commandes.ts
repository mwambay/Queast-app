import { get, post, put } from '../lib/api';

// Types de base
export type CommandeStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'in_delivery'
  | 'delivered'
  | 'cancelled';

export interface Commande {
  id: number;
  user_id: number;
  restaurant_id: number;
  delivery_person_id?: number;
  status: CommandeStatus;
  total_price: number;
  delivery_address: string;
  qr_code?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  items?: CommandeItem[];
}

// Interface étendue pour les commandes avec détails (pour admin)
export interface CommandeDetailed extends Commande {
  client_name: string;
  client_email: string;
  client_phone: string;
  restaurant_name: string;
  restaurant_address: string;
  delivery_person_name?: string;
  delivery_person_phone?: string;
}

export interface CommandeItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  quantity: number;
  special_requests?: string;
  price: number;
  menu_item_name?: string;
  menu_item_description?: string;
  menu_item_category?: string;
}

export interface CreateCommandePayload {
  restaurant_id: number;
  items: { menu_item_id: number; quantity: number; special_requests?: string }[];
  delivery_address: string;
}

// Récupérer toutes les commandes (admin uniquement)
export async function getAllCommandes(): Promise<CommandeDetailed[]> {
  return get<CommandeDetailed[]>('/commandes');
}

// Récupérer les commandes du client connecté
export async function getCommandesClient(): Promise<Commande[]> {
  return get<Commande[]>('/commandes/client');
}

// Récupérer les commandes du livreur connecté
export async function getCommandesLivreur(): Promise<Commande[]> {
  return get<Commande[]>('/commandes/livreur');
}

// Récupérer l'historique des commandes du client
export async function getHistoriqueCommandes(): Promise<Commande[]> {
  return get<Commande[]>('/commandes/historique');
}

// Créer une nouvelle commande
export async function createCommande(payload: CreateCommandePayload): Promise<Commande> {
  return post<Commande>('/commandes', payload);
}

// Mettre à jour le statut d'une commande
export async function updateCommandeStatus(orderId: number, status: CommandeStatus, reason?: string): Promise<Commande> {
  return put<Commande>('/commandes/status', { order_id: orderId, status, reason });
}