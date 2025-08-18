package com.example.projettest.views

import android.app.Activity
import android.content.Intent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.journeyapps.barcodescanner.ScanOptions
import kotlinx.coroutines.launch
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Query







@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QrCodeScannerScreen(
    orderId: Int,
    deliveryApi: DeliveryApi,
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
            val contents = result.data?.getStringExtra("SCAN_RESULT")
            scanResult = contents
            if (contents != null) {
                scope.launch {
                    try {
                        val response = deliveryApi.validateDelivery(
                            orderId,
                            QrRequest(contents)
                        )
                        onSuccess(response.message)
                    } catch (e: Exception) {
                        onError("Erreur : ${e.message}")
                    }
                }
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



