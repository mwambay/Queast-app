import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import retrofit2.http.GET
import retrofit2.http.Query

// MODELE (exemple)
data class CommandeItem(
    val name: String,
    val quantity: Int,
    val price: Double
)



// API
interface CommandeApi {
    @GET("commandes/client")
    suspend fun getCommandesClient(@Query("id") clientId: Int): List<Commande>
}

// COMPOSABLE
@Composable
fun History(userId: Int) {
    var commandes by remember { mutableStateOf<List<Commande>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(userId) {
        try {
            commandes = ApiClient.orderApi.getCommandesClient(userId)
        } catch (e: Exception) {
            errorMessage = e.localizedMessage ?: "Erreur inconnue"
        } finally {
            isLoading = false
        }
    }

    when {
        isLoading -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        }

        errorMessage != null -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Erreur : $errorMessage",
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(16.dp)
                )
            }
        }

        commandes.isEmpty() -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text("Aucune commande trouvée", style = MaterialTheme.typography.bodyLarge)
            }
        }

        else -> {
            LazyColumn(modifier = Modifier.fillMaxSize().padding(8.dp)) {
                items(commandes) { commande ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(8.dp),
                        elevation = CardDefaults.cardElevation(6.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("Commande #${commande.id}", style = MaterialTheme.typography.titleMedium)
                            Text("Restaurant : ${commande.restaurant}")
                            Text("Statut : ${commande.status}")
                            Text("Total : ${commande.total_price} $")
                            Text("Date : ${commande.created_at}")

                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Détails :", style = MaterialTheme.typography.titleSmall)

                            commande.items.forEach { item ->
                                Text("- ${item.name} x${item.quantity} (${item.price} $)")
                            }
                        }
                    }
                }
            }
        }
    }
}
