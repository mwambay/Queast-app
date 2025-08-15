import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import Login from './pages/login'
import GererRestaurants from './pages/gererRestaurants'
import GererMenus from './pages/gererMenus'
import GererUtilisateurs from './pages/gererUtilisateurs'
import SuiviCommandes from './pages/suiviCommandes'

const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: 'restaurants', element: <GererRestaurants /> },
      { path: 'menus', element: <GererMenus /> },
      { path: 'commandes', element: <SuiviCommandes /> },
      { path: 'utilisateurs', element: <GererUtilisateurs /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
