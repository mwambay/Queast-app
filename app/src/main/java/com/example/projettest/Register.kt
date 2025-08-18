package com.example.projettest

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.text.ClickableText
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import kotlinx.coroutines.launch
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

// -----------------------------
// MODELES
// -----------------------------
data class RegisterRequest(val name: String, val email: String, val password: String, val role: String = "client")
data class LoginRequest(val email: String, val password: String)
data class User(val id: Int, val role: String)
data class LoginResponse(val success: Boolean, val user: User?, val message: String, val token: String? = null)
data class UserResponse(val id: Int, val email: String, val role: String)
data class SessionResponse(val id: String, val expires: Long)
data class RegisterResponse(val message: String, val user: UserResponse?, val session: SessionResponse?)
data class Order(val id: Int, val restaurant_name: String, val client_name: String, val client_phone: String, val status: String, val qr_code: String?)

// -----------------------------
// API SERVICE
// -----------------------------
interface ApiService {
    @POST("/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<RegisterResponse>

    @POST("/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @GET("/api/commandes/livreur")
    suspend fun getOrders(): Response<List<Order>>
}

// -----------------------------
// COOKIE JAR POUR SESSION PHP
// -----------------------------
class SessionCookieJar : CookieJar {
    private val cookieStore = mutableMapOf<String, List<Cookie>>()

    override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
        cookieStore[url.host] = cookies.filter { it.name == "PHPSESSID" }
    }

    override fun loadForRequest(url: HttpUrl): List<Cookie> {
        return cookieStore[url.host] ?: emptyList()
    }
}

// -----------------------------
// API CLIENT
// -----------------------------
object ApiClient {
    private const val BASE_URL = "http://10.213.169.194:8001/"

    private val client = OkHttpClient.Builder()
        .cookieJar(SessionCookieJar())
        .build()

    val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}

// -----------------------------
// REGISTER SCREEN
// -----------------------------
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(navController: NavController) {
    val name = remember { mutableStateOf("") }
    val email = remember { mutableStateOf("") }
    val password = remember { mutableStateOf("") }
    val confirmPassword = remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 32.dp, vertical = 24.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Logo/Title with enhanced styling
        Text(
            "Queast",
            style = MaterialTheme.typography.displaySmall.copy(
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.primary
            ),
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // Divider with better visibility
        Divider(
            modifier = Modifier
                .fillMaxWidth(0.5f)
                .padding(vertical = 8.dp),
            thickness = 2.dp,
            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
        )

        // Register title
        Text(
            "Create your account",
            style = MaterialTheme.typography.titleLarge.copy(
                fontWeight = FontWeight.Bold
            ),
            modifier = Modifier.padding(bottom = 24.dp)
        )

        // Input fields in a card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f)
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
                // Name field
                OutlinedTextField(
                    value = name.value,
                    onValueChange = { name.value = it },
                    label = { Text("Full Name") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp),
                    shape = MaterialTheme.shapes.medium,
                    colors = TextFieldDefaults.colors( // Utiliser TextFieldDefaults.colors au lieu de outlinedTextFieldColors
                        focusedIndicatorColor = MaterialTheme.colorScheme.primary, // Couleur de la bordure lorsqu'il est focus
                        unfocusedIndicatorColor = MaterialTheme.colorScheme.outline // Couleur de la bordure lorsqu'il n'est pas focus
                    )
                )

                // Email field
                OutlinedTextField(
                    value = email.value,
                    onValueChange = { email.value = it },
                    label = { Text("Email") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp),
                    shape = MaterialTheme.shapes.medium,
                    colors = TextFieldDefaults.colors( // Utiliser TextFieldDefaults.colors au lieu de outlinedTextFieldColors
                        focusedIndicatorColor = MaterialTheme.colorScheme.primary, // Couleur de la bordure lorsqu'il est focus
                        unfocusedIndicatorColor = MaterialTheme.colorScheme.outline // Couleur de la bordure lorsqu'il n'est pas focus
                    )
                )

                // Password field
                OutlinedTextField(
                    value = password.value,
                    onValueChange = { password.value = it },
                    label = { Text("Password") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp),
                    shape = MaterialTheme.shapes.medium,
                    colors = TextFieldDefaults.colors( // Utiliser TextFieldDefaults.colors au lieu de outlinedTextFieldColors
                        focusedIndicatorColor = MaterialTheme.colorScheme.primary, // Couleur de la bordure lorsqu'il est focus
                        unfocusedIndicatorColor = MaterialTheme.colorScheme.outline // Couleur de la bordure lorsqu'il n'est pas focus
                    ),
                    visualTransformation = PasswordVisualTransformation()
                )

                // Confirm Password field
                OutlinedTextField(
                    value = confirmPassword.value,
                    onValueChange = { confirmPassword.value = it },
                    label = { Text("Confirm Password") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 20.dp),
                    shape = MaterialTheme.shapes.medium,
                    colors = TextFieldDefaults.colors( // Utiliser TextFieldDefaults.colors au lieu de outlinedTextFieldColors
                        focusedIndicatorColor = MaterialTheme.colorScheme.primary, // Couleur de la bordure lorsqu'il est focus
                        unfocusedIndicatorColor = MaterialTheme.colorScheme.outline // Couleur de la bordure lorsqu'il n'est pas focus
                    ),
                    visualTransformation = PasswordVisualTransformation()
                )

                // Register button
                Button(
                    onClick = {
                        if (password.value != confirmPassword.value) {
                            errorMessage = "Les mots de passe ne correspondent pas"
                            return@Button
                        }
                        scope.launch {
                            isLoading = true
                            errorMessage = null
                            try {
                                val response = ApiClient.apiService.register(RegisterRequest(name.value, email.value, password.value))
                                if (response.isSuccessful && response.body()?.message?.contains("succès", true) == true) {
                                    navController.navigate("home") { popUpTo("register") { inclusive = true } }
                                } else {
                                    errorMessage = response.body()?.message ?: "Erreur d'inscription"
                                }
                            } catch (e: Exception) {
                                errorMessage = "Erreur: ${e.localizedMessage}"
                            } finally { isLoading = false }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    enabled = !isLoading && name.value.isNotEmpty() && email.value.isNotEmpty() && password.value.isNotEmpty() && confirmPassword.value.isNotEmpty(),
                    shape = MaterialTheme.shapes.large,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        contentColor = MaterialTheme.colorScheme.onPrimary
                    )
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(
                            "Register",
                            style = MaterialTheme.typography.labelLarge.copy(
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 0.5.sp
                            )
                        )
                    }
                }
            }
        }

        // Error message with better styling
        errorMessage?.let { error ->
            Text(
                text = error,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier
                    .padding(top = 16.dp)
                    .fillMaxWidth()
            )
        }

        // Sign in link with better styling
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(top = 24.dp)
        ) {
            Text(
                "Already have an account? ",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
            Text(
                text = "Sign in",
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                ),
                modifier = Modifier
                    .clickable { navController.navigate("signin") }
                    .padding(start = 4.dp)
            )
        }
    }
}

// -----------------------------
// SIGNIN SCREEN
// -----------------------------

