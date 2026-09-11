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
    handle: {
      title: 'Login | Clinic Stock Console',
      description: 'Sign in to the Clinic Stock Console.',
    },
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <StockListPage />,
        handle: {
          title: 'Stock | Clinic Stock Console',
          description: 'View and manage clinic stock inventory.',
        },
      },
      {
        path: '/items/:id',
        element: <ItemDetailPage />,
        handle: {
          title: 'Item Details | Clinic Stock Console',
          description:
            'View clinic stock item details and inventory information.',
        },
      },
      {
        path: '/profile',
        element: <UserProfilePage />,
        handle: {
          title: 'My Profile | Clinic Stock Console',
          description: 'View and manage your profile information.',
        },
      },
    ],
  },
])
