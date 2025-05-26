import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../entities/auth/context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface AdminRouteProps {
  redirectPath?: string;
}

const AdminRoute = ({ redirectPath = '/' }: AdminRouteProps) => {
  const { isAuthenticated, user, loading, loggingOut } = useAuth();
  
  if (loading || loggingOut) {
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
  
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return <Navigate to={redirectPath} replace />;
  }
  
  return <Outlet />;
};

export default AdminRoute; 