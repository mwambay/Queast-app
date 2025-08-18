package com.example.projettest.views

import android.app.Activity
import android.content.Intent
import android.util.LogPrinter
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.projettest.data.DeliveryApi2
import com.journeyapps.barcodescanner.ScanOptions
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Query


interface DeliveryApi2 {
    @POST("livraison/valider")
    suspend fun validateDelivery(
        @Query("id") orderId: Int,
        @Body request: QrRequest
    ): ApiResponse
}

fun createApiService2(): DeliveryApi2 {
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
        .baseUrl("http://192.168.43.169:8001/") // ton backend
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(DeliveryApi2::class.java)  // ✅ ici

}



@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QrCodeScannerScreen(
    orderId: Int,
    onSuccess: (String) -> Unit,
    onError: (String) -> Unit
) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    var scanResult by remember { mutableStateOf<String?>(null) }

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            println("okkk1k")
            val contents = result.data?.getStringExtra("SCAN_RESULT")
            println(contents)
            scanResult = contents
            if (contents != null) {
                scope.launch {
                    try {
                        println("okkk277k")
                        println("Order ID: $orderId")
                        val api = createApiService2()

                        val response = api.validateDelivery(
                            orderId,
                            QrRequest(contents)
                        )
                        println(">>> API CALL OK, réponse: ${response.message}")

                        println("okkk")
                        onSuccess(response.message)
                    } catch (e: Exception) {
                        println(e.message)
                        onError("Erreur : ${e.message}")
                    }
                }
            }
            else{
                println("connard")
            }
        }
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Scanner QR Code") }) }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally
        ) {
            Button(onClick = {
                val options = ScanOptions()
                options.setPrompt("Scannez le QR code de la commande")
                options.setOrientationLocked(false)
                options.setBeepEnabled(true)
                launcher.launch(options.createScanIntent(context))
            }) {
                Text("Scanner QR Code")
            }

            scanResult?.let {

                Spacer(modifier = Modifier.height(16.dp))
                Text("Dernier scan: $it")
            }
        }
    }
}



