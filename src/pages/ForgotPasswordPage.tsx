import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  TextField,
  Typography
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthApi } from '../shared/api'
import { Seo } from '../shared/components'

const FormContainer = styled(Paper)(({ theme }) => ({
  maxWidth: 450,
  margin: '20px auto',
  padding: theme.spacing(3),
  borderRadius: 20,
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04), 0 4px 20px rgba(0, 32, 128, 0.07)',
  position: 'relative',
  overflow: 'hidden',
  background: '#fff',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    zIndex: -1,
    background: 'radial-gradient(circle at center, rgba(100, 149, 237, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
    borderRadius: '50%'
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5, 2),
    margin: '10px auto 20px',
    width: 'calc(100% - 24px)',
    borderRadius: 16,
  },
}))

const FormTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
  fontWeight: 600,
  textAlign: 'center',
  fontSize: '1.4rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.25rem',
  },
}))

const FormSubtitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  fontSize: '0.85rem',
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1.5),
    fontSize: '0.8rem',
  },
}))

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: '12px 0',
  marginTop: theme.spacing(1),
  fontWeight: 500,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: '0 4px 12px rgba(0, 82, 204, 0.18)',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0, 82, 204, 0.28)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '10px 0',
    fontSize: '0.95rem',
  },
}))

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    transition: 'all 0.2s',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.light,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: 1.5,
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.95rem',
  },
  '& .MuiOutlinedInput-input': {
    padding: '12px 16px',
    fontSize: '1rem',
  },
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1.5),
    '& .MuiInputLabel-root': {
      fontSize: '0.9rem',
    },
    '& .MuiOutlinedInput-input': {
      padding: '10px 14px',
      fontSize: '0.95rem',
    },
  },
}))

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev)
  }

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(prev => !prev)
  }

  const validate = (): boolean => {
    let isValid = true
    
    if (!formData.email) {
      setError('Введите email')
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Некорректный формат email')
      isValid = false
    } else if (!formData.password) {
      setError('Введите новый пароль')
      isValid = false
    } else if (formData.password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов')
      isValid = false
    } else if (formData.password !== formData.password_confirm) {
      setError('Пароли не совпадают')
      isValid = false
    }
    
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      setOpenSnackbar(true)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await AuthApi.forgotPassword({
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm
      })
      
      if (response.success) {
        setSuccessMessage('Пароль успешно изменен. Теперь вы можете войти в систему.')
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError('Не удалось изменить пароль')
        setOpenSnackbar(true)
      }
    } catch (err: any) {
      console.error('Ошибка при восстановлении пароля:', err)
      
      if (err.message?.includes('404')) {
        setError('Пользователь с таким email не найден')
      } else if (err.message?.includes('400')) {
        setError('Неверные данные для восстановления пароля')
      } else if (err.message?.includes('network') || err.message?.includes('Network')) {
        setError('Ошибка сети. Проверьте ваше соединение')
      } else {
        setError(err.message || 'Произошла ошибка при восстановлении пароля')
      }
      
      setOpenSnackbar(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  return (
    <Box sx={{ 
      pt: { xs: 0.5, sm: 1 }, 
      pb: { xs: 0.5, sm: 1 },
      background: 'linear-gradient(180deg, rgba(245, 247, 250, 0.85) 0%, rgba(255, 255, 255, 1) 100%)',
      minHeight: {
        xs: 'calc(100vh - 124px)',
        sm: 'calc(100vh - 140px)',
        md: 'calc(100vh - 160px)' 
      },
      height: '100%',
      display: 'flex',
      alignItems: 'center', 
      justifyContent: 'center',
      px: { xs: 1, sm: 2 }
    }}>
      <Seo
        title="Восстановление пароля | JobSolution"
        description="Восстановите доступ к своему аккаунту JobSolution. Измените пароль и получите доступ к своему аккаунту."
      />
      <FormContainer elevation={0}>
        <FormTitle variant="h5">
          Восстановление пароля
        </FormTitle>
        <FormSubtitle variant="body2">
          Введите email и новый пароль для восстановления доступа
        </FormSubtitle>
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <StyledTextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            variant="outlined"
            required
            disabled={isLoading || !!successMessage}
            error={!!error && error.includes('email')}
            sx={{ mb: 1.5 }}
          />

          <StyledTextField
            fullWidth
            label="Новый пароль"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            variant="outlined"
            required
            disabled={isLoading || !!successMessage}
            error={!!error && error.includes('пароль')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={toggleShowPassword}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1.5 }}
          />
          
          <StyledTextField
            fullWidth
            label="Подтверждение пароля"
            name="password_confirm"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.password_confirm}
            onChange={handleInputChange}
            variant="outlined"
            required
            disabled={isLoading || !!successMessage}
            error={!!error && error.includes('совпадают')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={toggleShowConfirmPassword}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1.5 }}
          />

          <StyledButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={isLoading || !!successMessage}
            sx={{ py: 1.5, mb: 1.5 }}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Обработка...
              </>
            ) : 'Восстановить пароль'}
          </StyledButton>
          
          <Box textAlign="center">
            <Typography variant="body2" fontSize="0.85rem">
              Вспомнили пароль?{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography component="span" variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                  Войти
                </Typography>
              </Link>
            </Typography>
          </Box>
        </form>
      </FormContainer>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ForgotPasswordPage 