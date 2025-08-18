import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

import retrofit2.http.GET
import retrofit2.http.Query

data class OrderItem(
    val name: String,
    val quantity: Int,
    val price: Double
)

data class Commande(
    val id: Int,
    val restaurant: String,
    val status: String,
    val total_price: Double,
    val created_at: String,
    val items: List<OrderItem>
)




object ApiClient {
    private const val BASE_URL = "http://10.213.169.194:8001/"
    val orderApi: CommandeApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(CommandeApi::class.java)
    }
}



