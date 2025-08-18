package com.example.projettest.views

import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Query

class SessionCookieJar : CookieJar {
    private val cookieStore = mutableListOf<Cookie>()

    override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
        cookieStore.clear()
        cookieStore.addAll(cookies)
    }

    override fun loadForRequest(url: HttpUrl): List<Cookie> {
        return cookieStore
    }
}


data class OrderHistoryResponse(
    val success: Boolean,
    val data: List<Order>
)



data class Order(
    val id: Int,
    val user_id: Int,
    val restaurant_id: Int,
    val delivery_person_id: Int,
    val status: String,
    val total_price: String,
    val delivery_address: String,
    val qr_code: String,
    val cancellation_reason: String?,
    val created_at: String,
    val updated_at: String
)

interface DeliveryApi {
    @GET("commandes/livreur")
    suspend fun getMyOrders(): List<Order>

    @POST("livraisons/valider")
    suspend fun validateDelivery(
        @Query("id") orderId: Int,
        @Body request: QrRequest
    ): ApiResponse
}
// ------------------- Retrofit -------------------



interface ApiService {
    @GET("commandes/historique")
    suspend fun getOrderHistory(@Query("id") userId: Int): List<Order>
}









fun createApiService(): ApiService {
    val client = OkHttpClient.Builder()
        .cookieJar(SessionCookieJar())
        .addInterceptor { chain ->
            val request = chain.request()
            val response = chain.proceed(request)
            val body = response.body?.string()
            android.util.Log.d("API_RESPONSE", "Raw JSON: $body")
            // Important : recréer le body car .string() le consomme
            response.newBuilder()
                .body(okhttp3.ResponseBody.create(response.body?.contentType(), body ?: ""))
                .build()
        }
        .build()


    return Retrofit.Builder()
        .baseUrl("http://10.213.169.194:8001/")
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ApiService::class.java)
}


// ------------------- Composable -------------------
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderHistoryScreen(userId: Int, navController : NavController) {
    val scope = rememberCoroutineScope()
    var orders by remember { mutableStateOf<List<Order>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        scope.launch {
            try {
                val api = createApiService()
                val response = api.getOrderHistory(userId)
                println("Response: $response")  // Pour déboguer la réponse
                orders = response  // ✅ on récupère la liste dans "data"
                isLoading = false
            } catch (e: Exception) {
                Log.e("OrderHistoryScreen", "Erreur API", e)
                errorMessage = "Impossible de récupérer l'historique: ${e.message}"
                isLoading = false
            }
        }
    }


    Scaffold(
        topBar = { TopAppBar(title = {
            Text("Historique des commandes")
        }
        )
        }
    ) { padding ->
        Box(modifier = Modifier
            .fillMaxSize()
            .padding(padding), contentAlignment = Alignment.Center) {

            when {
                isLoading -> {
                    CircularProgressIndicator()
                }
                errorMessage != null -> {
                    Text(text = errorMessage ?: "Erreur inconnue", color = MaterialTheme.colorScheme.error)
                }
                orders.isEmpty() -> {
                    Text("Aucune commande trouvée")
                }
                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(orders) { order ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                elevation = CardDefaults.cardElevation(4.dp)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text("Commande #${order.id}", style = MaterialTheme.typography.titleMedium)
                                    Text("Statut: ${order.status}")

                                    if (order.status == "in_delivery") {
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Button(onClick = {
                                            navController.navigate("scanner/${order.id}")
                                        }) {
                                            Text("Scanner QR Code")
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
            }
        }
    }
}
