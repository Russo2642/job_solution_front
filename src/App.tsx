import { Route, Routes } from 'react-router-dom'
import MainLayout from './shared/layouts/MainLayout'
import AddReviewPage from './pages/AddReviewPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import { AuthGuard, ProtectedRoute, CookieConsent, AdminRoute } from './shared/components'
import { CompanyPage } from './pages/CompanyPage'
import AdminPage from './pages/AdminPage'
import { useEffect } from 'react'
import { ApiClient } from './shared/api'

function App() {
  useEffect(() => {
    const tokenRefreshInterval = setInterval(async () => {
      try {
        await ApiClient.checkAndRefreshToken();
      } catch (e) {
        console.error('Ошибка при проверке токена:', e);
      }
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/company/:slug" element={<CompanyPage />} />
          
          {/* Публичные маршруты - только для неавторизованных пользователей */}
          <Route element={<AuthGuard />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          
          {/* Защищенные маршруты - только для авторизованных пользователей */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/add-review" element={<AddReviewPage />} />
            <Route path="/add-review/:companyId" element={<AddReviewPage />} />
          </Route>
          
          {/* Маршруты администратора */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Routes>
      <CookieConsent />
    </>
  )
}

export default App 