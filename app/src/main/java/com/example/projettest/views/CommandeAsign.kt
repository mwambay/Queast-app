package com.example.projettest.views

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import okhttp3.OkHttpClient

// -------------------------
// DATA CLASSES
// -------------------------

data class QrRequest(val qr_code: String)

data class ApiResponse(val message: String, val delivery_time: String?)



// -------------------------
// API CLIENT
// -------------------------
object Api {
    private val client = OkHttpClient.Builder().build()

    private val retrofit = Retrofit.Builder()
        .baseUrl("http://192.168.43.169:8001/api/")
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    val deliveryApi: DeliveryApi by lazy { retrofit.create(DeliveryApi::class.java) }
}
