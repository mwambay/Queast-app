package com.example.projettest.session

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

object SessionManager {
    private val _isLoggedIn = MutableStateFlow(false)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn

    private var sessionId: String? = null
    private var userId: Int? = null
    private var userRole: String? = null

    fun startSession(sessionId: String, userId: Int, role: String) {
        this.sessionId = sessionId
        this.userId = userId
        this.userRole = role
        _isLoggedIn.value = true
    }

    fun endSession() {
        sessionId = null
        userId = null
        userRole = null
        _isLoggedIn.value = false
    }

    fun getUserRole(): String? = userRole
    fun getUserId(): Int? = userId
    fun getSessionId(): String? = sessionId
}
