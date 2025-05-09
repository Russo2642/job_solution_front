import ClearIcon from '@mui/icons-material/Clear'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  InputBase,
  Pagination,
  SwipeableDrawer,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CompanyCard from '../entities/company/components/CompanyCard'
import CompanyFilters from '../entities/company/components/CompanyFilters'
import { City, CompaniesFilter, CompanySizes, CompanyWithDetails, Industry } from '../entities/company/types'
import { CityApi, CompanyApi, IndustryApi } from '../shared/api'
import { Seo } from '../shared/components'

const MainSection = styled(Box)(({ theme }) => ({
  backgroundColor: '#f5f5f7',
  minHeight: '100vh',
  padding: '32px 0',
  [theme.breakpoints.down('sm')]: {
    padding: '16px 0 24px',
  },
}))

const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '32px',
  fontWeight: 600,
  marginBottom: '8px',
  marginTop: '24px',
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    fontSize: '28px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '24px',
    marginTop: '16px',
  },
}))

const PageDescription = styled(Typography)(({ theme }) => ({
  fontSize: '18px',
  color: 'var(--text-light)',
  marginBottom: '32px',
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    fontSize: '17px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '16px',
    marginBottom: '24px',
  },
}))

const SearchBarWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '24px',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '12px',
  },
}))

const SearchInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  padding: '12px 16px',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  backgroundColor: 'white',
  color: '#000',
  fontSize: '16px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  '&::placeholder': {
    color: 'rgba(0, 0, 0, 0.54)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '10px 14px',
    fontSize: '15px',
  },
}))

const FilterSidebar = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(2),
  },
}))

const ContentContainer = styled(Container)(({ theme }) => ({
  maxWidth: '1280px',
  [theme.breakpoints.up('xl')]: {
    maxWidth: '1400px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '0 12px',
  },
}))

const PageLayout = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: '24px',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}))

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: theme.spacing(3),
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    borderRadius: '8px',
  },
}))

const CompanyCardWrapper = styled(Box)(({ theme }) => ({
  margin: '0 0 16px',
  width: '100%',
  '& .MuiPaper-root': {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  [theme.breakpoints.down('sm')]: {
    margin: '0 0 12px',
  },
}))

const ResultsHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '12px',
  },
}))

const ResultsCount = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 500,
  color: '#333',
  [theme.breakpoints.down('sm')]: {
    fontSize: '14px',
  },
}))

const FilterButton = styled(Button)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: '#f5f5f7',
    color: '#555',
    border: '1px solid #e0e0e0',
    fontWeight: 500,
    fontSize: '14px',
    textTransform: 'none',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: '#e8e8e8',
      boxShadow: 'none',
    },
  },
}))

const FilterDrawer = styled(SwipeableDrawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '85%',
    maxWidth: '350px',
    padding: '20px 16px',
    boxSizing: 'border-box',
  },
}))

const HomePage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [allCompanies, setAllCompanies] = useState<CompanyWithDetails[]>([])
  const [companies, setCompanies] = useState<CompanyWithDetails[]>([])
  const [companySizes, setCompanySizes] = useState<CompanySizes>({
    small: 'до 50 сотрудников',
    medium: '50-200 сотрудников',
    large: '200-1000 сотрудников',
    enterprise: 'более 1000 сотрудников'
  })
  const [cities, setCities] = useState<City[]>([])
  const [industries, setIndustries] = useState<Industry[]>([])
  const [filters, setFilters] = useState<CompaniesFilter>({
    search: '',
    page: 1,
    limit: 12,
    sort_by: 'rating',
    sort_order: 'desc'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalCompanies, setTotalCompanies] = useState(0)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchResults, setSearchResults] = useState<CompanyWithDetails[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  const searchTimerRef = useRef<number | null>(null);

  const isFirstRender = useRef(true);
  const previousFilters = useRef<CompaniesFilter>(filters);

  useEffect(() => {
    fetchAllCompanies();
    fetchCities();
    fetchIndustries();

    try {
      fetchCompanies();
    } catch (err) {
      console.error('Ошибка при начальной загрузке компаний:', err);
      setLoading(false);
      setError('Не удалось загрузить список компаний. Пожалуйста, обновите страницу.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const filtersChanged = JSON.stringify(previousFilters.current) !== JSON.stringify(filters);

    if (!isSearchActive && filtersChanged) {
      previousFilters.current = { ...filters };
      fetchCompanies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, isSearchActive]);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        window.clearTimeout(searchTimerRef.current);
        searchTimerRef.current = null;
      }
    };
  }, []);

  const fetchAllCompanies = async () => {
    if (allCompanies.length > 0) {
      return;
    }

    try {
      const response = await CompanyApi.getCompanies({
        limit: 100,
        page: 1,
        sort_by: 'rating',
        sort_order: 'desc'
      });

      if (response.success && response.data.companies.length > 0) {
        setAllCompanies(response.data.companies);
      } else {
        console.warn('API вернул пустой список компаний или ошибку', response);
      }
    } catch (error) {
      console.error('Ошибка при загрузке всех компаний:', error);
    }
  };

  const fetchCities = async () => {
    if (cities.length > 0) return;

    try {
      const response = await CityApi.getCities();
      setCities(response.data.cities);
    } catch (error) {
      console.error('Ошибка при загрузке городов:', error);
    }
  };

  const fetchIndustries = async () => {
    if (industries.length > 0) return;

    try {
      const response = await IndustryApi.getIndustries();
      setIndustries(response.data.industries);
    } catch (error) {
      console.error('Ошибка при загрузке индустрий:', error);
    }
  };

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await CompanyApi.getCompanies(filters);
      setCompanies(response.data.companies);
      setTotalPages(response.data.pagination.pages);
      setTotalCompanies(response.data.pagination.total);
    } catch (error) {
      setError('Ошибка при загрузке компаний. Пожалуйста, попробуйте позже.');
      console.error('Ошибка при загрузке компаний:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const searchCompaniesLocally = useCallback((query: string) => {
    if (!query.trim()) {
      setIsSearchActive(false);
      return;
    }

    if (allCompanies.length === 0) {
      setIsSearchLoading(true);

      fetchAllCompanies().then(() => {
        performLocalSearch(query);
      }).catch(() => {
        setIsSearchLoading(false);
      });
    } else {
      setIsSearchLoading(true);
      performLocalSearch(query);
    }
  }, [allCompanies.length, fetchAllCompanies]);

  const performLocalSearch = useCallback((query: string) => {
    const normalizedQuery = query.toLowerCase().trim();

    const results = allCompanies.filter(companyData => {
      const { company, city } = companyData;
      const industry = companyData.industries && companyData.industries.length > 0
        ? companyData.industries[0]
        : null;

      const isInName = company.name.toLowerCase().includes(normalizedQuery);
      const isInCity = city?.name.toLowerCase().includes(normalizedQuery);
      const isInIndustry = industry?.name.toLowerCase().includes(normalizedQuery);

      return isInName || isInCity || isInIndustry;
    });

    setSearchResults(results);
    setIsSearchActive(true);
    setIsSearchLoading(false);
  }, [allCompanies]);

  const handleFilterChange = useCallback((newFilters: CompaniesFilter) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    setIsFilterDrawerOpen(false);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      page: 1,
      limit: 12,
      sort_by: 'rating',
      sort_order: 'desc'
    });

    if (isSearchActive) {
      setSearchQuery('');
      setIsSearchActive(false);
    }
    setIsFilterDrawerOpen(false);
  }, [isSearchActive]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }

    if (!query.trim()) {
      setIsSearchActive(false);
      return;
    }

    searchTimerRef.current = window.setTimeout(() => {
      searchCompaniesLocally(query);
    }, 500);
  }, [searchCompaniesLocally]);

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePaginationChange = useCallback((_event: React.ChangeEvent<unknown>, page: number) => {
    handlePageChange(page);
  }, [handlePageChange]);

  const handleClearSearch = useCallback(() => {
    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }

    setSearchQuery('');
    setIsSearchActive(false);

    if (companies.length === 0) {
      fetchCompanies();
    }
  }, [companies.length, fetchCompanies]);

  const toggleFilterDrawer = useCallback((open: boolean) => () => {
    setIsFilterDrawerOpen(open);
  }, []);

  const displayedCompanies = useMemo(() => {
    return isSearchActive ? searchResults : companies;
  }, [isSearchActive, searchResults, companies]);

  return (
    <MainSection>
      <Seo
        title="JobSolution - Отзывы о работодателях и компаниях"
        description="JobSolution - платформа для поиска отзывов о работодателях и компаниях. Узнавайте реальные мнения сотрудников перед трудоустройством."
      />

      <ContentContainer>
        <Box display="flex" flexDirection="column" alignItems="center">
          <PageTitle variant="h1">
            Найди работу мечты
          </PageTitle>
          <PageDescription>
            Отзывы сотрудников с реальным опытом работы
          </PageDescription>
        </Box>

        <SearchBarWrapper>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <IconButton
              sx={{
                position: 'absolute',
                left: 5,
                color: 'rgba(0, 0, 0, 0.54)'
              }}
              disabled={isSearchLoading}
            >
              <SearchIcon />
            </IconButton>
            <SearchInput
              placeholder="Поиск по названию, отрасли или городу..."
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{
                pl: 5,
                pr: searchQuery ? 5 : 2
              }}
              fullWidth
              disabled={isSearchLoading}
            />
            {searchQuery && (
              <IconButton
                sx={{
                  position: 'absolute',
                  right: 5,
                  color: 'rgba(0, 0, 0, 0.54)'
                }}
                onClick={handleClearSearch}
                disabled={isSearchLoading}
              >
                <ClearIcon />
              </IconButton>
            )}
          </Box>
        </SearchBarWrapper>

        {isMobile && (
          <FilterButton
            startIcon={<FilterListIcon />}
            variant="outlined"
            onClick={toggleFilterDrawer(true)}
          >
            Фильтры и сортировка
          </FilterButton>
        )}

        <PageLayout>
          {!isMobile && (
            <FilterSidebar sx={{ width: 280 }}>
              <CompanyFilters
                initialFilters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                cities={cities}
                industries={industries}
                companySizes={companySizes}
              />
            </FilterSidebar>
          )}

          <MainContent>
            <ResultsHeader>
              <ResultsCount>
                {isSearchActive
                  ? `Найдено компаний: ${searchResults.length}`
                  : `Показано ${companies.length} из ${totalCompanies} компаний`
                }
              </ResultsCount>
            </ResultsHeader>

            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 300
                }}
              >
                <CircularProgress size={50} />
                <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                  Загрузка компаний...
                </Typography>
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : (
              <>
                <Grid container spacing={2}>
                  {displayedCompanies.map((companyData) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={6}
                      lg={4}
                      key={companyData.company.id}
                    >
                      <CompanyCardWrapper>
                        <CompanyCard company={companyData} />
                      </CompanyCardWrapper>
                    </Grid>
                  ))}
                </Grid>

                {displayedCompanies.length === 0 && (
                  <Box
                    sx={{
                      textAlign: 'center',
                      padding: 3,
                      color: 'text.secondary'
                    }}
                  >
                    <Typography>
                      {isSearchActive
                        ? 'По вашему запросу ничего не найдено.'
                        : 'Компании не найдены.'}
                    </Typography>
                  </Box>
                )}

                {!isSearchActive && totalPages > 1 && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: 3
                    }}
                  >
                    <Pagination
                      count={totalPages}
                      page={filters.page}
                      onChange={handlePaginationChange}
                      color="primary"
                      size={isSmallMobile ? 'small' : 'medium'}
                    />
                  </Box>
                )}
              </>
            )}
          </MainContent>
        </PageLayout>
      </ContentContainer>

      {/* Выдвигающаяся панель фильтров для мобильных */}
      <FilterDrawer
        anchor="right"
        open={isFilterDrawerOpen}
        onClose={toggleFilterDrawer(false)}
        onOpen={toggleFilterDrawer(true)}
      >
        <Box sx={{ width: '100%', pt: 1 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Фильтры и сортировка
          </Typography>
          <CompanyFilters
            initialFilters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            cities={cities}
            industries={industries}
            companySizes={companySizes}
          />
        </Box>
      </FilterDrawer>
    </MainSection>
  );
};

export default HomePage; 