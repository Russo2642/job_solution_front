import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Pagination,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../entities/auth/context/AuthContext';
import { CityApi } from '../shared/api/cities';
import { CompanyApi, CreateCompanyRequest } from '../shared/api/companies';
import { IndustryApi } from '../shared/api/industries';
import { ReviewApi, ModerationAction } from '../shared/api/reviews';
import { City, Industry } from '../shared/types';

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

const CompanyName: React.FC<{ companyId: number }> = ({ companyId }) => {
  const [companyName, setCompanyName] = useState<string>(`Компания ID: ${companyId}`);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await CompanyApi.getCompanies({
          page: 1,
          limit: 100
        });
        
        const company = response.data.companies.find(c => c.id === companyId);
        if (company) {
          setCompanyName(company.name);
        }
      } catch (error) {
        console.error('Ошибка при загрузке информации о компании:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [companyId]);

  if (loading) {
    return <span>Загрузка информации о компании...</span>;
  }

  return <span>{companyName}</span>;
};

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
        const industriesResponse = await IndustryApi.getIndustries(1, 100);
        setIndustries(industriesResponse.data.industries);

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

    if (!formData.name || !formData.city_id || formData.industries.length === 0) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await CompanyApi.createCompany(formData);
      setSuccess(true);

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

const ManageReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [moderationComment, setModerationComment] = useState<string>('');
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchPendingReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ReviewApi.getPendingReviews(page, limit);
      setReviews(response.data.reviews);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка при загрузке отзывов');
      }
      console.error('Error fetching pending reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchPendingReviews();
  }, [page, limit, fetchPendingReviews]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleOpenDialog = (reviewId: number, action: 'approve' | 'reject') => {
    setSelectedReviewId(reviewId);
    setDialogAction(action);
    setModerationComment('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedReviewId(null);
  };

  const handleModerationAction = async () => {
    if (!selectedReviewId) return;
    
    setLoading(true);
    
    const moderationData: ModerationAction = {
      moderation_comment: moderationComment,
      status: dialogAction === 'approve' ? 'approved' : 'rejected'
    };
    
    try {
      if (dialogAction === 'approve') {
        await ReviewApi.approveReview(selectedReviewId, moderationData);
        setSuccessMessage('Отзыв успешно одобрен');
      } else {
        await ReviewApi.rejectReview(selectedReviewId, moderationData);
        setSuccessMessage('Отзыв успешно отклонен');
      }
      
      setSuccess(true);
      handleCloseDialog();
      fetchPendingReviews();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Произошла ошибка при ${dialogAction === 'approve' ? 'одобрении' : 'отклонении'} отзыва`);
      }
      console.error('Error moderating review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  const renderRating = (rating: number | undefined) => {
    const safeRating = typeof rating === 'number' ? rating : 0;
    
    return (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={`star-${index}`}
            style={{
              color: index < safeRating ? '#1976d2' : '#bdbdbd',
              fontSize: '1.2rem',
            }}
          >
            ★
          </span>
        ))}
        <span style={{ marginLeft: '8px' }}>
          {safeRating.toFixed(1)}
        </span>
      </span>
    );
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Модерация отзывов
      </Typography>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {!loading && reviews.length === 0 && (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Нет отзывов, ожидающих модерации
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <AssignmentIcon sx={{ fontSize: 100, color: 'text.disabled' }} />
          </Box>
        </Box>
      )}
      
      {reviews.length > 0 && (
        <>
          {reviews.map((review) => (
            <Paper key={review.review?.id || review.id} sx={{ p: 3, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    {review.company?.company?.name || review.company_name || review.company?.name ? (
                      <Typography variant="h6">
                        {review.company?.company?.name || review.company_name || review.company?.name}
                      </Typography>
                    ) : review.review?.company_id ? (
                      <Typography variant="h6">
                        <CompanyName companyId={review.review.company_id} />
                      </Typography>
                    ) : (
                      <Typography variant="h6">Компания не указана</Typography>
                    )}
                    {renderRating(review.review?.rating || review.average_rating)}
                  </Box>
                  <Typography variant="subtitle1" color="text.secondary">
                    {review.review?.position || review.position || 'Должность не указана'}
                  </Typography>
                  
                  {/* Отображение индустрий компании */}
                  {review.company?.industries && review.company.industries.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, mt: 1 }}>
                      {review.company.industries.map((industry: { id: number; name: string; color?: string }) => (
                        <Chip 
                          key={`industry-${industry.id}`}
                          label={industry.name}
                          size="small"
                          style={{ 
                            backgroundColor: industry.color || '#ccc',
                            color: '#fff'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={review.review?.is_former_employee || review.is_former_employee ? 'Бывший сотрудник' : 'Текущий сотрудник'} 
                      size="small" 
                      color={review.review?.is_former_employee || review.is_former_employee ? 'default' : 'primary'} 
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={review.review?.is_recommended || review.is_recommended ? 'Рекомендует' : 'Не рекомендует'} 
                      size="small" 
                      color={review.review?.is_recommended || review.is_recommended ? 'success' : 'error'} 
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                    Плюсы:
                  </Typography>
                  <Typography variant="body1">
                    {review.review?.pros || review.pros || 'Не указаны'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" color="error.main">
                    Минусы:
                  </Typography>
                  <Typography variant="body1">
                    {review.review?.cons || review.cons || 'Не указаны'}
                  </Typography>
                </Grid>
                
                {/* Отображение категорий рейтингов */}
                {Array.isArray(review.category_ratings) && review.category_ratings.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                      Оценки по категориям:
                    </Typography>
                    <Grid container spacing={1}>
                      {review.category_ratings.map((category: { category_id?: number; category: string; rating: number }) => (
                        <Grid item xs={6} sm={4} key={category.category_id || category.category}>
                          <Typography variant="body2" color="text.secondary">
                            {category.category}: <span>{renderRating(category.rating)}</span>
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                )}
                
                {/* Отображение преимуществ */}
                {Array.isArray(review.benefits) && review.benefits.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                      Преимущества:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {review.benefits.map((benefit: { benefit_type_id?: number; benefit: string }) => (
                        <Chip 
                          key={`benefit-${benefit.benefit_type_id || benefit.benefit}`}
                          label={benefit.benefit}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
                
                <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={() => handleOpenDialog(review.review?.id || review.id, 'reject')}
                    startIcon={<ClearIcon />}
                  >
                    Отклонить
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => handleOpenDialog(review.review?.id || review.id, 'approve')}
                    startIcon={<CheckIcon />}
                  >
                    Одобрить
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          ))}
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
      
      {/* Диалог для подтверждения модерации */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogAction === 'approve' ? 'Одобрение отзыва' : 'Отклонение отзыва'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogAction === 'approve' 
              ? 'Вы уверены, что хотите одобрить этот отзыв?' 
              : 'Вы уверены, что хотите отклонить этот отзыв?'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="comment"
            label="Комментарий модератора"
            type="text"
            fullWidth
            variant="outlined"
            value={moderationComment}
            onChange={(e) => setModerationComment(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handleModerationAction} 
            color={dialogAction === 'approve' ? 'primary' : 'error'}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Обработка...' : dialogAction === 'approve' ? 'Одобрить' : 'Отклонить'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Снэкбар для уведомлений */}
      <Snackbar key="error-snackbar" open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar key="success-snackbar" open={success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
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

const AdminPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
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