package com.example.projettest.models

data class CommandeResponse(
    val success: Boolean,
    val data: List<Commande>,
    val total: Int,
    val message: String? = null
)

data class Commande(
    val id: Int,
    val user_id: Int?,
    val restaurant_id: Int?,
    val delivery_person_id: Int?,
    val status: String,
    val total_price: Double,
    val delivery_address: String?,
    val qr_code: String?,
    val cancellation_reason: String?,
    val created_at: String,
    val updated_at: String,
    val client_name: String?,
    val client_email: String?,
    val client_phone: String?,
    val restaurant_name: String?,
    val restaurant_address: String?,
    val delivery_person_name: String?,
    val delivery_person_phone: String?,
    val items: List<OrderItem>
)

data class OrderItem(
    val id: Int,
    val order_id: Int,
    val menu_item_id: Int,
    val quantity: Int,
    val price: Double,
    val menu_item_name: String,
    val menu_item_description: String?,
    val menu_item_category: String?
)
