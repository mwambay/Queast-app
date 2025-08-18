package com.example.projettest.api

import com.example.projettest.ApiService
import okhttp3.*
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiClient {
    private class CustomCookieJar : CookieJar {
        val cookieStore = mutableMapOf<String, List<Cookie>>()

        override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
            cookieStore[url.host] = cookies.filter {
                it.name.startsWith("PHPSESSID") ||
                it.name == "session_token"
            }
        }

        override fun loadForRequest(url: HttpUrl): List<Cookie> {
            return cookieStore[url.host] ?: emptyList()
        }
    }

    private val cookieJar = CustomCookieJar()

    private val client = OkHttpClient.Builder()
        .cookieJar(cookieJar)
        .addInterceptor { chain ->
            val original = chain.request()
            val request = original.newBuilder()
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("X-Requested-With", "XMLHttpRequest")
                .build()
            chain.proceed(request)
        }
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl("http://10.213.169.194:8001/")
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val apiService: ApiService = retrofit.create(ApiService::class.java)

    fun clearCookies() {
        cookieJar.cookieStore.clear()
    }
}
