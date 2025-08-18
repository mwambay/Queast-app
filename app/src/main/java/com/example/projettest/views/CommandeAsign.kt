package com.example.projettest.views


import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import okhttp3.OkHttpClient

data class QrRequest(val qr_code: String)

data class ApiResponse(val message: String, val delivery_time: String?)




object Api {
    private val client = OkHttpClient.Builder().build()

    private val retrofit = Retrofit.Builder()
        .baseUrl("http://192.168.43.169:8001/api/")
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    val deliveryApi: DeliveryApi by lazy { retrofit.create(DeliveryApi::class.java) }
}
