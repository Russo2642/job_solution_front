import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import RateReviewIcon from '@mui/icons-material/RateReview'
import LoginIcon from '@mui/icons-material/Login'
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Container,
    Divider,
    Drawer,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material'
import { styled } from '@mui/material/styles'
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../entities/auth/context/AuthContext'

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    color: theme.palette.text.primary,
}))

const LogoContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(3),
}))

const Logo = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    fontSize: '1.5rem',
    color: theme.palette.primary.main,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
}))

const UserAvatar = styled(Avatar)(({ theme }) => ({
    width: 36,
    height: 36,
    cursor: 'pointer',
    backgroundColor: theme.palette.primary.main,
}))

const DrawerContent = styled(Box)(({ theme }) => ({
    width: 250,
    padding: theme.spacing(2),
}))

const MobileNavItem = styled(Button)(({ theme }) => ({
    width: '100%',
    justifyContent: 'flex-start',
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(1),
    textAlign: 'left',
    textTransform: 'none',
    fontWeight: 500,
}))

interface NavItem {
    label: string;
    path: string;
    icon?: React.ReactNode;
}

const Header: React.FC = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    
    const isCompanyPage = location.pathname.startsWith('/company/')

    const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleUserMenuClose = () => {
        setAnchorEl(null)
    }

    const handleLogout = async () => {
        await logout()
        handleUserMenuClose()
    }

    const handleNavigate = (path: string) => {
        navigate(path)
        handleUserMenuClose()
        setDrawerOpen(false)
    }

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return
        }
        setDrawerOpen(open)
    }

    const navItems: NavItem[] = !user
        ? [
            { label: 'Войти', path: '/login', icon: <LoginIcon fontSize="small" /> },
        ]
        : [
            { label: 'Мой профиль', path: '/profile' },
            { label: 'Оставить отзыв', path: '/add-review' },
        ]

    return (
        <StyledAppBar position="sticky">
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 64 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {isMobile && (
                            <IconButton
                                color="inherit"
                                edge="start"
                                onClick={toggleDrawer(true)}
                                sx={{ mr: 1 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}

                        <LogoContainer>
                            <Link to="/" style={{ textDecoration: 'none' }}>
                                <Logo variant="h6">JobSolution</Logo>
                            </Link>
                        </LogoContainer>
                    </Box>

                    {!isMobile ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {!user ? (
                                <>
                                    {!isCompanyPage && (
                                        <Button
                                            component={Link as any}
                                            to="/add-review" 
                                            variant="outlined" 
                                            color="primary"
                                            sx={{ 
                                                marginLeft: 2, 
                                                textTransform: 'none', 
                                                fontWeight: 500, 
                                                fontSize: '0.95rem' 
                                            }}
                                            startIcon={<RateReviewIcon />}
                                        >
                                            Оставить отзыв
                                        </Button>
                                    )}
                                    <Button 
                                        component={Link as any}
                                        to="/login" 
                                        variant={isCompanyPage ? "outlined" : "contained"} 
                                        color="primary"
                                        sx={{ 
                                            marginLeft: 2, 
                                            textTransform: 'none', 
                                            fontWeight: 500, 
                                            fontSize: '0.95rem' 
                                        }}
                                        startIcon={<LoginIcon />}
                                    >
                                        Войти
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {!isCompanyPage && (
                                        <Button
                                            component={Link as any}
                                            to="/add-review"
                                            variant="contained"
                                            color="primary"
                                            sx={{ 
                                                marginLeft: 2,
                                                marginRight: 2,
                                                textTransform: 'none', 
                                                fontWeight: 500, 
                                                fontSize: '0.95rem' 
                                            }}
                                            startIcon={<RateReviewIcon />}
                                        >
                                            Оставить отзыв
                                        </Button>
                                    )}
                                    <UserAvatar onClick={handleUserMenuOpen}>
                                        {user.first_name?.[0]?.toUpperCase() || <AccountCircleIcon />}
                                    </UserAvatar>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleUserMenuClose}
                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                        keepMounted={false}
                                        disablePortal={true}
                                        aria-hidden={false}
                                    >
                                        <MenuItem onClick={() => handleNavigate('/profile')}>
                                            <ListItemIcon>
                                                <AccountCircleIcon fontSize="small" />
                                            </ListItemIcon>
                                            Мой профиль
                                        </MenuItem>
                                        <Divider />
                                        <MenuItem onClick={handleLogout}>
                                            <ListItemIcon>
                                                <LogoutIcon fontSize="small" />
                                            </ListItemIcon>
                                            Выйти
                                        </MenuItem>
                                    </Menu>
                                </>
                            )}
                        </Box>
                    ) : (
                        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                            <DrawerContent role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                                    JobSolution
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <MobileNavItem onClick={() => handleNavigate('/')} color="inherit">
                                    Главная
                                </MobileNavItem>
                                {navItems.map((item) => (
                                    <MobileNavItem
                                        key={item.path}
                                        onClick={() => handleNavigate(item.path)}
                                        color="inherit"
                                        startIcon={item.icon}
                                    >
                                        {item.label}
                                    </MobileNavItem>
                                ))}
                                {!user && (
                                    <MobileNavItem 
                                        onClick={() => handleNavigate('/add-review')} 
                                        color="inherit"
                                        startIcon={<RateReviewIcon fontSize="small" />}
                                    >
                                        Оставить отзыв
                                    </MobileNavItem>
                                )}
                                {user && (
                                    <MobileNavItem onClick={handleLogout} color="inherit" sx={{ color: 'error.main' }}>
                                        Выйти
                                    </MobileNavItem>
                                )}
                            </DrawerContent>
                        </Drawer>
                    )}
                </Toolbar>
            </Container>
        </StyledAppBar>
    )
}

export default Header