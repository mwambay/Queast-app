import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '10.213.169.194', // ou une IP précise, ex: "192.168.1.10"
    port: 5175,      // le port que tu veux utiliser
  }
})
