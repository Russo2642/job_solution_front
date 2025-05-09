import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  TextField,
  Typography
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthApi, TokenService } from '../shared/api'
import { Seo } from '../shared/components'
import { useAuth } from '../entities/auth/context/AuthContext'

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

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login } = useAuth()
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/';
      navigate(from);
    }
  }, [isAuthenticated, navigate, location])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target
    setLoginForm(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value,
    }))
  }

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await AuthApi.login({
        email: loginForm.email,
        password: loginForm.password,
        remember_me: loginForm.rememberMe
      })

      if (response.success) {
        TokenService.setTokens(response.data.tokens)
        login(response.data.user)
        
        window.dispatchEvent(new Event('storage'))

        const from = location.state?.from || '/';
        navigate(from);
      } else {
        setError('Неверный логин или пароль')
        setOpenSnackbar(true)
      }
    } catch (err: any) {
      console.error('Ошибка входа:', err);
      
      if (err.message === 'Требуется авторизация' || err.message.includes('401')) {
        setError('Неверный email или пароль');
      } else if (err.message.includes('400')) {
        setError('Неверные данные для входа');
      } else if (err.message.includes('429')) {
        setError('Слишком много попыток входа. Пожалуйста, попробуйте позже');
      } else if (err.message.includes('network') || err.message.includes('Network')) {
        setError('Ошибка сети. Проверьте ваше соединение');
      } else {
        setError(err.message || 'Произошла ошибка при входе');
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
        title="Вход в аккаунт | JobSolution"
        description="Войдите в свой аккаунт JobSolution, чтобы оставлять отзывы о работодателях и сохранять понравившиеся компании."
      />
      <FormContainer elevation={0}>
        <FormTitle variant="h5">
          Добро пожаловать в Job Solution
        </FormTitle>
        <FormSubtitle variant="body2">
          Рады вас видеть снова в Job Solution!
        </FormSubtitle>

        <form onSubmit={handleLogin}>
          <StyledTextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={loginForm.email}
            onChange={handleInputChange}
            variant="outlined"
            required
            disabled={isLoading}
            error={!!error}
            sx={{ mb: 1.5 }}
          />

          <StyledTextField
            fullWidth
            label="Пароль"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={loginForm.password}
            onChange={handleInputChange}
            variant="outlined"
            required
            disabled={isLoading}
            error={!!error}
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
            sx={{ mb: 1 }}
          />

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
            <FormControlLabel
              control={
                <Checkbox
                  name="rememberMe"
                  checked={loginForm.rememberMe}
                  onChange={handleInputChange}
                  color="primary"
                  disabled={isLoading}
                  size="small"
                />
              }
              label={<Typography variant="body2" fontSize="0.85rem">Запомнить меня</Typography>}
            />
            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary" sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                Забыли пароль?
              </Typography>
            </Link>
          </Box>

          <StyledButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={isLoading}
            sx={{ py: 1.5 }}
          >
            {isLoading ? 'Выполняется вход...' : 'Войти'}
          </StyledButton>
        </form>

        <Box mt={1.5} textAlign="center">
          <Typography variant="body2" fontSize="0.85rem">
            Нет аккаунта?{' '}
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Typography component="span" variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                Зарегистрироваться
              </Typography>
            </Link>
          </Typography>
        </Box>
      </FormContainer>

      {/* Уведомление об ошибке */}
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

export default LoginPage 