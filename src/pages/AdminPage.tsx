import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  alpha,
  useTheme,
  Divider,
  Rating,
  CircularProgress,
  Tooltip,
  Stack,
  Alert
} from '@mui/material';
import React, { useEffect, useState, forwardRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../entities/admin/context/AdminContext';
import { useAuth } from '../entities/auth/context/AuthContext';
import { AdminApi, AdminStatistics, AdminUser, AdminCompany, AdminCreateCompanyRequest, AdminReviewDetail, ModerationAction, UpdateUserRoleRequest } from '../shared/api/admin';
import { CityApi, IndustryApi } from '../shared/api';
import { City, Industry } from '../shared/types';
import './AdminPage.css';
import { httpClient } from '../shared/api/httpClient';
import { IMaskInput } from 'react-imask';
import {
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const drawerWidth = 280;

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  to: string;
  onClick: () => void;
  badge?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, text, active, to, onClick, badge }) => {
  const theme = useTheme();

  return (
    <ListItemButton
      component={Link}
      to={to}
      onClick={onClick}
      className="admin-sidebar-item"
      sx={{
        mb: 1,
        py: 1.5,
        borderRadius: 2,
        bgcolor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
        color: active ? theme.palette.primary.main : 'inherit',
        '&:hover': {
          bgcolor: active ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.grey[500], 0.1),
        }
      }}
    >
      <ListItemIcon sx={{ color: active ? theme.palette.primary.main : 'inherit', minWidth: 40 }}>
        {icon}
      </ListItemIcon>
      <ListItemText primary={text} primaryTypographyProps={{ fontWeight: active ? 500 : 400 }} />
      {badge !== undefined && badge > 0 && (
        <Chip
          label={badge}
          size="small"
          color="warning"
          sx={{
            height: 22,
            minWidth: 22,
            fontSize: '0.75rem',
          }}
        />
      )}
    </ListItemButton>
  );
};

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const PhoneMaskAdapter = forwardRef<HTMLInputElement, CustomProps>(
  function TextMaskCustom(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="+7 (000) 000 00 00"
        definitions={{
          '#': /[1-9]/,
        }}
        inputRef={ref}
        onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
        overwrite
        placeholder="+7 (___) ___ __ __"
      />
    );
  },
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const isFetchedRef = React.useRef(false);
  const theme = useTheme();

  useEffect(() => {
    const fetchStatistics = async () => {
      if (isFetchedRef.current) return;
      try {
        const response = await AdminApi.getStatistics();
        setStats(response.data);
        isFetchedRef.current = true;
      } catch (error) {
        console.error('Ошибка при загрузке статистики:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const statItems = [
    { label: 'Пользователей', value: stats?.users_count, color: theme.palette.primary.main },
    { label: 'Компаний', value: stats?.companies_count, color: theme.palette.success.main },
    { label: 'Отзывов', value: stats?.reviews_count, color: theme.palette.info.main },
    { label: 'Ожидают модерации', value: stats?.pending_reviews, color: theme.palette.warning.main },
    { label: 'Проверенные отзывы', value: stats?.approved_reviews, color: theme.palette.success.main },
    { label: 'Отклоненные отзывы', value: stats?.rejected_reviews, color: theme.palette.error.main },
    { label: 'Городов', value: stats?.cities_count, color: theme.palette.error.main },
    { label: 'Отраслей', value: stats?.industries_count, color: theme.palette.secondary.main },
    { label: 'Типов бенефитов', value: stats?.benefit_types_count, color: '#6d4c41' },
    { label: 'Категорий рейтинга', value: stats?.rating_categories_count, color: '#546e7a' },
    { label: 'Типов занятости', value: stats?.employment_types_count, color: '#5e35b1' },
    { label: 'Периодов работы', value: stats?.employment_periods_count, color: '#00897b' }
  ];

  return (
    <Box>
      <Typography variant="h4" mb={4} fontWeight={500}>
        Обзор системы
      </Typography>

      <Grid container spacing={3}>
        {statItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              elevation={0}
              className="admin-card"
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(item.color, 0.2)}`,
                backgroundColor: alpha(item.color, 0.05)
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {item.label}
                </Typography>
                {loading ? (
                  <Skeleton variant="text" width="60%" height={40} />
                ) : (
                  <Typography variant="h4" fontWeight={600} color={item.color}>
                    {item.value}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const Users: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const fetchingRef = React.useRef(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (fetchingRef.current) return;

      try {
        fetchingRef.current = true;
        setLoading(true);
        const response = await AdminApi.getUsers(page + 1, rowsPerPage);
        setUsers(response.data.users);
        setTotal(response.data.pagination.total);
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchUsers();
  }, [page, rowsPerPage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDeleteDialog = (userId: number) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setProcessingAction(true);
    try {
      await AdminApi.deleteUser(userToDelete);
      const response = await AdminApi.getUsers(page + 1, rowsPerPage);
      setUsers(response.data.users);
      setTotal(response.data.pagination.total);
      handleCloseDeleteDialog();
      setSuccessMessage('Пользователь успешно удален');
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleOpenRoleDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const handleCloseRoleDialog = () => {
    setIsRoleDialogOpen(false);
    setSelectedUser(null);
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setSelectedRole(event.target.value);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !selectedRole) return;

    setProcessingAction(true);
    try {
      const data: UpdateUserRoleRequest = {
        role: selectedRole as 'user' | 'moderator' | 'admin'
      };
      await AdminApi.updateUserRole(selectedUser.id, data);
      const response = await AdminApi.getUsers(page + 1, rowsPerPage);
      setUsers(response.data.users);
      setTotal(response.data.pagination.total);
      handleCloseRoleDialog();
      setSuccessMessage(`Роль пользователя ${selectedUser.first_name} ${selectedUser.last_name} успешно изменена на "${selectedRole}"`);
    } catch (error) {
      console.error('Ошибка при изменении роли пользователя:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'moderator':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" mb={4} fontWeight={500}>
        Управление пользователями
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3 }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader className="admin-table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Имя</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Дата регистрации</TableCell>
                <TableCell>Последнее обновление</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={`skeleton-row-${index}`}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                  </TableRow>
                ))
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          className="admin-avatar"
                          sx={{
                            mr: 2,
                            width: 32,
                            height: 32,
                            bgcolor: `${user.role === 'admin' ? 'error.main' : user.role === 'moderator' ? 'warning.main' : 'primary.main'}`
                          }}
                        >
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        {user.first_name} {user.last_name}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={getRoleColor(user.role) as any}
                      />
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                    <TableCell>{new Date(user.updated_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenRoleDialog(user)}
                          title="Изменить роль"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleOpenDeleteDialog(user.id)}
                          title="Удалить пользователя"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!loading && users.length === 0 && (
                <TableRow key="empty-user-row">
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary" sx={{ py: 3 }}>
                      Пользователи не найдены
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        />
      </Paper>

      {/* Диалог удаления пользователя */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить этого пользователя? Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit" disabled={processingAction}>
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            color="error" 
            variant="contained" 
            disabled={processingAction}
          >
            {processingAction ? <CircularProgress size={24} color="inherit" /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог изменения роли */}
      <Dialog
        open={isRoleDialogOpen}
        onClose={handleCloseRoleDialog}
      >
        <DialogTitle>Изменение роли пользователя</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {selectedUser && `Изменить роль пользователя ${selectedUser.first_name} ${selectedUser.last_name}`}
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Роль</InputLabel>
            <Select
              labelId="role-select-label"
              value={selectedRole}
              label="Роль"
              onChange={handleRoleChange}
            >
              <MenuItem value="user">Пользователь</MenuItem>
              <MenuItem value="moderator">Модератор</MenuItem>
              <MenuItem value="admin">Администратор</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog} color="inherit" disabled={processingAction}>
            Отмена
          </Button>
          <Button 
            onClick={handleUpdateRole} 
            color="primary" 
            variant="contained" 
            disabled={processingAction || !selectedRole}
          >
            {processingAction ? <CircularProgress size={24} color="inherit" /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<AdminCompany | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<number | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const fetchingRef = React.useRef(false);
  const theme = useTheme();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<AdminCreateCompanyRequest>({
    name: '',
    logo: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    size: 'small',
    city_id: 0,
    industries: [],
  });

  const sizes = [
    { value: 'small', label: 'Малый (до 50 сотрудников)' },
    { value: 'medium', label: 'Средний (50-250 сотрудников)' },
    { value: 'large', label: 'Крупный (250-1000 сотрудников)' },
    { value: 'enterprise', label: 'Корпорация (более 1000 сотрудников)' },
  ];

  useEffect(() => {
    const fetchCompanies = async () => {
      if (fetchingRef.current) return;
      
      try {
        fetchingRef.current = true;
        setLoading(true);
        const response = await AdminApi.getCompanies(page + 1, rowsPerPage);
        
        const adaptedCompanies = response.data.companies.map(item => {
          if (item.company) {
            return {
              id: item.company.id,
              name: item.company.name,
              logo: item.company.logo,
              address: item.company.address,
              phone: item.company.phone,
              email: item.company.email,
              website: item.company.website,
              size: item.company.size,
              city_id: item.company.city_id,
              industries: item.industries?.map(i => i.id) || [],
              created_at: item.company.created_at,
              updated_at: item.company.updated_at
            };
          }
          return null;
        }).filter(Boolean) as AdminCompany[];
        
        setCompanies(adaptedCompanies);
        setTotal(response.data.pagination.total);
      } catch (error) {
        console.error('Ошибка при загрузке компаний:', error);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchCompanies();
  }, [page, rowsPerPage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citiesResponse, industriesResponse] = await Promise.all([
          CityApi.getCities(1, 100),
          IndustryApi.getIndustries(1, 100)
        ]);
        
        setCities(citiesResponse.data.cities);
        setIndustries(industriesResponse.data.industries);
      } catch (error) {
        console.error('Ошибка при загрузке справочников:', error);
      }
    };

    fetchData();
  }, []);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string | number | number[]>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleIndustriesChange = (event: SelectChangeEvent<number[]>) => {
    setFormData((prev) => ({ ...prev, industries: event.target.value as number[] }));
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      name: '',
      logo: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      size: 'small',
      city_id: 0,
      industries: [],
    });
    setCurrentCompany(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = async (id: number) => {
    try {
      setLoading(true);
      const response = await AdminApi.getCompany(id);
      
      const companyData = response.data.company;
      const industriesData = response.data.industries;
      
      setFormData({
        name: companyData.name,
        logo: companyData.logo || '',
        address: companyData.address || '',
        phone: companyData.phone || '',
        email: companyData.email || '',
        website: companyData.website || '',
        size: companyData.size || 'small',
        city_id: companyData.city_id || 0,
        industries: industriesData.map(ind => ind.id) || [],
      });
      
      setCurrentCompany({
        id: companyData.id,
        name: companyData.name,
        logo: companyData.logo,
        address: companyData.address,
        phone: companyData.phone,
        email: companyData.email,
        website: companyData.website,
        size: companyData.size,
        city_id: companyData.city_id,
        industries: industriesData.map(ind => ind.id),
        created_at: companyData.created_at,
        updated_at: companyData.updated_at
      });
      
      setOpenDialog(true);
    } catch (error) {
      console.error('Ошибка при загрузке данных компании:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSaveCompany = async () => {
    try {
      setLoading(true);
      
      if (currentCompany) {
        await AdminApi.updateCompany(currentCompany.id, formData);
        setSuccessMessage('Компания успешно обновлена');
      } else {
        await AdminApi.createCompany(formData);
        setSuccessMessage('Компания успешно создана');
      }
      
      const response = await AdminApi.getCompanies(page + 1, rowsPerPage);
      const adaptedCompanies = response.data.companies.map(item => {
        if (item.company) {
          return {
            id: item.company.id,
            name: item.company.name,
            logo: item.company.logo,
            address: item.company.address,
            phone: item.company.phone,
            email: item.company.email,
            website: item.company.website,
            size: item.company.size,
            city_id: item.company.city_id,
            industries: item.industries?.map(i => i.id) || [],
            created_at: item.company.created_at,
            updated_at: item.company.updated_at
          };
        }
        return null;
      }).filter(Boolean) as AdminCompany[];
      
      setCompanies(adaptedCompanies);
      setTotal(response.data.pagination.total);
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Ошибка при сохранении компании:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (id: number) => {
    setCompanyToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCompanyToDelete(null);
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    
    try {
      setLoading(true);
      await AdminApi.deleteCompany(companyToDelete);
      
      const response = await AdminApi.getCompanies(page + 1, rowsPerPage);
      const adaptedCompanies = response.data.companies.map(item => {
        if (item.company) {
          return {
            id: item.company.id,
            name: item.company.name,
            logo: item.company.logo,
            address: item.company.address,
            phone: item.company.phone,
            email: item.company.email,
            website: item.company.website,
            size: item.company.size,
            city_id: item.company.city_id,
            industries: item.industries?.map(i => i.id) || [],
            created_at: item.company.created_at,
            updated_at: item.company.updated_at
          };
        }
        return null;
      }).filter(Boolean) as AdminCompany[];
      
      setCompanies(adaptedCompanies);
      setTotal(response.data.pagination.total);
      
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Ошибка при удалении компании:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={500}>
          Управление компаниями
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpenCreateDialog}
        >
          Добавить компанию
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3 }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader className="admin-table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Размер</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && !companies.length ? (
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={`skeleton-company-row-${index}`}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                  </TableRow>
                ))
              ) : (
                companies.map((company) => (
                  <TableRow key={`company-row-${company.id}`} hover>
                    <TableCell>{company.id}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {company.logo ? (
                          <Avatar 
                            className="admin-avatar"
                            src={company.logo}
                            alt={company.name}
                            sx={{ mr: 2, width: 32, height: 32 }}
                          />
                        ) : (
                          <Avatar 
                            className="admin-avatar"
                            sx={{ 
                              mr: 2, 
                              width: 32, 
                              height: 32,
                              bgcolor: theme.palette.primary.main
                            }}
                          >
                            <BusinessIcon fontSize="small" />
                          </Avatar>
                        )}
                        {company.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={sizes.find(s => s.value === company.size)?.label || company.size} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{company.email || '—'}</TableCell>
                    <TableCell>{company.phone || '—'}</TableCell>
                    <TableCell>{new Date(company.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary" 
                        onClick={() => handleOpenEditDialog(company.id)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(company.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!loading && companies.length === 0 && (
                <TableRow key="empty-company-row">
                  <TableCell colSpan={7} align="center">
                    <Typography color="textSecondary" sx={{ py: 3 }}>
                      Компании не найдены
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        />
      </Paper>

      {/* Диалог создания/редактирования */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentCompany ? `Редактирование компании: ${currentCompany.name}` : 'Создание новой компании'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Название компании"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="logo"
                label="URL логотипа"
                value={formData.logo}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="https://example.com/logo.png"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="city-label">Город</InputLabel>
                <Select
                  labelId="city-label"
                  name="city_id"
                  value={formData.city_id}
                  onChange={(e: SelectChangeEvent<number>) => {
                    setFormData(prev => ({ ...prev, city_id: e.target.value as number }));
                  }}
                  label="Город"
                  required
                >
                  <MenuItem value={0} disabled>Выберите город</MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id}>
                      {city.name}, {city.region}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="size-label">Размер компании</InputLabel>
                <Select
                  labelId="size-label"
                  name="size"
                  value={formData.size}
                  onChange={(e: SelectChangeEvent<string>) => {
                    setFormData(prev => ({ ...prev, size: e.target.value as 'small' | 'medium' | 'large' | 'enterprise' }));
                  }}
                  label="Размер компании"
                >
                  {sizes.map((size) => (
                    <MenuItem key={size.value} value={size.value}>
                      {size.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="industries-label">Отрасли</InputLabel>
                <Select
                  labelId="industries-label"
                  multiple
                  value={formData.industries}
                  onChange={handleIndustriesChange}
                  label="Отрасли"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as number[]).map((value) => {
                        const industry = industries.find(i => i.id === value);
                        return (
                          <Chip 
                            key={`selected-industry-${value}-${industry?.id || 'unknown'}`} 
                            label={industry?.name} 
                            size="small"
                            style={{ 
                              backgroundColor: industry?.color || theme.palette.primary.main,
                              color: '#fff'
                            }}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {industries.map((industry) => (
                    <MenuItem key={industry.id} value={industry.id}>
                      <Box
                        component="span"
                        sx={{
                          width: 14,
                          height: 14,
                          mr: 1,
                          display: 'inline-block',
                          bgcolor: industry.color || theme.palette.primary.main,
                          borderRadius: '50%',
                        }}
                      />
                      {industry.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="phone"
                label="Телефон"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                margin="normal"
                helperText="Например: 74951234567"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="website"
                label="Веб-сайт"
                value={formData.website}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="https://example.com"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="address"
                label="Адрес"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handleSaveCompany} 
            variant="contained" 
            disabled={loading || !formData.name || !formData.city_id}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить эту компанию? Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteCompany} 
            color="error" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface ReviewsProps {
  updatePendingReviewsCount?: () => Promise<void>;
}

const Reviews: React.FC<ReviewsProps> = ({ updatePendingReviewsCount }) => {
  const [reviews, setReviews] = useState<AdminReviewDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedReview, setSelectedReview] = useState<AdminReviewDetail | null>(null);
  const [moderationDialog, setModerationDialog] = useState(false);
  const [moderationComment, setModerationComment] = useState('');
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | 'view' | null>(null);
  const [processingModeration, setProcessingModeration] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('pending');
  const theme = useTheme();
  const fetchingRef = React.useRef(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (fetchingRef.current) return;

      try {
        fetchingRef.current = true;
        setLoading(true);
        let response;
        
        if (reviewStatus === 'pending') {
          response = await AdminApi.getPendingReviews(page + 1, rowsPerPage);
        } else if (reviewStatus === 'approved') {
          response = await AdminApi.getApprovedReviews(page + 1, rowsPerPage);
        } else if (reviewStatus === 'rejected') {
          response = await AdminApi.getRejectedReviews(page + 1, rowsPerPage);
        } else {
          response = await AdminApi.getPendingReviews(page + 1, rowsPerPage);
        }
        
        setReviews(response.data.reviews);
        setTotal(response.data.pagination.total);
      } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchReviews();
  }, [page, rowsPerPage, reviewStatus]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeStatus = (event: SelectChangeEvent) => {
    setReviewStatus(event.target.value);
    setPage(0);
  };

  const handleOpenModerationDialog = (review: AdminReviewDetail, action: 'approve' | 'reject' | 'view') => {
    setSelectedReview(review);
    setModerationAction(action);
    setModerationComment('');
    setModerationDialog(true);
  };

  const handleCloseModerationDialog = () => {
    setModerationDialog(false);
    setSelectedReview(null);
    setModerationAction(null);
    setModerationComment('');
  };

  const handleModerateReview = async () => {
    if (!selectedReview || !moderationAction || moderationAction === 'view') return;

    const moderationData: ModerationAction = {
      moderation_comment: moderationComment,
      status: moderationAction === 'approve' ? 'approved' : 'rejected'
    };

    setProcessingModeration(true);

    try {
      if (moderationAction === 'approve') {
        await AdminApi.approveReview(selectedReview.review.id, moderationData);
        setSuccessMessage('Отзыв успешно одобрен');
      } else {
        await AdminApi.rejectReview(selectedReview.review.id, moderationData);
        setSuccessMessage('Отзыв успешно отклонен');
      }

      let response;
      if (reviewStatus === 'pending') {
        response = await AdminApi.getPendingReviews(page + 1, rowsPerPage);
      } else if (reviewStatus === 'approved') {
        response = await AdminApi.getApprovedReviews(page + 1, rowsPerPage);
      } else if (reviewStatus === 'rejected') {
        response = await AdminApi.getRejectedReviews(page + 1, rowsPerPage);
      } else {
        response = await AdminApi.getPendingReviews(page + 1, rowsPerPage);
      }
      
      setReviews(response.data.reviews);
      setTotal(response.data.pagination.total);

      if (updatePendingReviewsCount) {
        await updatePendingReviewsCount();
      }

      handleCloseModerationDialog();
    } catch (error) {
      console.error('Ошибка при модерации отзыва:', error);
    } finally {
      setProcessingModeration(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Скрываем сообщение об успехе через 3 секунды
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <Box>
      <Typography variant="h4" mb={4} fontWeight={500}>
        Управление отзывами
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="status-select-label">Статус отзывов</InputLabel>
          <Select
            labelId="status-select-label"
            id="status-select"
            value={reviewStatus}
            label="Статус отзывов"
            onChange={handleChangeStatus}
          >
            <MenuItem value="pending">Ожидают модерации</MenuItem>
            <MenuItem value="approved">Одобренные</MenuItem>
            <MenuItem value="rejected">Отклоненные</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3 }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader className="admin-table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Компания</TableCell>
                <TableCell>Должность</TableCell>
                <TableCell>Рейтинг</TableCell>
                <TableCell>Город</TableCell>
                <TableCell>Плюсы</TableCell>
                <TableCell>Минусы</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={`skeleton-row-${index}`}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                  </TableRow>
                ))
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body1" py={3}>
                      {reviewStatus === 'pending' 
                        ? 'Отзывов, ожидающих модерации, не найдено' 
                        : reviewStatus === 'approved' 
                          ? 'Одобренных отзывов не найдено' 
                          : 'Отклоненных отзывов не найдено'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.review.id} hover>
                    <TableCell>{review.review.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {review.company.company.logo ? (
                          <Avatar
                            src={review.company.company.logo}
                            sx={{ width: 32, height: 32 }}
                            variant="rounded"
                          />
                        ) : (
                          <Avatar
                            sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}
                            variant="rounded"
                          >
                            {review.company.company.name.charAt(0)}
                          </Avatar>
                        )}
                        <Typography variant="body2">{review.company.company.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{review.review.position}</TableCell>
                    <TableCell>
                      <Rating value={review.review.rating} readOnly precision={0.5} size="small" />
                    </TableCell>
                    <TableCell>{review.city.name}</TableCell>
                    <TableCell>
                      <Tooltip title={review.review.pros}>
                        <Typography variant="body2">{truncateText(review.review.pros, 50)}</Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={review.review.cons}>
                        <Typography variant="body2">{truncateText(review.review.cons, 50)}</Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{formatDate(review.review.created_at)}</TableCell>
                    <TableCell>
                      {reviewStatus === 'pending' ? (
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleOpenModerationDialog(review, 'approve')}
                          >
                            Одобрить
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleOpenModerationDialog(review, 'reject')}
                          >
                            Отклонить
                          </Button>
                        </Stack>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenModerationDialog(review, 'view')}
                        >
                          Просмотр
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} из ${count}`
          }
        />
      </Paper>

      {/* Диалог модерации */}
      <Dialog open={moderationDialog} onClose={handleCloseModerationDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {moderationAction === 'approve' 
            ? 'Одобрить отзыв' 
            : moderationAction === 'reject' 
              ? 'Отклонить отзыв' 
              : 'Просмотр отзыва'}
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Компания: {selectedReview.company.company.name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Должность: {selectedReview.review.position}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Рейтинг: <Rating value={selectedReview.review.rating} readOnly precision={0.5} size="small" />
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Город: {selectedReview.city.name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Тип занятости: {selectedReview.employment_type.name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Период работы: {selectedReview.employment_period.name}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Плюсы:
              </Typography>
              <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedReview.review.pros}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Минусы:
              </Typography>
              <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedReview.review.cons}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Оценки по категориям:
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {selectedReview.category_ratings && selectedReview.category_ratings.length > 0 ? (
                  selectedReview.category_ratings.map((category) => (
                    <Grid item xs={12} sm={6} md={4} key={category.category_id}>
                      <Typography variant="body2">
                        {category.category}: <Rating value={category.rating} readOnly precision={0.5} size="small" />
                      </Typography>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Нет оценок по категориям
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {selectedReview.benefits && selectedReview.benefits.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Бенефиты:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {selectedReview.benefits.map((benefit) => (
                      <Chip
                        key={benefit.benefit_type_id}
                        label={benefit.benefit}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </>
              )}

              {reviewStatus === 'pending' && (
                <TextField
                  label="Комментарий модератора"
                  fullWidth
                  multiline
                  rows={3}
                  value={moderationComment}
                  onChange={(e) => setModerationComment(e.target.value)}
                  margin="normal"
                />
              )}

              {reviewStatus !== 'pending' && selectedReview.review.moderation_comment.Valid && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Комментарий модератора:
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedReview.review.moderation_comment.String}
                  </Typography>
                </Box>
              )}

              {reviewStatus !== 'pending' && !selectedReview.review.moderation_comment.Valid && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Комментарий модератора:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Нет комментария
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModerationDialog} disabled={processingModeration}>
            {reviewStatus !== 'pending' ? 'Закрыть' : 'Отмена'}
          </Button>
          {reviewStatus === 'pending' && (
            <Button
              onClick={handleModerateReview}
              color={moderationAction === 'approve' ? 'success' : 'error'}
              variant="contained"
              disabled={processingModeration}
            >
              {processingModeration ? (
                <CircularProgress size={24} color="inherit" />
              ) : moderationAction === 'approve' ? (
                'Одобрить'
              ) : (
                'Отклонить'
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const Settings: React.FC = () => (
  <Box>
    <Typography variant="h4" mb={4} fontWeight={500}>
      Настройки
    </Typography>
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography>Здесь будут настройки сайта</Typography>
    </Paper>
  </Box>
);

interface Suggestion {
  id: number;
  type: 'company' | 'suggestion';
  text: string;
  created_at: string;
}

interface SuggestionsApiResponse {
  success: boolean;
  data: {
    suggestions: Suggestion[];
    total: number;
    page: number;
    limit: number;
  };
}

interface DeleteApiResponse {
  success: boolean;
  message?: string;
}

const Suggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingSuggestionId, setDeletingSuggestionId] = useState<number | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await httpClient.get<SuggestionsApiResponse>('/suggestions');
      if (response.success && response.data) {
        setSuggestions(response.data.suggestions || []);
        setError('');
      } else {
        setError('Ошибка при загрузке предложений');
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Ошибка при получении предложений:', err);
      setError('Не удалось загрузить предложения');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDeleteDialog = (id: number) => {
    setDeletingSuggestionId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeletingSuggestionId(null);
  };

  const handleDeleteSuggestion = async () => {
    if (!deletingSuggestionId) return;

    try {
      const response = await httpClient.delete<DeleteApiResponse>(`/suggestions/${deletingSuggestionId}`);
      if (response.success) {
        setSuggestions(suggestions.filter(suggestion => suggestion.id !== deletingSuggestionId));
        setError('');
      } else {
        setError('Ошибка при удалении предложения');
      }
    } catch (err) {
      console.error('Ошибка при удалении предложения:', err);
      setError('Не удалось удалить предложение');
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleOpenDetailDialog = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedSuggestion(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      <Typography variant="h4" mb={4} fontWeight={500}>
        Предложения пользователей
      </Typography>
      
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 3 }}>
            {error}
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell>Текст</TableCell>
                  <TableCell>Дата создания</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suggestions.length > 0 ? (
                  suggestions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((suggestion) => (
                      <TableRow key={suggestion.id}>
                        <TableCell>{suggestion.id}</TableCell>
                        <TableCell>
                          <Chip
                            label={suggestion.type === 'company' ? 'Компания' : 'Идея'}
                            color={suggestion.type === 'company' ? 'primary' : 'info'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {suggestion.text.length > 50 
                            ? `${suggestion.text.substring(0, 50)}...` 
                            : suggestion.text}
                        </TableCell>
                        <TableCell>{formatDate(suggestion.created_at)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Просмотреть подробности">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleOpenDetailDialog(suggestion)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Удалить">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleOpenDeleteDialog(suggestion.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Предложений пока нет
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={suggestions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Строк на странице:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} из ${count}`
              }
            />
          </TableContainer>
        )}
      </Paper>

      {/* Диалог подтверждения удаления */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Удаление предложения</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить это предложение? Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Отмена</Button>
          <Button onClick={handleDeleteSuggestion} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог просмотра деталей */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Детали предложения
          <IconButton
            aria-label="close"
            onClick={handleCloseDetailDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedSuggestion && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                  label={selectedSuggestion.type === 'company' ? 'Компания' : 'Идея'}
                  color={selectedSuggestion.type === 'company' ? 'primary' : 'info'}
                  sx={{ mr: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Создано: {formatDate(selectedSuggestion.created_at)}
                </Typography>
              </Box>
              <Typography variant="h6" gutterBottom>
                Содержание:
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, borderRadius: 2, backgroundColor: '#f9f9f9' }}
              >
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedSuggestion.text}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Закрыть</Button>
          {selectedSuggestion && (
            <Button
              color="error"
              variant="outlined"
              onClick={() => {
                handleCloseDetailDialog();
                handleOpenDeleteDialog(selectedSuggestion.id);
              }}
              startIcon={<DeleteIcon />}
            >
              Удалить
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { activeSection, setActiveSection } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

  const updatePendingReviewsCount = async () => {
    try {
      const response = await AdminApi.getStatistics();
      setPendingReviewsCount(response.data.pending_reviews);
    } catch (error) {
      console.error('Ошибка при получении количества отзывов на модерации:', error);
    }
  };

  const sections = [
    { id: 'dashboard', text: 'Дашборд', icon: <DashboardIcon />, component: <Dashboard /> },
    { id: 'users', text: 'Пользователи', icon: <PeopleIcon />, component: <Users /> },
    { id: 'companies', text: 'Компании', icon: <BusinessIcon />, component: <Companies /> },
    { 
      id: 'reviews', 
      text: 'Отзывы', 
      icon: <AssignmentIcon />, 
      component: <Reviews updatePendingReviewsCount={updatePendingReviewsCount} />, 
      badge: pendingReviewsCount 
    },
    { id: 'suggestions', text: 'Предложения', icon: <LightbulbIcon />, component: <Suggestions /> },
    { id: 'settings', text: 'Настройки', icon: <SettingsIcon />, component: <Settings /> }
  ];

  useEffect(() => {
    updatePendingReviewsCount();

    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];

    const sectionExists = sections.some(section => section.id === lastPart);

    if (sectionExists) {
      setActiveSection(lastPart);
    } else if (pathParts.length === 2 && pathParts[1] === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [location, setActiveSection, navigate]);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileOpen(false);
    navigate(`/admin/${sectionId}`);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const currentSection = sections.find(section => section.id === activeSection) || sections[0];

  const drawer = (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: theme.palette.primary.main
          }}
        >
          JobSolution
        </Typography>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{ display: { sm: 'none' } }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Typography
        variant="subtitle2"
        sx={{
          ml: 2,
          mb: 1,
          color: theme.palette.text.secondary,
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.5px'
        }}
      >
        Главное меню
      </Typography>

      <List sx={{ px: 1, flexGrow: 1 }}>
        {sections.map((section) => (
          <SidebarItem
            key={section.id}
            icon={section.icon}
            text={section.text}
            active={activeSection === section.id}
            to={`/admin/${section.id}`}
            onClick={() => handleSectionChange(section.id)}
            badge={section.badge}
          />
        ))}
      </List>

      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 2025 JobSolution Admin
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: alpha(theme.palette.primary.main, 0.03), minHeight: '100vh' }} className="admin-page">
      {/* Мобильный drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRadius: 0
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Десктопный drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            border: 'none',
            boxShadow: 1,
            bgcolor: 'background.paper'
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Основной контент */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          maxWidth: '100%',
          marginLeft: { sm: `${drawerWidth}px` }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            py: 1
          }}
        >
          <IconButton
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 40,
                height: 40
              }}
            >
              {user?.first_name?.charAt(0) || 'A'}
            </Avatar>
            <Box>
              <Typography variant="subtitle2">
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Администратор
              </Typography>
            </Box>
          </Box>
        </Box>

        <Container maxWidth="xl" sx={{ py: 3 }}>
          {currentSection.component}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminPage; 