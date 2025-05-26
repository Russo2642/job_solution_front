import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  Chip, 
  OutlinedInput, 
  Snackbar, 
  Alert, 
  Paper,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { CompanyApi, CreateCompanyRequest } from '../shared/api/companies';
import { IndustryApi } from '../shared/api/industries';
import { CityApi } from '../shared/api/cities';
import { Industry, City } from '../shared/types';
import { useAuth } from '../entities/auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const companySizes = [
  { value: 'small', label: 'Малый бизнес (до 50 сотрудников)' },
  { value: 'medium', label: 'Средний бизнес (50-250 сотрудников)' },
  { value: 'large', label: 'Крупный бизнес (250-1000 сотрудников)' },
  { value: 'enterprise', label: 'Корпорация (более 1000 сотрудников)' },
];

// Компонент для создания компании
const CreateCompanyForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateCompanyRequest>({
    name: '',
    address: '',
    city_id: 0,
    email: '',
    industries: [],
    logo: '',
    phone: '',
    size: 'small',
    website: '',
  });

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Загрузка списка индустрий
        const industriesResponse = await IndustryApi.getIndustries(1, 100);
        setIndustries(industriesResponse.data.industries);

        // Загрузка списка городов
        const citiesResponse = await CityApi.getCities(1, 100);
        setCities(citiesResponse.data.cities);
      } catch (err) {
        setError('Ошибка при загрузке данных');
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSizeChange = (e: SelectChangeEvent<string>) => {
    setFormData({
      ...formData,
      size: e.target.value as 'small' | 'medium' | 'large' | 'enterprise',
    });
  };

  const handleCityChange = (e: SelectChangeEvent<number>) => {
    setFormData({
      ...formData,
      city_id: e.target.value as number,
    });
  };

  const handleIndustriesChange = (event: SelectChangeEvent<number[]>) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      industries: typeof value === 'string' ? [Number(value)] : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Базовая валидация
    if (!formData.name || !formData.city_id || formData.industries.length === 0) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await CompanyApi.createCompany(formData);
      setSuccess(true);
      
      // Сбросить форму
      setFormData({
        name: '',
        address: '',
        city_id: 0,
        email: '',
        industries: [],
        logo: '',
        phone: '',
        size: 'small',
        website: '',
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при создании компании');
      }
      console.error('Error creating company:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Название компании"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Логотип (URL)"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel id="city-label">Город</InputLabel>
              <Select
                labelId="city-label"
                id="city"
                value={formData.city_id || ''}
                onChange={handleCityChange}
                label="Город"
              >
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}, {city.region}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="size-label">Размер компании</InputLabel>
              <Select
                labelId="size-label"
                id="size"
                value={formData.size}
                onChange={handleSizeChange}
                label="Размер компании"
              >
                {companySizes.map((size) => (
                  <MenuItem key={size.value} value={size.value}>
                    {size.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel id="industries-label">Индустрии</InputLabel>
              <Select
                labelId="industries-label"
                id="industries"
                multiple
                value={formData.industries}
                onChange={handleIndustriesChange}
                input={<OutlinedInput id="industries-chip" label="Индустрии" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const industry = industries.find(i => i.id === value);
                      return (
                        <Chip 
                          key={value} 
                          label={industry?.name} 
                          style={{ 
                            backgroundColor: industry?.color,
                            color: industry?.textColor || '#fff'
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
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
                        bgcolor: industry.color || '#ccc',
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
              fullWidth
              label="Телефон"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 (XXX) XXX-XX-XX"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Адрес"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Веб-сайт"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать компанию'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Компания успешно создана!
        </Alert>
      </Snackbar>
    </>
  );
};

// Компонент для управления компаниями (заглушка для будущего функционала)
const ManageCompanies: React.FC = () => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Управление компаниями
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Здесь будет список компаний с возможностью редактирования и удаления.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <BusinessIcon sx={{ fontSize: 100, color: 'text.disabled' }} />
      </Box>
    </Box>
  );
};

// Компонент для управления отзывами (заглушка для будущего функционала)
const ManageReviews: React.FC = () => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Управление отзывами
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Здесь будет список отзывов с возможностью модерации.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <AssignmentIcon sx={{ fontSize: 100, color: 'text.disabled' }} />
      </Box>
    </Box>
  );
};

// Компонент для управления пользователями (заглушка для будущего функционала)
const ManageUsers: React.FC = () => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Управление пользователями
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Здесь будет список пользователей с возможностью управления правами.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <PeopleIcon sx={{ fontSize: 100, color: 'text.disabled' }} />
      </Box>
    </Box>
  );
};

// Компонент для настроек сайта (заглушка для будущего функционала)
const SiteSettings: React.FC = () => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Настройки сайта
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Здесь будут настройки сайта.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <SettingsIcon sx={{ fontSize: 100, color: 'text.disabled' }} />
      </Box>
    </Box>
  );
};

// Компонент дашборда (заглушка для будущего функционала)
const Dashboard: React.FC = () => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Дашборд
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                142
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего компаний
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                1,245
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего отзывов
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                548
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Всего пользователей
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <DashboardIcon sx={{ fontSize: 100, color: 'text.disabled' }} />
      </Box>
    </Box>
  );
};

// Главный компонент административной панели
const AdminPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    // Проверка доступа админа
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const renderSection = () => {
    switch (activeSection) {
      case 'create-company':
        return (
          <>
            <Typography variant="h5" component="h2" gutterBottom>
              Создание новой компании
            </Typography>
            <CreateCompanyForm />
          </>
        );
      case 'manage-companies':
        return <ManageCompanies />;
      case 'manage-reviews':
        return <ManageReviews />;
      case 'manage-users':
        return <ManageUsers />;
      case 'settings':
        return <SiteSettings />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  const menuItems = [
    { id: 'dashboard', text: 'Дашборд', icon: <DashboardIcon /> },
    { id: 'create-company', text: 'Создать компанию', icon: <BusinessIcon /> },
    { id: 'manage-companies', text: 'Управление компаниями', icon: <BusinessIcon /> },
    { id: 'manage-reviews', text: 'Управление отзывами', icon: <AssignmentIcon /> },
    { id: 'manage-users', text: 'Управление пользователями', icon: <PeopleIcon /> },
    { id: 'settings', text: 'Настройки сайта', icon: <SettingsIcon /> },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 0, mb: 4 }}>
        <Grid container>
          {/* Боковое меню */}
          <Grid item xs={12} md={3} sx={{ borderRight: '1px solid #e0e0e0' }}>
            <Box sx={{ py: 2, px: 1 }}>
              <Typography variant="h6" sx={{ px: 2, mb: 2 }}>
                Панель администратора
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List component="nav">
                {menuItems.map((item) => (
                  <ListItem 
                    button 
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    selected={activeSection === item.id}
                    sx={{ 
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        }
                      }
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>
          
          {/* Основное содержимое */}
          <Grid item xs={12} md={9}>
            <Box sx={{ p: 3 }}>
              {renderSection()}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AdminPage; 