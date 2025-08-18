package com.example.projettest.views



import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.projettest.LoginRequest
import com.example.projettest.api.ApiClient
import com.example.projettest.ui.UserSession
import kotlinx.coroutines.launch


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SignInScreen(navController: NavController) {
    val email = remember { mutableStateOf("") }
    val password = remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 32.dp, vertical = 40.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Logo/Title with more styling
        Text(
            "Queast",
            style = MaterialTheme.typography.displaySmall.copy(
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.primary
            ),
            modifier = Modifier.padding(bottom = 40.dp)
        )

        // Card for input fields
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp)
            ) {
                // Email field
                OutlinedTextField(
                    value = email.value,
                    onValueChange = { email.value = it },
                    label = { Text("Email", style = MaterialTheme.typography.bodyLarge) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp),
                    shape = MaterialTheme.shapes.medium,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                        focusedLabelColor = MaterialTheme.colorScheme.primary,
                        cursorColor = MaterialTheme.colorScheme.primary
                    ),
                )

                // Password field
                OutlinedTextField(
                    value = password.value,
                    onValueChange = { password.value = it },
                    label = { Text("Password", style = MaterialTheme.typography.bodyLarge) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 24.dp),
                    shape = MaterialTheme.shapes.medium,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                        focusedLabelColor = MaterialTheme.colorScheme.primary,
                        cursorColor = MaterialTheme.colorScheme.primary
                    ),
                    visualTransformation = PasswordVisualTransformation()
                )

                // Sign in button
                Button(
                    onClick = {
                        scope.launch {
                            isLoading = true
                            errorMessage = null
                            try {
                                val response = ApiClient.apiService.login(
                                    LoginRequest(
                                        email.value,
                                        password.value
                                    )
                                )
                                if (response.isSuccessful) {
                                    val user = response.body()?.user
                                    if (user != null) {
                                        val role = user.role
                                        val user = response.body()?.user
                                        if (user != null) {
                                            UserSession.userId = user.id // ← stocke l'ID réel
                                            val role = user.role
                                            when (role) {
                                                "client" -> {
                                                    navController.navigate("home") { popUpTo("signin") { inclusive = true } }
                                                }
                                                "livreur" -> {
                                                    navController.navigate("historique/${user.id}") { popUpTo("signin") { inclusive = true } }
                                                }
                                                else -> errorMessage = "Rôle inconnu: $role"
                                            }
                                        }

                                    } else {
                                        errorMessage = "Utilisateur non trouvé"
                                    }
                                } else {
                                    when (response.code()) {
                                        403 -> errorMessage = "Accès interdit. Vérifiez vos permissions."
                                        else -> errorMessage = "Erreur serveur: ${response.code()}"
                                    }
                                }
                            } catch (e: Exception) {
                                errorMessage = "Erreur: ${e.localizedMessage}"
                            } finally {
                                isLoading = false
                            }
                        }
                    },


                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    enabled = !isLoading && email.value.isNotEmpty() && password.value.isNotEmpty(),
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
                            "Sign in",
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

        Spacer(modifier = Modifier.height(24.dp))

        // Register link with better styling
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(top = 8.dp)
        ) {
            Text(
                "Don't have an account? ",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
            Text(
                text = "Register",
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                ),
                modifier = Modifier
                    .clickable { navController.navigate("register") }
                    .padding(start = 4.dp)
            )
        }
    }
}