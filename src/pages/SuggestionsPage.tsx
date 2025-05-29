import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { httpClient } from '../shared/api';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(8),
  minHeight: '70vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  borderRadius: 16,
  width: '100%',
  maxWidth: 800,
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2, 3),
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  transition: 'all 0.3s',
  borderRadius: '8px !important',
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const SuggestionsPage: React.FC = () => {
  const location = useLocation();
  const [type, setType] = useState<'company' | 'suggestion'>('suggestion');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const typeParam = queryParams.get('type');
    
    if (typeParam === 'company') {
      setType('company');
    }
  }, [location.search]);

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: 'company' | 'suggestion') => {
    if (newType !== null) {
      setType(newType);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Пожалуйста, введите текст');
      return;
    }
    
    if (text.trim().length < 5) {
      setError('Текст должен содержать минимум 5 символов');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await httpClient.post<{success: boolean}>('/suggestions', {
        text,
        type,
      });
      
      if (!response.success) {
        throw new Error('Ошибка при отправке предложения');
      }
      
      setText('');
      setSuccess(true);
    } catch (err) {
      setError('Произошла ошибка при отправке. Пожалуйста, попробуйте позже.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  return (
    <StyledContainer maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%' }}
      >
        <Box mb={6} textAlign="center">
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight={700} 
            gutterBottom
            sx={{ color: theme.palette.primary.main }}
          >
            Помогите нам стать лучше
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" maxWidth={700} mx="auto">
            Ваше мнение очень важно для нас. Поделитесь своими идеями или предложите компанию,
            которую мы должны добавить на платформу. Все предложения анонимны.
          </Typography>
        </Box>

        <StyledPaper>
          <Box component="form" onSubmit={handleSubmit}>
            <Box mb={4}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Что вы хотите предложить?
              </Typography>
              <ToggleButtonGroup
                value={type}
                exclusive
                onChange={handleTypeChange}
                aria-label="тип предложения"
                fullWidth
                sx={{ mb: 3 }}
              >
                <StyledToggleButton value="suggestion" aria-label="предложение идеи">
                  <Box display="flex" alignItems="center" flexDirection={isMobile ? 'column' : 'row'}>
                    <EmojiObjectsIcon sx={{ mr: isMobile ? 0 : 1, mb: isMobile ? 1 : 0 }} />
                    <Typography>Идея по улучшению</Typography>
                  </Box>
                </StyledToggleButton>
                <StyledToggleButton value="company" aria-label="предложение компании">
                  <Box display="flex" alignItems="center" flexDirection={isMobile ? 'column' : 'row'}>
                    <BusinessIcon sx={{ mr: isMobile ? 0 : 1, mb: isMobile ? 1 : 0 }} />
                    <Typography>Предложить компанию</Typography>
                  </Box>
                </StyledToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box mb={4}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                {type === 'suggestion' 
                  ? 'Опишите вашу идею' 
                  : 'Расскажите о компании'}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder={type === 'suggestion' 
                  ? 'Как мы можем улучшить наш сервис? Что бы вы хотели увидеть на платформе?' 
                  : 'Название компании, сфера деятельности, почему стоит добавить эту компанию'
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
                variant="outlined"
                error={text.trim().length > 0 && text.trim().length < 5}
                helperText={text.trim().length > 0 && text.trim().length < 5 ? 'Минимум 5 символов' : ''}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '1rem',
                  }
                }}
              />
            </Box>

            <Box display="flex" justifyContent="center">
              <Alert 
                severity="info" 
                sx={{ mb: 3, width: '100%', borderRadius: 2 }}
              >
                <Typography>
                  Ваше предложение будет отправлено анонимно. Мы рассмотрим его в ближайшее время.
                </Typography>
              </Alert>
            </Box>

            <Box display="flex" justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading || text.trim().length < 5}
                sx={{
                  py: 1.5,
                  px: 5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Отправить предложение'
                )}
              </Button>
            </Box>
          </Box>
        </StyledPaper>
      </motion.div>

      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Спасибо! Ваше предложение успешно отправлено.
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
};

export default SuggestionsPage; 