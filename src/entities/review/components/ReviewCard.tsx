import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Typography,
  Snackbar,
  Alert
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useState, useEffect } from 'react'
import { Review } from '../types'
import StarRating from '../../../shared/components/StarRating'
import { ReviewApi, isAuthenticated, TokenService } from '../../../shared/api'
import { useNavigate } from 'react-router-dom'

interface ReviewCardProps {
  review: Review;
}

const CardHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 16,
})

const ReviewMetaInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  marginBottom: 10,
  '& > *': {
    marginRight: 10,
    marginBottom: 5,
  },
})

const ReviewInfoChip = styled(Chip)({
  backgroundColor: '#f0f7ff',
  color: 'var(--text-color)',
  fontSize: 12,
})

const SectionTitle = styled(Typography)({
  fontWeight: 500,
  marginBottom: 5,
})

const BenefitChip = styled(Chip)({
  margin: '0 4px 4px 0',
  backgroundColor: '#e3f2fd',
})

const LikeButton = styled(Button)({
  display: 'flex',
  alignItems: 'center',
  color: 'var(--text-light)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
})

const ReviewSection = styled(Box)({
  marginTop: 16,
})

const ReviewCard = ({ review }: ReviewCardProps) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false)
  const [usefulCount, setUsefulCount] = useState<number>(review.useful_count || 0)
  const [isMarkedUseful, setIsMarkedUseful] = useState<boolean>(review.is_marked_as_useful || false)
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)
  const [snackbarMessage, setSnackbarMessage] = useState<string>('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('success')

  useEffect(() => {
    setIsMarkedUseful(review.is_marked_as_useful || false)
    setUsefulCount(review.useful_count || 0)
  }, [review])

  const handleLike = async () => {
    if (!isAuthenticated()) {
      setSnackbarMessage('Необходимо авторизоваться, чтобы отметить отзыв как полезный')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
      return
    }

    try {
      if (!isMarkedUseful) {
        await ReviewApi.markAsUseful(Number(review.id))
        setUsefulCount(prev => prev + 1)
        setIsMarkedUseful(true)
        setSnackbarMessage('Отзыв отмечен как полезный')
        setSnackbarSeverity('success')
      } else {
        await ReviewApi.removeUsefulMark(Number(review.id))
        setUsefulCount(prev => Math.max(0, prev - 1))
        setIsMarkedUseful(false)
        setSnackbarMessage('Отметка о полезности отзыва удалена')
        setSnackbarSeverity('success')
      }
      setSnackbarOpen(true)
    } catch (err: any) {
      console.error('Ошибка при взаимодействии с API оценки полезности:', err)
      
      if (err.message && err.message.includes('сессии истек')) {
        TokenService.clearTokens();
        setSnackbarMessage('Срок действия сессии истек. Перенаправляем на страницу входа...')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setSnackbarMessage('Произошла ошибка при выполнении операции')
        setSnackbarSeverity('error')
        setSnackbarOpen(true)
      }
    }
  }

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  return (
    <Box>
      <CardHeader>
        <Box>
          <Typography variant="h6" component="h3">
            {review.position}
          </Typography>
          <StarRating rating={review.rating} showCount={true} size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {review.date}
        </Typography>
      </CardHeader>

      <ReviewMetaInfo>
        <ReviewInfoChip
          label={review.isFormerEmployee ? 'Бывший сотрудник' : 'Текущий сотрудник'}
          size="small"
        />
        <ReviewInfoChip
          label={`Стаж в компании: ${review.employmentTerm}`}
          size="small"
        />
        <ReviewInfoChip
          label={review.location}
          size="small"
        />
      </ReviewMetaInfo>

      <ReviewSection>
        <SectionTitle variant="subtitle2">
          <span role="img" aria-label="like">😊</span> Что понравилось
        </SectionTitle>
        <Typography variant="body2" color="text.secondary">
          {review.pros}
        </Typography>
      </ReviewSection>

      <ReviewSection>
        <SectionTitle variant="subtitle2">
          <span role="img" aria-label="dislike">😞</span> Что можно было бы улучшить
        </SectionTitle>
        <Typography variant="body2" color="text.secondary">
          {review.cons}
        </Typography>
      </ReviewSection>

      {review.benefits && review.benefits.length > 0 && (
        <ReviewSection>
          <SectionTitle variant="subtitle2">Список льгот</SectionTitle>
          <Collapse in={expanded || review.benefits.length <= 3} collapsedSize={40}>
            <Box sx={{ pt: 1 }}>
              {review.benefits.map((benefit, index) => (
                <BenefitChip
                  key={index}
                  label={benefit}
                  size="small"
                />
              ))}
            </Box>
          </Collapse>
          {review.benefits.length > 3 && (
            <Button
              onClick={toggleExpand}
              size="small"
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ mt: 1 }}
            >
              {expanded ? 'Свернуть' : 'Показать все льготы'}
            </Button>
          )}
        </ReviewSection>
      )}

      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="flex-start">
        <LikeButton
          size="small"
          startIcon={<ThumbUpIcon color={isMarkedUseful ? 'primary' : 'inherit'} />}
          onClick={handleLike}
        >
          Полезный отзыв: {usefulCount > 0 && `(${usefulCount})`}
        </LikeButton>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ReviewCard 