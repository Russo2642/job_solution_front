import { styled } from '@mui/material/styles'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer, Header } from '../components'
import { useEffect } from 'react'

const MainContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: '#fff',
  overflowX: 'hidden',
})

const ContentContainer = styled('main')(({ theme }) => ({
  flex: '1 0 auto',
  padding: '0',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '100vw',
  '&.auth-page': {
    [theme.breakpoints.up('md')]: {
      minHeight: 'auto',
    }
  },
  '& > *': {
    maxWidth: '100%',
  }
}))

const MainLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  useEffect(() => {
    if (isAuthPage) {
      document.body.classList.add('auth-page');
    } else {
      document.body.classList.remove('auth-page');
    }
    
    return () => {
      document.body.classList.remove('auth-page');
    };
  }, [isAuthPage]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <MainContainer>
      <Header />
      <ContentContainer className={isAuthPage ? 'auth-page' : ''}>
        <Outlet />
      </ContentContainer>
      <Footer />
    </MainContainer>
  )
}

export default MainLayout