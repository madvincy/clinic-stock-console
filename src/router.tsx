import { createBrowserRouter } from 'react-router-dom'
import StockListPage from './pages/StockListPage'
import ItemDetailPage from './pages/ItemDetailPage'
import LoginPage from './pages/LoginPage'
import UserProfilePage from './pages/UserProfilePage'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './features/auth/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <StockListPage /> },
      { path: '/items/:id', element: <ItemDetailPage /> },
      { path: '/profile', element: <UserProfilePage /> },
    ],
  },
])
