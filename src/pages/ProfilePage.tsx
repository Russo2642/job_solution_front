import {
  Avatar,
  Box,
  Card,
  Chip,
  CircularProgress,
  Container,
  Grid,
  MenuItem,
  Pagination,
  Rating,
  Select,
  SelectChangeEvent,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { styled } from '@mui/material/styles'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAuthenticated, ReviewApi, User, UserService } from '../shared/api'
import { Seo } from '../shared/components'
import { ReviewWithDetails } from '../shared/types'

const PageHeader = styled(Box)(({ theme }) => ({
  backgroundColor: '#f9f9f9',
  padding: '40px 0',
  marginBottom: '30px',
  borderBottom: '1px solid #f0f0f0',
}))

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  marginRight: 20,
  [theme.breakpoints.down('sm')]: {
    marginRight: 0,
    marginBottom: 20,
    width: 80,
    height: 80,
  },
}))

const ProfileSection = styled(Box)(({ theme }) => ({
  marginBottom: 30,
}))

const SectionTitle = styled(Typography)({
  fontSize: '20px',
  fontWeight: 600,
  marginBottom: '16px',
  color: '#666666',
})

const StyledTabs = styled(Tabs)({
  marginBottom: 24,
  '& .MuiTabs-indicator': {
    height: 3,
  },
})

const StyledTab = styled(Tab)({
  fontWeight: 500,
  fontSize: '16px',
  textTransform: 'none',
  minHeight: '48px',
})

const ReviewCard = styled(Card)(({ theme }) => ({
  padding: 24,
  marginBottom: 20,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  borderRadius: 8,
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  transition: 'box-shadow 0.3s ease',
}))

const CompanyLogo = styled('img')({
  width: 60,
  height: 60,
  objectFit: 'contain',
  borderRadius: 4,
  marginRight: 16,
  backgroundColor: '#fff',
  border: '1px solid #eee',
})

const ReviewStatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => {
  let color = '#f0f7ff';
  let textColor = '#2f7ee6';

  if (status === 'approved') {
    color = '#e6f7ee';
    textColor = '#37a865';
  } else if (status === 'rejected') {
    color = '#ffebee';
    textColor = '#e53935';
  } else if (status === 'pending') {
    color = '#fff8e1';
    textColor = '#f9a825';
  }

  return {
    backgroundColor: color,
    color: textColor,
    fontWeight: 500,
    borderRadius: 4,
  }
})

const ModeratorComment = styled(Box)(({ theme }) => ({
  margin: '16px 0',
  padding: '12px 16px',
  borderRadius: 8,
  backgroundColor: '#f9f9f9',
  borderLeft: '4px solid #2f7ee6',
}))

const CompanyInfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: 16,
}))

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  )
}

const ProfilePage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [tabValue, setTabValue] = useState(0)
  const [user, setUser] = useState<User | null>(null)
  const [userReviews, setUserReviews] = useState<ReviewWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)
  const limit = 5

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    const userData = UserService.getUser()
    setUser(userData)

    fetchUserReviews()
  }, [navigate, statusFilter, page])

  const fetchUserReviews = async () => {
    try {
      setLoading(true)
      const response = await ReviewApi.getUserReviews(statusFilter, page, limit)
      setUserReviews(response.data.reviews)
      setTotalPages(response.data.pagination.pages)
      setTotalReviews(response.data.pagination.total)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке отзывов')
      console.error('Ошибка при загрузке отзывов:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as string)
    setPage(1)
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Одобрен';
      case 'rejected': return 'Отклонен';
      case 'pending': return 'На рассмотрении';
      default: return status;
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      default: return '';
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Недавно'

    const date = new Date(dateString)
    const day = date.getDate()
    const months = [
      'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
      'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'
    ]

    return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Seo
        title="Личный кабинет - JobSolution"
        description="Управление вашим профилем и отзывами на JobSolution"
      />

      <PageHeader>
        <Container>
          <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} alignItems={isMobile ? 'center' : 'flex-start'}>
            <UserAvatar
              sx={{ bgcolor: 'primary.main' }}
              alt={`${user.first_name} ${user.last_name}`}
            >
              {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
            </UserAvatar>
            <Box textAlign={isMobile ? 'center' : 'left'}>
              <Typography variant="h4" component="h1" gutterBottom>
                {user.first_name} {user.last_name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {user.phone && (
                  <span>Телефон: {user.phone} | </span>
                )}
                На сайте с {formatDate(user.created_at)}
              </Typography>
            </Box>
          </Box>
        </Container>
      </PageHeader>

      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={12}>
            <StyledTabs value={tabValue} onChange={handleTabChange} aria-label="Разделы профиля">
              <StyledTab label="Мои отзывы" />
            </StyledTabs>

            <TabPanel value={tabValue} index={0}>
              <ProfileSection>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <SectionTitle>
                    Мои отзывы ({totalReviews})
                  </SectionTitle>

                  <Box sx={{ minWidth: 200 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Статус отзыва
                    </Typography>
                    <Select
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      size="small"
                      displayEmpty
                      sx={{
                        width: '100%',
                        '& .MuiSelect-select': {
                          display: 'block',
                          pl: 2
                        }
                      }}
                    >
                      <MenuItem value="">Все статусы</MenuItem>
                      <MenuItem value="approved">✅ Одобренные</MenuItem>
                      <MenuItem value="pending">⏳ На рассмотрении</MenuItem>
                      <MenuItem value="rejected">❌ Отклоненные</MenuItem>
                    </Select>
                  </Box>
                </Box>

                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Typography color="error">{error}</Typography>
                ) : userReviews.length > 0 ? (
                  <>
                    {userReviews.map(reviewData => (
                      <ReviewCard key={reviewData.review.id}>
                        <CompanyInfoBox>
                          {reviewData.company ? (
                            <>
                              <CompanyLogo
                                src={reviewData.company.company.logo}
                                alt={reviewData.company.company.name}
                              />
                              <Box>
                                <Typography variant="h6" component="h3">
                                  <Link to={`/company/${reviewData.company.company.slug}`} style={{ color: '#2f7ee6', textDecoration: 'none' }}>
                                    {reviewData.company.company.name}
                                  </Link>
                                </Typography>
                                <Box display="flex" alignItems="center">
                                  <Rating
                                    value={reviewData.company.company.average_rating}
                                    readOnly
                                    precision={0.1}
                                    size="small"
                                    sx={{ mr: 1 }}
                                  />
                                  <Typography variant="body2" color="text.secondary">
                                    {reviewData.company.company.average_rating.toFixed(1)}
                                  </Typography>
                                </Box>
                              </Box>
                            </>
                          ) : (
                            <Typography variant="h6" component="h3">
                              <Link to={`/company/${reviewData.review.company_id}`} style={{ color: '#2f7ee6', textDecoration: 'none' }}>
                                Компания №{reviewData.review.company_id}
                              </Link>
                            </Typography>
                          )}
                        </CompanyInfoBox>

                        <Box display="flex" justifyContent="space-between" flexWrap="wrap" mb={2}>
                          <Box>
                            <Typography variant="subtitle1">{reviewData.review.position}</Typography>
                          </Box>
                          <Box>
                            <ReviewStatusChip
                              label={`${getStatusIcon(reviewData.review.status)} ${getStatusLabel(reviewData.review.status)}`}
                              status={reviewData.review.status}
                              size="small"
                            />
                            <Typography variant="body2" color="text.secondary" mt={1}>
                              Создан: {formatDate(reviewData.review.created_at)}
                            </Typography>
                            {reviewData.review.approved_at?.Valid && (
                              <Typography variant="body2" color="text.secondary">
                                Одобрен: {formatDate(reviewData.review.approved_at.Time)}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Box display="flex" flexWrap="wrap" mb={2}>
                          <Typography variant="body2" sx={{ backgroundColor: '#f0f7ff', px: 1.5, py: 0.5, borderRadius: 1, mr: 1, mb: 1 }}>
                            {reviewData.review.is_former_employee ? 'Бывший сотрудник' : 'Текущий сотрудник'}
                          </Typography>
                          <Typography variant="body2" sx={{ backgroundColor: '#f0f7ff', px: 1.5, py: 0.5, borderRadius: 1, mr: 1, mb: 1 }}>
                            Стаж в компании: {reviewData.employment_period?.name || ''}
                          </Typography>
                          <Typography variant="body2" sx={{ backgroundColor: '#f0f7ff', px: 1.5, py: 0.5, borderRadius: 1, mr: 1, mb: 1 }}>
                            {reviewData.city.name}
                          </Typography>
                        </Box>

                        {reviewData.review.moderation_comment?.Valid && (
                          <ModeratorComment>
                            <Typography variant="subtitle2" fontWeight={600}>Комментарий модератора:</Typography>
                            <Typography variant="body2">{reviewData.review.moderation_comment.String}</Typography>
                          </ModeratorComment>
                        )}

                        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" fontWeight={500}>
                            Общая оценка: {reviewData.review.rating.toFixed(1)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Полезный отзыв: {reviewData.review.useful_count}
                          </Typography>
                        </Box>
                      </ReviewCard>
                    ))}

                    {totalPages > 1 && (
                      <Box display="flex" justifyContent="center" mt={4}>
                        <Pagination
                          count={totalPages}
                          page={page}
                          onChange={handlePageChange}
                          color="primary"
                          shape="rounded"
                        />
                      </Box>
                    )}
                  </>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="body1" gutterBottom>
                      У вас пока нет отзывов о компаниях
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Поделитесь своим опытом работы, чтобы помочь другим соискателям
                    </Typography>
                  </Box>
                )}
              </ProfileSection>
            </TabPanel>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default ProfilePage 