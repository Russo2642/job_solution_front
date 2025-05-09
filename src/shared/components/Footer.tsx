import { Box, Container, Grid, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Link, useLocation } from 'react-router-dom'

const FooterWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isAuthPage'
})<{ isAuthPage?: boolean }>(({ isAuthPage, theme }) => ({
  backgroundColor: '#f5f5f5',
  padding: isAuthPage ? '15px 0' : '30px 0',
  marginTop: 'auto',
  borderTop: '1px solid #e0e0e0',
  [theme.breakpoints.up('md')]: {
    padding: isAuthPage ? '10px 0' : '30px 0',
  },
  [theme.breakpoints.down('sm')]: {
    padding: isAuthPage ? '10px 0' : '20px 0',
  }
}))

const FooterTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '16px',
  marginBottom: '16px',
  color: '#333',
  [theme.breakpoints.down('sm')]: {
    fontSize: '15px',
    marginBottom: '12px',
  }
}))

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  fontSize: '14px',
  '&:hover': {
    textDecoration: 'underline',
  },
  display: 'block',
  marginBottom: '10px',
  [theme.breakpoints.down('sm')]: {
    marginBottom: '8px',
    fontSize: '13px',
  }
}))

const ExternalLink = styled('a')(({ theme }) => ({
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  fontSize: '14px',
  '&:hover': {
    textDecoration: 'underline',
  },
  display: 'block',
  marginBottom: '10px',
  [theme.breakpoints.down('sm')]: {
    marginBottom: '8px',
    fontSize: '13px',
  }
}))

const Copyright = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  color: '#777',
  textAlign: 'center',
  marginTop: '24px',
  [theme.breakpoints.down('sm')]: {
    marginTop: '16px',
    fontSize: '13px',
  }
}))

const ResponsiveGrid = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    '& .MuiGrid-item': {
      marginBottom: '16px',
    },
    '& .MuiGrid-item:last-child': {
      marginBottom: 0,
    }
  }
}))

const Footer: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <FooterWrapper isAuthPage={true}>
        <Container>
          <Copyright sx={{ mt: 0 }}>
            © {new Date().getFullYear()} JobSolution. Все права защищены.
          </Copyright>
        </Container>
      </FooterWrapper>
    );
  }

  return (
    <FooterWrapper>
      <Container>
        <ResponsiveGrid container spacing={3} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={4}>
            <FooterTitle>
              JobSolution
            </FooterTitle>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Сервис отзывов о работодателях и компаниях
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Делитесь своим опытом работы и помогайте другим в поиске идеального работодателя
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FooterTitle>
              Разделы
            </FooterTitle>
            <FooterLink to="/">Главная</FooterLink>
            <FooterLink to="/add-review">Добавить отзыв</FooterLink>
            {location.pathname !== '/login' && <FooterLink to="/login">Вход</FooterLink>}
            {location.pathname !== '/register' && <FooterLink to="/register">Регистрация</FooterLink>}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FooterTitle>
              Контакты
            </FooterTitle>
            <ExternalLink href="mailto:job.solution@inbox.ru">job.solution@inbox.ru</ExternalLink>
            <ExternalLink href="tel:+77777318242">+7 (777) 731-82-42</ExternalLink>
          </Grid>
        </ResponsiveGrid>
        <Copyright>
          © {new Date().getFullYear()} JobSolution. Все права защищены.
        </Copyright>
      </Container>
    </FooterWrapper>
  )
}

export default Footer