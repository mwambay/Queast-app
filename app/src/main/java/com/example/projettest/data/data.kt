package com.example.projettest.data

import com.example.projettest.views.ApiResponse
import com.example.projettest.views.QrRequest
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Query

interface DeliveryApi2 {
    @POST("livraison/valider")
    suspend fun validateDelivery(
        @Query("id") orderId: Int,
        @Body request: QrRequest
    ): ApiResponse
}