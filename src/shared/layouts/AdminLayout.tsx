import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { AdminProvider } from '../../entities/admin/context/AdminContext';

const AdminLayout: React.FC = () => {
  return (
    <AdminProvider>
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex', 
          flexDirection: 'column'
        }}
      >
        <Outlet />
      </Box>
    </AdminProvider>
  );
};

export default AdminLayout; 