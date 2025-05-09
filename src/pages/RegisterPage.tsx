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
import { useEffect, useState, forwardRef } from 'react'
import { IMaskInput } from 'react-imask'
import { Link, useNavigate } from 'react-router-dom'
import { AuthApi, TokenService, UserService, isAuthenticated } from '../shared/api'
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
    margin: '5px auto',
  },
}))

const FormTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
  fontWeight: 600,
  textAlign: 'center',
  fontSize: '1.4rem',
}))

const FormSubtitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  fontSize: '0.85rem',
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
  marginBottom: theme.spacing(1.5),
}))

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

const RegisterPage = () => {
  const navigate = useNavigate()
  const [registerForm, setRegisterForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirm: '',
    agreeTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/')
    }
  }, [navigate])

  useEffect(() => {
    validateFormFields()
  }, [registerForm])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target
    setRegisterForm(prev => ({
      ...prev,
      [name]: name === 'agreeTerms' ? checked : value,
    }))

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handlePhoneChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target
    setRegisterForm(prev => ({
      ...prev,
      [name]: value,
    }))

    if (errors.phone) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.phone
        return newErrors
      })
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev)
  }

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(prev => !prev)
  }

  const validateFormFields = (): void => {
    const isEmailValid = !!registerForm.email && /\S+@\S+\.\S+/.test(registerForm.email)
    const isFirstNameValid = registerForm.first_name.length > 0
    const isLastNameValid = registerForm.last_name.length > 0
    const isPhoneValid = registerForm.phone.replace(/\D/g, '').length === 11
    const isPasswordValid = registerForm.password.length >= 6
    const isPasswordConfirmValid = registerForm.password === registerForm.password_confirm
    const isTermsAgreed = registerForm.agreeTerms === true

    const formIsValid = isEmailValid &&
      isFirstNameValid &&
      isLastNameValid &&
      isPhoneValid &&
      isPasswordValid &&
      isPasswordConfirmValid &&
      isTermsAgreed

    setIsFormValid(formIsValid)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!registerForm.email) {
      newErrors.email = 'Email обязателен'
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      newErrors.email = 'Некорректный формат email'
    }

    if (!registerForm.first_name) {
      newErrors.first_name = 'Имя обязательно'
    }

    if (!registerForm.last_name) {
      newErrors.last_name = 'Фамилия обязательна'
    }

    const phoneDigits = registerForm.phone.replace(/\D/g, '')
    if (!registerForm.phone) {
      newErrors.phone = 'Номер телефона обязателен'
    } else if (phoneDigits.length !== 11) {
      newErrors.phone = 'Введите полный номер телефона'
    }

    if (!registerForm.password) {
      newErrors.password = 'Пароль обязателен'
    } else if (registerForm.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов'
    }

    if (registerForm.password !== registerForm.password_confirm) {
      newErrors.password_confirm = 'Пароли не совпадают'
    }

    if (!registerForm.agreeTerms) {
      newErrors.agreeTerms = 'Необходимо согласиться с условиями'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setIsLoading(true)
      setError(null)

      try {
        const phoneFormatted = registerForm.phone.replace(/\D/g, '')

        const response = await AuthApi.register({
          email: registerForm.email,
          first_name: registerForm.first_name,
          last_name: registerForm.last_name,
          phone: phoneFormatted,
          password: registerForm.password,
          password_confirm: registerForm.password_confirm
        })

        if (response.success) {
          TokenService.setTokens(response.data.tokens)
          UserService.setUser(response.data.user)

          window.dispatchEvent(new Event('storage'))

          navigate('/')
        } else {
          setError('Возникла ошибка при регистрации. Пожалуйста, проверьте введенные данные')
          setOpenSnackbar(true)
        }
      } catch (err: any) {
        console.error('Ошибка регистрации:', err);

        if (err.message.includes('email') && err.message.includes('уже существует')) {
          setError('Пользователь с таким email уже зарегистрирован');
          setErrors(prev => ({ ...prev, email: 'Email уже используется' }));
        } else if (err.message.includes('phone') && err.message.includes('уже существует')) {
          setError('Пользователь с таким номером телефона уже зарегистрирован');
          setErrors(prev => ({ ...prev, phone: 'Телефон уже используется' }));
        } else if (err.message.includes('валидации')) {
          setError('Пожалуйста, проверьте правильность введенных данных');
        } else if (err.message.includes('соединения')) {
          setError('Проблема с подключением к серверу. Проверьте ваше интернет-соединение');
        } else {
          setError(err.message || 'Произошла ошибка при регистрации');
        }

        setOpenSnackbar(true)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  return (
    <Box sx={{
      pt: 1,
      pb: 1,
      background: 'linear-gradient(180deg, rgba(245, 247, 250, 0.85) 0%, rgba(255, 255, 255, 1) 100%)',
      minHeight: {
        xs: 'calc(100vh - 140px)',
        md: 'calc(100vh - 140px)'
      },
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2
    }}>
      <Seo
        title="Регистрация | JobSolution"
        description="Создайте аккаунт JobSolution, чтобы оставлять отзывы о работодателях, сохранять понравившиеся компании и получать уведомления."
      />
      <FormContainer elevation={0}>
        <FormTitle variant="h5">
          Добро пожаловать в Job Solution
        </FormTitle>
        <FormSubtitle variant="body2">
          Создайте аккаунт, чтобы оставлять отзывы и получать уведомления
        </FormSubtitle>

        <form onSubmit={handleRegister}>
          <StyledTextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={registerForm.email}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            required
            error={!!errors.email}
            helperText={errors.email}
            disabled={isLoading}
          />

          <StyledTextField
            fullWidth
            label="Имя"
            name="first_name"
            type="text"
            value={registerForm.first_name}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            required
            error={!!errors.first_name}
            helperText={errors.first_name}
            disabled={isLoading}
          />

          <StyledTextField
            fullWidth
            label="Фамилия"
            name="last_name"
            type="text"
            value={registerForm.last_name}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            required
            error={!!errors.last_name}
            helperText={errors.last_name}
            disabled={isLoading}
          />

          <StyledTextField
            fullWidth
            label="Номер телефона"
            name="phone"
            value={registerForm.phone}
            onChange={handlePhoneChange}
            variant="outlined"
            required
            disabled={isLoading}
            error={!!errors.phone}
            helperText={errors.phone || "Формат: +7 (XXX) XXX XX XX"}
            InputProps={{
              inputComponent: PhoneMaskAdapter as any,
              inputProps: { name: 'phone' }
            }}
          />

          <StyledTextField
            fullWidth
            label="Пароль"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={registerForm.password}
            onChange={handleInputChange}
            variant="outlined"
            required
            error={!!errors.password}
            helperText={errors.password}
            disabled={isLoading}
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
          />

          <StyledTextField
            fullWidth
            label="Подтвердите пароль"
            name="password_confirm"
            type={showConfirmPassword ? 'text' : 'password'}
            value={registerForm.password_confirm}
            onChange={handleInputChange}
            variant="outlined"
            required
            error={!!errors.password_confirm}
            helperText={errors.password_confirm}
            disabled={isLoading}
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
          />

          <Box mt={1.5}>
            <FormControlLabel
              control={
                <Checkbox
                  name="agreeTerms"
                  checked={registerForm.agreeTerms}
                  onChange={handleInputChange}
                  color="primary"
                  disabled={isLoading}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" fontSize="0.85rem">
                  Я соглашаюсь с <Link to="/terms">условиями использования</Link> и <Link to="/privacy">политикой конфиденциальности</Link>
                </Typography>
              }
            />
            {errors.agreeTerms && (
              <Typography variant="caption" color="error">
                {errors.agreeTerms}
              </Typography>
            )}
          </Box>

          <StyledButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{
              mt: 1.5,
              opacity: isFormValid ? 1 : 0.6,
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              transition: 'opacity 0.3s ease',
              py: 1.5
            }}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? 'Регистрация...' : 'Создать аккаунт'}
          </StyledButton>
        </form>

        <Box mt={1.5} textAlign="center">
          <Typography variant="body2" fontSize="0.85rem">
            Уже есть аккаунт?{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography component="span" variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                Войти
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

export default RegisterPage 