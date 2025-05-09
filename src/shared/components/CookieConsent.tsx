import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Snackbar, 
  Paper, 
  Link,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const CookieConsent: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasConsent = localStorage.getItem('cookieConsent');
      if (!hasConsent) {
        setOpen(true);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookieConsent', 'all');
      setOpen(false);
    }
  };

  const handleAcceptSelected = () => {
    if (typeof window !== 'undefined') {
      const preferences = JSON.stringify(cookiePreferences);
      localStorage.setItem('cookieConsent', preferences);
      setOpen(false);
      setDialogOpen(false);
    }
  };

  const handleDecline = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookieConsent', 'necessary');
      setOpen(false);
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCookiePreferences({
      ...cookiePreferences,
      [event.target.name]: event.target.checked
    });
  };

  const openSettings = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <Snackbar
        open={open}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 2,
            maxWidth: '800px',
            width: '100%',
            borderRadius: 2,
            backgroundColor: 'white',
            border: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <InfoOutlinedIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
            <Typography variant="h6" component="div" fontWeight={500}>
              Уведомление об использовании cookie-файлов
            </Typography>
          </Box>
          
          <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
            Наш сайт использует файлы cookie и аналогичные технологии для обеспечения функциональности сайта,
            анализа использования сервисов и персонализации контента. Согласно Закону Республики Казахстан
            "О персональных данных и их защите", мы обязаны получить ваше согласие на сбор и обработку данных.
            Продолжая использовать наш сайт, вы соглашаетесь с использованием cookie-файлов в соответствии с{' '}
            <Link href="/privacy-policy" color="primary">
              Политикой конфиденциальности
            </Link>. У вас есть право выбрать категории cookies, которые вы разрешаете использовать.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="flex-end"
            sx={{ mt: 2 }}
          >
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleDecline}
              size="small"
            >
              Только необходимые
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={openSettings}
              size="small"
            >
              Настройки
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleAcceptAll}
              size="small"
            >
              Принять все
            </Button>
          </Stack>
        </Paper>
      </Snackbar>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Настройки cookie-файлов
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" paragraph>
            В соответствии с Законом Республики Казахстан "О персональных данных и их защите", вы 
            можете выбрать категории cookie-файлов, которые вы хотите разрешить. Обязательные cookie-файлы 
            необходимы для функционирования сайта и не могут быть отключены.
          </Typography>
          
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={cookiePreferences.necessary} 
                  disabled 
                  name="necessary" 
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle2">Обязательные cookie-файлы</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Эти файлы необходимы для функционирования сайта и не могут быть отключены. Они обычно устанавливаются
                    только в ответ на совершаемые вами действия, которые равносильны запросу услуг (установка настроек
                    конфиденциальности, вход в систему, заполнение форм).
                  </Typography>
                </Box>
              }
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={cookiePreferences.functional} 
                  onChange={handleCheckboxChange} 
                  name="functional" 
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle2">Функциональные cookie-файлы</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Эти файлы позволяют веб-сайту запоминать ваши настройки (например, ваше имя пользователя, 
                    язык или регион), чтобы предоставить расширенные и персонализированные функции.
                  </Typography>
                </Box>
              }
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={cookiePreferences.analytics} 
                  onChange={handleCheckboxChange} 
                  name="analytics" 
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle2">Аналитические cookie-файлы</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Эти файлы собирают информацию о том, как вы используете наш сайт, какие страницы вы посещали.
                    Все данные анонимны и не могут быть использованы для вашей идентификации.
                  </Typography>
                </Box>
              }
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={cookiePreferences.marketing} 
                  onChange={handleCheckboxChange} 
                  name="marketing" 
                />
              }
              label={
                <Box>
                  <Typography variant="subtitle2">Маркетинговые cookie-файлы</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Эти файлы отслеживают вашу активность на сайте для помощи рекламодателям в предоставлении
                    более релевантной рекламы или для ограничения количества показов одной и той же рекламы.
                  </Typography>
                </Box>
              }
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDecline} color="primary">
            Только необходимые
          </Button>
          <Button onClick={handleAcceptSelected} variant="contained" color="primary">
            Сохранить настройки
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CookieConsent; 