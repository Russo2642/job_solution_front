import React, { useState, forwardRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  TextField,
  Typography,
  Alert,
  Paper,
  Grid,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { UpdateUserRequest, User, UserService } from '../../../shared/api';
import { IMaskInput } from 'react-imask';

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

interface ProfileEditFormProps {
  user: User;
  onSuccess: (updatedUser: User) => void;
  onCancel: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user, onSuccess, onCancel }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState<UpdateUserRequest>({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
    password: '',
    password_confirm: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePhoneChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors.phone) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'Введите имя';
    }
    
    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Введите фамилию';
    }
    
    if (formData.phone) {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 11) {
        newErrors.phone = 'Введите полный номер телефона';
      }
    }
    
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Пароль должен содержать не менее 8 символов';
      }
      
      if (formData.password !== formData.password_confirm) {
        newErrors.password_confirm = 'Пароли не совпадают';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitError(null);
    setSubmitSuccess(false);
    
    if (!validate()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const dataToSend: UpdateUserRequest = {};
      
      if (formData.first_name !== user.first_name) {
        dataToSend.first_name = formData.first_name;
      }
      
      if (formData.last_name !== user.last_name) {
        dataToSend.last_name = formData.last_name;
      }
      
      if (formData.phone !== user.phone) {
        const phoneFormatted = formData.phone ? formData.phone.replace(/\D/g, '') : '';
        dataToSend.phone = phoneFormatted;
      }
      
      if (formData.password && formData.password_confirm) {
        dataToSend.password = formData.password;
        dataToSend.password_confirm = formData.password_confirm;
      }
      
      const response = await UserService.updateProfile(dataToSend);
      
      if (response.success) {
        setSubmitSuccess(true);
        
        const userData = response.data;
        
        if (userData) {
          UserService.setUser(userData);
          
          setTimeout(() => {
            onSuccess(userData);
          }, 3000);
        } else {
          console.error('Ошибка: данные пользователя отсутствуют в ответе сервера');
          setSubmitError('Не удалось получить обновленные данные пользователя');
        }
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось обновить профиль');
      console.error('Ошибка при обновлении профиля:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" component="h2" gutterBottom>
          Редактирование профиля
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        
        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Профиль успешно обновлен
          </Alert>
        )}
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Имя"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              margin="normal"
              error={!!errors.first_name}
              helperText={errors.first_name}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Фамилия"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              margin="normal"
              error={!!errors.last_name}
              helperText={errors.last_name}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Телефон"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              margin="normal"
              error={!!errors.phone}
              helperText={errors.phone || 'Формат: +7 (XXX) XXX XX XX'}
              InputProps={{
                inputComponent: PhoneMaskAdapter as any,
                inputProps: { name: 'phone' }
              }}
            />
          </Grid>
        </Grid>
        
        <Typography variant="h6" component="h3" mt={3} mb={2}>
          Изменение пароля
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Новый пароль"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              error={!!errors.password}
              helperText={errors.password || 'Минимум 8 символов'}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Подтверждение пароля"
              name="password_confirm"
              type="password"
              value={formData.password_confirm}
              onChange={handleChange}
              margin="normal"
              error={!!errors.password_confirm}
              helperText={errors.password_confirm}
            />
          </Grid>
        </Grid>
        
        <Box mt={3} display="flex" justifyContent={isMobile ? 'center' : 'flex-end'} flexDirection={isMobile ? 'column' : 'row'} gap={2}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onCancel}
            disabled={isLoading || submitSuccess}
            fullWidth={isMobile}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading || submitSuccess}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            fullWidth={isMobile}
          >
            {submitSuccess ? 'Сохранено' : (isLoading ? 'Сохранение...' : 'Сохранить изменения')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfileEditForm; 