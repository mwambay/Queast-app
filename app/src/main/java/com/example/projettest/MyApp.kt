package com.example.projettest

import History
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.projettest.ui.RestaurantApp
import com.example.projettest.ui.theme.ProjetTestTheme
import com.example.projettest.views.Api.deliveryApi
import com.example.projettest.views.OrderHistoryScreen
import com.example.projettest.views.QrCodeScannerScreen
import com.example.projettest.views.SignInScreen

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "signin") {
        composable("signin") { SignInScreen(navController) }
        composable("register") { RegisterScreen(navController) }
        composable("home") { RestaurantApp(navController = navController) }
        composable(
            route = "historique/{userId}",
            arguments = listOf(navArgument("userId") { type = NavType.IntType })
        ) { backStackEntry ->
            val userId = backStackEntry.arguments?.getInt("userId") ?: 0
            OrderHistoryScreen(userId, navController)
        }

        composable(
            route = "Liste/{userId}",
            arguments = listOf(navArgument("userId") { type = NavType.IntType })
        ) { backStackEntry ->
            val userId = backStackEntry.arguments?.getInt("userId") ?: 0
            History(userId)
        }

        composable("scanner/{orderId}") { backStackEntry ->
            val orderId = backStackEntry.arguments?.getString("orderId")?.toIntOrNull() ?: 0
            QrCodeScannerScreen(
                orderId = orderId,
                deliveryApi = deliveryApi,
                onSuccess = { message ->
                    // Affiche un snackbar ou toast
                },
                onError = { error ->
                    // Affiche un snackbar ou toast
                }
            )
        }
    }




}

@Preview(showBackground = true)
@Composable
fun MyAppPreview() {
    ProjetTestTheme {
        AppNavigation()
    }
}
