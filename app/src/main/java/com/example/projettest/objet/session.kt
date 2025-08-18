package com.example.projettest.objet

import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl

object SessionCookieJar : CookieJar {
    private val cookieStore = HashMap<String, List<Cookie>>()

    override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
        cookieStore[url.host] = cookies
    }

    override fun loadForRequest(url: HttpUrl): List<Cookie> {
        return cookieStore[url.host] ?: emptyList()
    }
}
