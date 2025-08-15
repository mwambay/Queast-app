package com.example.projettest
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.projettest.ui.theme.ProjetTestTheme

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "signin") {
        composable("signin") { SignInScreen(navController) }
        composable("register") { RegisterScreen(navController) }
    }
}

@Preview(showBackground = true)
@Composable
fun MyAppPreview() {
    ProjetTestTheme {
        AppNavigation()

    }
}