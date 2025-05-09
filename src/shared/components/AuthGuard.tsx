import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../entities/auth/context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface AuthGuardProps {
  redirectPath?: string;
}

/**
 * Компонент для защиты публичных страниц (например, логин/регистрация)
 * от доступа авторизованных пользователей
 */
const AuthGuard = ({ redirectPath = '/' }: AuthGuardProps) => {
  const { isAuthenticated, loading, loggingOut } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 64px)' 
      }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (isAuthenticated && !loggingOut) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return <Outlet />;
};

export default AuthGuard; 