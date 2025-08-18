package com.example.projettest.api

import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl

class SessionCookieJar : CookieJar {
    private val cookieStore = mutableMapOf<String, Cookie>()

    override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
        for (cookie in cookies) {
            cookieStore[cookie.name] = cookie
        }
    }

    override fun loadForRequest(url: HttpUrl): List<Cookie> {
        return cookieStore.values.toList()
    }
}

