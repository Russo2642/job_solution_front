import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import InfoIcon from '@mui/icons-material/Info'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Rating,
  Select,
  SelectChangeEvent,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../entities/auth/context/AuthContext'
import { City, CompanyWithDetails } from '../entities/company/types'
import { ReviewFormData } from '../entities/review/types'
import { CompanyApi, ReviewApi, CityApi, httpClient, ApiClient } from '../shared/api'
import { LoadingIndicator, Seo } from '../shared/components'

interface ApiResponse<T> {
  data: T;
  success: boolean;
}

interface RatingCategoriesResponse {
  categories: RatingCategory[];
}

interface BenefitTypesResponse {
  benefit_types: BenefitType[];
}

interface EmploymentPeriodsResponse {
  employment_periods: EmploymentPeriod[];
}

interface EmploymentTypesResponse {
  employment_types: EmploymentType[];
}

interface RatingCategory {
  id: number;
  name: string;
  description: string;
}

interface BenefitType {
  id: number;
  name: string;
  description: string;
}

interface EmploymentPeriod {
  id: number;
  name: string;
  description: string;
}

interface EmploymentType {
  id: number;
  name: string;
  description: string;
}

interface ReviewFormState {
  companyId: string;
  position: string;
  isFormerEmployee: boolean;
  employmentTerm: string;
  employmentPeriodId: number;
  employment: string;
  employmentTypeId: number;
  location: string;
  cityId: number;
  categoryRatings: { [key: number]: number };
  pros: string;
  cons: string;
  benefitIds: number[];
  is_recommended: boolean;
}

const initialFormData: ReviewFormState = {
  companyId: '',
  position: '',
  isFormerEmployee: false,
  employmentTerm: '',
  employmentPeriodId: 0,
  employment: '',
  employmentTypeId: 0,
  location: '',
  cityId: 0,
  categoryRatings: {},
  pros: '',
  cons: '',
  benefitIds: [],
  is_recommended: false,
}

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 800,
  margin: '0 auto',
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    maxWidth: '95%',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    maxWidth: '100%',
    borderRadius: 8,
  },
}))

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(3),
  },
}))

const FormTitle = styled(Typography)(({ theme }) => ({
  marginBottom: 12,
  fontWeight: 600,
  fontSize: '1.4rem',
  [theme.breakpoints.down('sm')]: {
    marginBottom: 8,
    fontSize: '1.25rem',
  },
}))

const CompanyOption = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: 8,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: 8,
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '10',
  },
  [theme.breakpoints.down('sm')]: {
    padding: 6,
  },
}))

const CompanyLogo = styled('img')(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: theme.shape.borderRadius,
  marginRight: 16,
  [theme.breakpoints.down('sm')]: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
}))

const RatingLabel = styled(FormLabel)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginBottom: 8,
  fontSize: '0.95rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
    marginBottom: 4,
    flexDirection: 'column',
    alignItems: 'flex-start',
    '& .MuiRating-root': {
      marginTop: 8,
    },
  },
}))

const StyledGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  [theme.breakpoints.down('sm')]: {
    gap: 4,
  },
}))

const SuccessDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    maxWidth: 400,
    padding: 16,
    borderRadius: 16,
  }
}));

const SuccessIcon = styled(CheckCircleOutlineIcon)(({ theme }) => ({
  fontSize: 80,
  color: theme.palette.success.main,
  margin: 'auto',
}));

const SuccessTitle = styled(DialogTitle)(() => ({
  textAlign: 'center',
  fontWeight: 600,
  fontSize: '1.4rem',
}));

const SuccessContent = styled(DialogContent)(() => ({
  textAlign: 'center',
}));

const SuccessMessage = styled(Typography)(() => ({
  marginBottom: 12,
  fontSize: '1.1rem',
}));

const AddReviewPage = () => {
  const { companyId } = useParams<{ companyId?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [activeStep, setActiveStep] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [companies, setCompanies] = useState<CompanyWithDetails[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [cities, setCities] = useState<City[]>([])
  const [employmentPeriods, setEmploymentPeriods] = useState<EmploymentPeriod[]>([])
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([])
  const [categories, setCategories] = useState<RatingCategory[]>([])
  const [benefitTypes, setBenefitTypes] = useState<BenefitType[]>([])
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [formData, setFormData] = useState<ReviewFormState>(initialFormData)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [redirectCompanySlug, setRedirectCompanySlug] = useState<string | null>(null)
  const [prosError, setProsError] = useState<string | null>(null)
  const [consError, setConsError] = useState<string | null>(null)
  
  const searchTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const citiesResponse = await CityApi.getCities(1, 100)
        if (citiesResponse.success) {
          setCities(citiesResponse.data.cities)
        }

        const categoriesResponse = await httpClient.get<ApiResponse<RatingCategoriesResponse>>('/rating-categories')
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data.categories)

          const initialRatings: { [key: number]: number } = {}
          categoriesResponse.data.categories.forEach((category: RatingCategory) => {
            initialRatings[category.id] = 0
          })

          setFormData(prev => ({
            ...prev,
            categoryRatings: initialRatings
          }))
        }

        const benefitsResponse = await httpClient.get<ApiResponse<BenefitTypesResponse>>('/benefit-types')
        if (benefitsResponse.success) {
          setBenefitTypes(benefitsResponse.data.benefit_types)
        }

        const periodsResponse = await httpClient.get<ApiResponse<EmploymentPeriodsResponse>>('/employment-periods')
        if (periodsResponse.success) {
          setEmploymentPeriods(periodsResponse.data.employment_periods)
        }

        const typesResponse = await httpClient.get<ApiResponse<EmploymentTypesResponse>>('/employment-types')
        if (typesResponse.success) {
          setEmploymentTypes(typesResponse.data.employment_types)
        }

        const companiesResponse = await CompanyApi.getCompanies({
          limit: 100,
          page: 1
        })
        if (companiesResponse.success) {
          setCompanies(companiesResponse.data.companies)
          setFilteredCompanies(companiesResponse.data.companies)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, navigate, location.pathname])

  useEffect(() => {
    if (companyId) {
      setFormData(prev => ({ ...prev, companyId }))
      setActiveStep(1)
    }
  }, [companyId])

  const handleCompanySelect = (id: string) => {
    setFormData(prev => ({ ...prev, companyId: id }))
    setActiveStep(1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'pros') {
      if (value.length < 10 && value.length > 0) {
        setProsError('Минимальная длина - 10 символов')
      } else {
        setProsError(null)
      }
    }
    
    if (name === 'cons') {
      if (value.length < 10 && value.length > 0) {
        setConsError('Минимальная длина - 10 символов')
      } else {
        setConsError(null)
      }
    }
  }

  const handleRatingChange = (categoryId: number, value: number | null) => {
    setFormData(prev => ({
      ...prev,
      categoryRatings: {
        ...prev.categoryRatings,
        [categoryId]: value || 0
      }
    }))
  }

  const handleBenefitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    const benefitId = parseInt(name)

    if (name === 'isFormerEmployee') {
      setFormData(prev => ({ ...prev, isFormerEmployee: checked }))
    } else {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          benefitIds: [...prev.benefitIds, benefitId]
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          benefitIds: prev.benefitIds.filter(id => id !== benefitId)
        }))
      }
    }
  }

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'is_recommended') {
      setFormData(prev => ({
        ...prev,
        is_recommended: value === '' ? false : value === 'true'
      }));
    } else if (name === "employmentTerm") {
      const selectedPeriod = employmentPeriods.find(p => p.name === value);
      if (selectedPeriod) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          employmentPeriodId: selectedPeriod.id
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleNext = () => {
    setActiveStep(prev => prev + 1)
  }

  const handleCityChange = (e: SelectChangeEvent<number | string>) => {
    const cityId = e.target.value as number
    const city = cities.find(c => c.id === cityId)
    setFormData(prev => ({
      ...prev,
      cityId: cityId,
      location: city ? city.name : ''
    }))
  }

  const handleEmploymentChange = (e: SelectChangeEvent) => {
    const value = e.target.value as string
    const selectedType = employmentTypes.find(t => t.name === value)
    if (selectedType) {
      setFormData(prev => ({
        ...prev,
        employment: value,
        employmentTypeId: selectedType.id
      }))
    } else {
      setFormData(prev => ({ ...prev, employment: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    const selectedCompany = companies.find(company =>
      company.company.id.toString() === formData.companyId
    );

    if (!selectedCompany) {
      setSubmitError('Компания не найдена');
      setSubmitting(false);
      return;
    }

    try {
      await ApiClient.checkAndRefreshToken();
    } catch (e) {
      console.error('Ошибка при проверке токена перед отправкой отзыва:', e);
      setSubmitError('Ошибка авторизации. Пожалуйста, войдите заново.');
      setSubmitting(false);
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
      return;
    }

    const categoryRatingsForApi: { [key: string]: number } = {};
    Object.entries(formData.categoryRatings).forEach(([categoryId, rating]) => {
      if (rating > 0) {
        categoryRatingsForApi[categoryId] = rating;
      }
    });

    const reviewData: ReviewFormData = {
      company_id: parseInt(formData.companyId),
      position: formData.position,
      city_id: formData.cityId,
      pros: formData.pros,
      cons: formData.cons,

      is_former_employee: formData.isFormerEmployee,
      employment_period_id: formData.employmentPeriodId,
      employment_type_id: formData.employmentTypeId,
      benefit_type_ids: formData.benefitIds.slice(0, 3),
      category_ratings: categoryRatingsForApi,
      is_recommended: formData.is_recommended
    };

    try {
      await ReviewApi.createReview(reviewData);

      setRedirectCompanySlug(selectedCompany.company.slug);

      disableFormControls();

      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('Ошибка при создании отзыва:', error);

      let errorMessage = 'Не удалось отправить отзыв. Пожалуйста, попробуйте позже.';

      if (error.message) {
        console.error('Сообщение ошибки:', error.message);
        if (error.message.includes('400')) {
          errorMessage = 'Неверный формат данных. Пожалуйста, проверьте заполнение формы.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Для отправки отзыва необходимо авторизоваться.';
        } else if (error.message.includes('403')) {
          errorMessage = 'У вас нет прав для отправки отзыва.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.';
        }
      }

      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false)
    }
  }

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    if (redirectCompanySlug) {
      navigate(`/company/${redirectCompanySlug}`);
    }
  }

  useEffect(() => {
    let redirectTimer: number | undefined;

    if (showSuccessDialog && redirectCompanySlug) {
      redirectTimer = window.setTimeout(() => {
        setShowSuccessDialog(false);
        navigate(`/company/${redirectCompanySlug}`);
      }, 5000);
    }

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [showSuccessDialog, redirectCompanySlug, navigate]);

  const disableFormControls = () => {
    const formButtons = document.querySelectorAll('button[type="submit"], button[type="button"]');
    formButtons.forEach(button => {
      if (button instanceof HTMLButtonElement) {
        button.disabled = true;
      }
    });

    const formInputs = document.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
      if (input instanceof HTMLElement) {
        (input as HTMLInputElement).disabled = true;
      }
    });
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (searchTimerRef.current !== null) {
      clearTimeout(searchTimerRef.current);
    }

    if (!value.trim()) {
      setFilteredCompanies(companies);
      setIsSearchActive(false);
      setIsSearchLoading(false);
      return;
    }

    setIsSearchLoading(true);
    setIsSearchActive(true);

    searchTimerRef.current = window.setTimeout(() => {
      const searchTerm = value.toLowerCase().trim();
      const filtered = companies.filter(company =>
        company.company.name.toLowerCase().includes(searchTerm)
      );

      setFilteredCompanies(filtered);
      setIsSearchLoading(false);
    }, 1500);
  }

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);

    if (searchTimerRef.current !== null) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }

    setFilteredCompanies(companies);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <FormSection>
            <FormTitle variant="h6">
              Выберите компанию для отзыва
            </FormTitle>
            <Alert 
              severity="info" 
              icon={<InfoIcon />}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              <Typography variant="body2">
                Все отзывы публикуются анонимно. Ваше имя и личные данные не будут раскрыты.
              </Typography>
            </Alert>
            <TextField
              fullWidth
              placeholder="Поиск компании"
              value={searchQuery}
              onChange={handleSearch}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <>
                    {isSearchLoading && searchQuery && (
                      <InputAdornment position="end" sx={{ mr: 1 }}>
                        <CircularProgress size={20} />
                      </InputAdornment>
                    )}
                    {searchQuery && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleClearSearch}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )}
                  </>
                ),
              }}
            />
            <Box mt={2}>
              {loading && !isSearchActive ? (
                <Box display="flex" justifyContent="center" my={3}>
                  <CircularProgress />
                </Box>
              ) : isSearchLoading ? (
                <Box display="flex" justifyContent="center" my={3}>
                  <CircularProgress />
                </Box>
              ) : filteredCompanies.length > 0 ? (
                filteredCompanies.map(companyWithDetails => (
                  <CompanyOption
                    key={companyWithDetails.company.id}
                    className={formData.companyId === companyWithDetails.company.id.toString() ? 'selected' : ''}
                    onClick={() => handleCompanySelect(companyWithDetails.company.id.toString())}
                  >
                    <CompanyLogo
                      src={companyWithDetails.company.logo || 'https://placehold.co/100x100/grey/white?text=' + companyWithDetails.company.name.charAt(0)}
                      alt={companyWithDetails.company.name}
                    />
                    <Typography>{companyWithDetails.company.name}</Typography>
                  </CompanyOption>
                ))
              ) : isSearchActive ? (
                <Typography>По вашему запросу ничего не найдено</Typography>
              ) : (
                <Typography>Выберите компанию из списка</Typography>
              )}
            </Box>
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                Не нашли нужную компанию? <Link to="/suggestions?type=company">Предложить компанию</Link>
              </Typography>
            </Box>
          </FormSection>
        )
      case 1:
        return (
          <>
            <FormSection>
              <FormTitle variant="h6">
                Расскажите о своем опыте работы
              </FormTitle>
              <TextField
                fullWidth
                label="Должность"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                placeholder="Введите вашу должность"
                required
              />
              <FormControl component="fieldset" margin="normal">
                <FormLabel component="legend">Вы текущий или бывший сотрудник?</FormLabel>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isFormerEmployee}
                      onChange={handleBenefitChange}
                      name="isFormerEmployee"
                    />
                  }
                  label="Бывший сотрудник"
                />
              </FormControl>
              <FormControl component="fieldset" margin="normal" fullWidth>
                <FormLabel component="legend">Формат работы</FormLabel>
                {loading ? (
                  <Box display="flex" justifyContent="center" my={3}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Select
                    value={formData.employment}
                    onChange={handleEmploymentChange}
                    variant="outlined"
                    fullWidth
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Выберите формат работы
                    </MenuItem>
                    {employmentTypes.map((option) => (
                      <MenuItem key={option.id} value={option.name}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </FormControl>
              <FormControl component="fieldset" margin="normal" fullWidth>
                <FormLabel component="legend">Стаж работы в компании</FormLabel>
                {loading ? (
                  <Box display="flex" justifyContent="center" my={3}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <RadioGroup
                    row
                    name="employmentTerm"
                    value={formData.employmentTerm}
                    onChange={handleRadioChange}
                  >
                    {employmentPeriods.map((period) => (
                      <FormControlLabel
                        key={period.id}
                        value={period.name}
                        control={<Radio />}
                        label={period.name}
                      />
                    ))}
                  </RadioGroup>
                )}
              </FormControl>
              <FormControl fullWidth margin="normal">
                <FormLabel component="legend">Город</FormLabel>
                <Select
                  value={formData.cityId || ''}
                  onChange={handleCityChange}
                  variant="outlined"
                  fullWidth
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Выберите город
                  </MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FormSection>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button onClick={handleBack} startIcon={<ArrowBackIcon />}>
                Назад
              </Button>
              <Button variant="contained" color="primary" onClick={handleNext}>
                Далее
              </Button>
            </Box>
          </>
        )
      case 2:
        return (
          <>
            <FormSection>
              <FormTitle variant="h6">
                Оцените компанию по категориям
              </FormTitle>
              {loading ? (
                <Box display="flex" justifyContent="center" my={3}>
                  <CircularProgress />
                </Box>
              ) : (
                categories.map(category => (
                  <FormControl key={category.id} component="fieldset" margin="normal" fullWidth>
                    <RatingLabel>
                      <Box>
                        <Typography>{category.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {category.description}
                        </Typography>
                      </Box>
                      <Rating
                        value={formData.categoryRatings[category.id] || 0}
                        onChange={(_, value) => handleRatingChange(category.id, value)}
                      />
                    </RatingLabel>
                  </FormControl>
                ))
              )}
            </FormSection>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button onClick={handleBack} startIcon={<ArrowBackIcon />}>
                Назад
              </Button>
              <Button variant="contained" color="primary" onClick={handleNext}>
                Далее
              </Button>
            </Box>
          </>
        )
      case 3:
        return (
          <>
            <FormSection>
              <FormTitle variant="h6">
                Детали вашего опыта
              </FormTitle>
              <TextField
                fullWidth
                label="Что понравилось?"
                name="pros"
                value={formData.pros}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
                placeholder="Расскажите о позитивном опыте работы в компании"
                required
                error={!!prosError}
                helperText={prosError || `Минимум 10 символов. Введено: ${formData.pros.length}`}
                FormHelperTextProps={{
                  sx: { color: formData.pros.length >= 10 ? 'success.main' : '' }
                }}
                InputProps={{
                  endAdornment: (
                    formData.pros.length > 0 && (
                      formData.pros.length >= 10 ? 
                        <CheckCircleIcon color="success" /> : 
                        <ErrorOutlineIcon color="error" />
                    )
                  )
                }}
              />
              <TextField
                fullWidth
                label="Что можно улучшить?"
                name="cons"
                value={formData.cons}
                onChange={handleInputChange}
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
                placeholder="Расскажите о том, что можно было бы улучшить"
                required
                error={!!consError}
                helperText={consError || `Минимум 10 символов. Введено: ${formData.cons.length}`}
                FormHelperTextProps={{
                  sx: { color: formData.cons.length >= 10 ? 'success.main' : '' }
                }}
                InputProps={{
                  endAdornment: (
                    formData.cons.length > 0 && (
                      formData.cons.length >= 10 ? 
                        <CheckCircleIcon color="success" /> : 
                        <ErrorOutlineIcon color="error" />
                    )
                  )
                }}
              />
              <FormControl component="fieldset" margin="normal">
                <FormLabel>Какие льготы предоставляет компания?</FormLabel>
                <FormGroup>
                  <StyledGrid>
                    {loading ? (
                      <Box display="flex" justifyContent="center" width="100%" my={3}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      benefitTypes.map(benefit => (
                        <Box key={benefit.id} width={{ xs: '100%', sm: '50%' }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.benefitIds.includes(benefit.id)}
                                onChange={handleBenefitChange}
                                name={benefit.id.toString()}
                              />
                            }
                            label={benefit.name}
                          />
                        </Box>
                      ))
                    )}
                  </StyledGrid>
                </FormGroup>
              </FormControl>
              <FormControl component="fieldset" margin="normal" fullWidth>
                <FormLabel>Рекомендуете ли вы другим данную компанию?</FormLabel>
                <RadioGroup
                  row
                  name="is_recommended"
                  value={formData.is_recommended !== undefined ? formData.is_recommended.toString() : ''}
                  onChange={handleRadioChange}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="Да, рекомендую"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="Нет, не рекомендую"
                  />
                </RadioGroup>
              </FormControl>
            </FormSection>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Button onClick={handleBack} startIcon={<ArrowBackIcon />}>
                Назад
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !formData.position ||
                  !formData.pros ||
                  formData.pros.length < 10 ||
                  !formData.cons ||
                  formData.cons.length < 10 ||
                  !formData.employment ||
                  !formData.cityId ||
                  !formData.employmentTypeId ||
                  !formData.employmentPeriodId ||
                  Object.values(formData.categoryRatings).every(rating => rating === 0)
                }
              >
                {submitting ? 'Отправка...' : 'Отправить отзыв'}
              </Button>
            </Box>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Box className="container" py={4}>
      <Seo
        title="Оставить отзыв о компании | JobSolution"
        description="Поделитесь своим опытом работы в компании. Ваш отзыв поможет другим соискателям найти работу мечты."
        keywords="отзыв о работодателе, оценка компании, условия работы, карьерный рост"
      />

      <IconButton
        component={Link}
        to="/"
        sx={{ mb: 2 }}
        color="inherit"
      >
        <ArrowBackIcon /> На главную
      </IconButton>

      <Typography variant="h4" component="h1" gutterBottom align="center">
        Оставить отзыв
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Компания</StepLabel>
        </Step>
        <Step>
          <StepLabel>О работе</StepLabel>
        </Step>
        <Step>
          <StepLabel>Оценки</StepLabel>
        </Step>
        <Step>
          <StepLabel>Детали</StepLabel>
        </Step>
      </Stepper>

      <FormContainer>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        <form>{renderStepContent(activeStep)}</form>
      </FormContainer>

      <SuccessDialog
        open={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        aria-hidden="false"
        aria-describedby="success-dialog-description"
        aria-labelledby="success-dialog-title"
      >
        <SuccessIcon />
        <SuccessTitle id="success-dialog-title">Отзыв успешно отправлен</SuccessTitle>
        <SuccessContent>
          <SuccessMessage id="success-dialog-description">
            Спасибо за ваш отзыв! Вы будете перенаправлены на страницу компании через несколько секунд.
          </SuccessMessage>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSuccessDialogClose}
          >
            Перейти к компании сейчас
          </Button>
        </SuccessContent>
      </SuccessDialog>

      {/* Индикатор во время отправки */}
      {submitting && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <LoadingIndicator text="Отправка отзыва..." size={60} />
        </Box>
      )}
    </Box>
  )
}

export default AddReviewPage 