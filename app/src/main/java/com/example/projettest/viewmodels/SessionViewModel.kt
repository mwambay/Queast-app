package com.example.projettest.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.projettest.LoginRequest
import com.example.projettest.api.ApiClient

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class SessionViewModel : ViewModel() {
    private val api = ApiClient.apiService

    private val _isLoggedIn = MutableStateFlow(false)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    fun login(email: String, password: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            try {
                val response = api.login(LoginRequest(email, password))
                if (response.isSuccessful && response.body()?.success == true) {
                    _isLoggedIn.value = true
                    _error.value = null
                    onSuccess()
                } else {
                    _error.value = response.body()?.message ?: "Erreur de connexion"
                    ApiClient.clearCookies()
                }
            } catch (e: Exception) {
                _error.value = e.localizedMessage
                ApiClient.clearCookies()
            }
        }
    }

    fun logout() {
        _isLoggedIn.value = false
        ApiClient.clearCookies()
    }
}
