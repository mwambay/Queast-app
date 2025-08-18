package com.example.projettest.views


import android.graphics.BitmapFactory
import android.util.Base64
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.rememberAsyncImagePainter
import com.example.projettest.objet.SessionCookieJar
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

// -------------------------
// MODELES
// -------------------------
data class Restaurant(
    val id: Int,
    val name: String,
    val address: String,
    val phone: String,
    val image_url: String,
    val is_active: Int // ← côté serveur c'est un int (0 ou 1)
)

data class RestaurantResponse(
    val count: Int,
    val restaurants: List<Restaurant>
)

data class MenuItem(
    val id: Int,
    val name: String,
    val description: String,
    val price: Double,
    val category: String,
    val image_url: String,
    val is_available: Int // int côté serveur
)

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

// -------------------------
// API SERVICES
// -------------------------
interface RestaurantApiService {
    @GET("restaurants/index.php")
    suspend fun getRestaurants(): RestaurantResponse
}

interface MenuApiService {
    @GET("restaurants/plats.php")
    suspend fun getMenu(@Query("id") restaurantId: Int): MenuResponse
}

// Pour les commandes
data class OrderItemRequest(val id: Int, val price: Double, val quantity: Int)
data class OrderRequest(val restaurant_id: Int, val delivery_address: String, val items: List<OrderItemRequest>)
data class OrderResponse(val message: String, val commande_id: Int, val qr_code: String)

interface OrderApiService {
    @POST("commandes/index.php")
    suspend fun createOrder(@Body request: OrderRequest): Response<OrderResponse>
}

object UserSession {
    var userId: Int? = null
}


// -------------------------
// API CLIENTS
// -------------------------
object ApiClient {
    private const val BASE_URL = "http://192.168.43.169:8001/api/"

    // ✅ un seul OkHttpClient partagé
    private val client = okhttp3.OkHttpClient.Builder()
        .cookieJar(SessionCookieJar)
        .build()

    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val restaurantApi: RestaurantApiService by lazy {
        retrofit.create(RestaurantApiService::class.java)
    }

    val menuApi: MenuApiService by lazy {
        retrofit.create(MenuApiService::class.java)
    }

    val orderApi: OrderApiService by lazy {
        retrofit.create(OrderApiService::class.java)
    }
}


// -------------------------
// COMPOSABLES
// -------------------------
@Composable
fun RestaurantApp(navController: NavController) { // Ajout de NavController
    var selectedRestaurantId by remember { mutableStateOf<Int?>(null) }

    if (selectedRestaurantId == null) {
        RestaurantListScreen(
            onRestaurantClick = { restaurantId -> selectedRestaurantId = restaurantId },
            navController = navController // Passe le NavController
        )
    } else {
        RestaurantMenuScreenWithOrder(
            restaurantId = selectedRestaurantId!!,
            onBack = { selectedRestaurantId = null }
        )
    }
}

// --- LISTE RESTAURANTS ---
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RestaurantListScreen(onRestaurantClick: (Int) -> Unit, navController: NavController) {
    var restaurants by remember { mutableStateOf<List<Restaurant>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        try {
            val response = withContext(Dispatchers.IO) { ApiClient.restaurantApi.getRestaurants() }
            restaurants = response.restaurants.filter { it.is_active != 0 }
        } catch (e: Exception) {
            errorMessage = "Erreur de chargement: ${e.localizedMessage}"
        } finally { isLoading = false }
    }

    Scaffold(topBar = { TopAppBar(title = {
        Row {
            Text("🍴 Restaurants")
            Spacer(modifier = Modifier.weight(1f))
            val currentUserId = UserSession.userId ?: 0

            IconButton(
                onClick = {
                    if (currentUserId != 0) {
                        navController.navigate("Liste/$currentUserId")
                    }
                },
            ) {
                Icon(Icons.Default.Menu, contentDescription = "Rechercher")
            }

        }
    }) }) { padding ->
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (errorMessage != null) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text(errorMessage ?: "", color = MaterialTheme.colorScheme.error)
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding).padding(8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(restaurants) { restaurant ->
                    RestaurantCard(restaurant) { onRestaurantClick(restaurant.id) }
                }
            }
        }
    }
}

@Composable
fun RestaurantCard(restaurant: Restaurant, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(6.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Image(
                painter = rememberAsyncImagePainter(restaurant.image_url.ifEmpty { "/images/default-restaurant.jpg" }),
                contentDescription = restaurant.name,
                modifier = Modifier.fillMaxWidth().height(180.dp).clip(RoundedCornerShape(12.dp)),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(restaurant.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Text(restaurant.address, style = MaterialTheme.typography.bodyMedium)
            Text("📞 ${restaurant.phone}", style = MaterialTheme.typography.bodySmall)
        }
    }
}

// --- MENU + COMMANDE ---
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RestaurantMenuScreenWithOrder(restaurantId: Int, onBack: () -> Unit) {
    var menu by remember { mutableStateOf<List<MenuItem>>(emptyList()) }
    var restaurantName by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var orderDialogVisible by remember { mutableStateOf(false) }
    var qrBitmap by remember { mutableStateOf<ImageBitmap?>(null) }
    val selectedItems = remember { mutableStateMapOf<MenuItem, Int>() }
    val scope = rememberCoroutineScope()

    LaunchedEffect(restaurantId) {
        try {
            val response = withContext(Dispatchers.IO) { ApiClient.menuApi.getMenu(restaurantId) }
            restaurantName = response.restaurant.name
            menu = response.menu_items.filter { it.is_available != 0 }
        } catch (e: Exception) {
            errorMessage = "Erreur de chargement: ${e.localizedMessage}"
        } finally { isLoading = false }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("🍽️ $restaurantName", fontSize = 20.sp, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, contentDescription = "Retour") }
                }
            )
        },
        bottomBar = {
            // Bouton toujours visible, mais désactivé si aucun plat sélectionné
            Button(
                onClick = {
                    scope.launch {
                        try {
                            val orderRequest = OrderRequest(
                                restaurant_id = restaurantId,
                                delivery_address = "Adresse test",
                                items = selectedItems.map { (item, qty) ->
                                    OrderItemRequest(item.id, item.price, qty)
                                }
                            )
                            val response = ApiClient.orderApi.createOrder(orderRequest)
                            if (response.isSuccessful) {
                                response.body()?.let { body ->
                                    val bytes = Base64.decode(body.qr_code, Base64.DEFAULT)
                                    val bmp = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                                    qrBitmap = bmp.asImageBitmap()
                                    orderDialogVisible = true
                                }
                            } else {
                                errorMessage = "Erreur serveur: ${response.code()}"
                            }
                        } catch (e: Exception) { errorMessage = e.localizedMessage }
                    }
                },
                modifier = Modifier.fillMaxWidth().padding(8.dp),
                enabled = selectedItems.isNotEmpty() // bouton désactivé si rien n'est sélectionné
            ) {
                Text("Commander (${selectedItems.values.sum()})")
            }
        }
    ) { padding ->
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (errorMessage != null) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text(errorMessage ?: "", color = MaterialTheme.colorScheme.error)
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding).padding(8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) { items(menu) { item -> DishCardWithOrder(item, selectedItems) } }
        }
    }

    if (orderDialogVisible && qrBitmap != null) {
        AlertDialog(
            onDismissRequest = { orderDialogVisible = false },
            confirmButton = { TextButton(onClick = { orderDialogVisible = false }) { Text("OK") } },
            title = { Text("Commande réussie") },
            text = { qrBitmap?.let { Image(bitmap = it, contentDescription = "QR Code commande", modifier = Modifier.size(200.dp)) } }
        )
    }
}

@Composable
fun DishCardWithOrder(item: MenuItem, selectedItems: MutableMap<MenuItem, Int>) {
    var quantity by remember { mutableStateOf(selectedItems[item] ?: 0) }

    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp), elevation = CardDefaults.cardElevation(4.dp)) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Image(
                    painter = rememberAsyncImagePainter(item.image_url.ifEmpty { "/images/default-dish.jpg" }),
                    contentDescription = item.name,
                    modifier = Modifier.size(90.dp).clip(RoundedCornerShape(12.dp)),
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
            Spacer(modifier = Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Button(onClick = {
                    quantity++
                    selectedItems[item] = quantity
                }) { Text("+") }
                Spacer(modifier = Modifier.width(8.dp))
                Text(quantity.toString(), fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.width(8.dp))
                Button(onClick = {
                    if (quantity > 0) {
                        quantity--
                        if (quantity == 0) selectedItems.remove(item)
                        else selectedItems[item] = quantity
                    }
                }) { Text("-") }
            }
        }
    }
}
