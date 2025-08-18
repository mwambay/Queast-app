package com.example.projettest


import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query

// --- MODELES ---
data class MenuResponse(
    val restaurant: RestaurantInfo,
    val count: Int,
    val menu_items: List<MenuItem>,
    val generated_at: String
)

data class RestaurantInfo(
    val id: Int,
    val name: String
)

data class MenuItem(
    val id: Int,
    val name: String,
    val description: String,
    val price: Double,
    val category: String,
    val image_url: String,
    val is_available: Boolean
)

// --- API SERVICE ---
interface MenuApiService {
    @GET("menu_items.php")
    suspend fun getMenu(@Query("id") restaurantId: Int): MenuResponse
}

object MenuApiClient {
    private val retrofit = Retrofit.Builder()
        .baseUrl("http://10.0.2.2:8080/api/") // ← adapte si tu testes sur téléphone réel (mettre IP locale)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val api: MenuApiService = retrofit.create(MenuApiService::class.java)
}

// --- UI ---
@Composable
fun RestaurantMenuScreen(restaurantId: Int, onBack: () -> Unit) {
    var menu by remember { mutableStateOf<List<MenuItem>>(emptyList()) }
    var restaurantName by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(restaurantId) {
        try {
            val response = withContext(Dispatchers.IO) {
                MenuApiClient.api.getMenu(restaurantId)
            }
            restaurantName = response.restaurant.name
            menu = response.menu_items
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            isLoading = false
        }
    }

    @OptIn(ExperimentalMaterial3Api::class)
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("🍽️ $restaurantName", fontSize = 20.sp, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Retour")
                    }
                }
            )
        }
    ) { padding ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(menu) { item ->
                    DishCard(item)
                }
            }
        }
    }
}

@Composable
fun DishCard(item: MenuItem) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                painter = rememberAsyncImagePainter(item.image_url),
                contentDescription = item.name,
                modifier = Modifier
                    .size(90.dp)
                    .clip(RoundedCornerShape(12.dp)),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(item.name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text(item.category, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                Text(item.description, style = MaterialTheme.typography.bodySmall, maxLines = 2)
                Spacer(modifier = Modifier.height(4.dp))
                Text("${item.price} $", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
            }
        }
    }
}
