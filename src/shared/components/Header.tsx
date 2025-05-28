import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import RateReviewIcon from '@mui/icons-material/RateReview'
import LoginIcon from '@mui/icons-material/Login'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
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
    useTheme,
    Tooltip
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

const LoginIconButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.primary.main,
    transition: 'transform 0.3s, color 0.3s',
    '&:hover': {
        transform: 'scale(1.1)',
        color: theme.palette.primary.dark,
        backgroundColor: 'rgba(25, 118, 210, 0.04)',
    },
}))

const NavLink = styled(Link)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontWeight: 500,
    fontSize: '0.95rem',
    transition: 'color 0.3s',
    textDecoration: 'none',
    '&:hover': {
        color: theme.palette.primary.main,
    },
}))

const CenteredBox = styled(Box)(({ theme }) => ({
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(4),
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
            { label: 'Помогите нам стать лучше', path: '/suggestions', icon: <HelpOutlineIcon fontSize="small" /> },
        ]

    return (
        <StyledAppBar position="sticky">
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 64, position: 'relative' }}>
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

                    {!isMobile && (
                        <CenteredBox>
                            {!isCompanyPage && (
                                <>
                                    <NavLink to="/add-review">
                                        Оставить отзыв
                                    </NavLink>
                                    <NavLink to="/suggestions">
                                        Помогите нам стать лучше
                                    </NavLink>
                                </>
                            )}
                        </CenteredBox>
                    )}

                    {!isMobile ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {!user ? (
                                <Tooltip title="Войти">
                                    <IconButton
                                        component={Link}
                                        to="/login"
                                        aria-label="Войти"
                                        sx={{
                                            color: theme.palette.primary.main,
                                            transition: 'transform 0.3s, color 0.3s',
                                            '&:hover': {
                                                transform: 'scale(1.1)',
                                                color: theme.palette.primary.dark,
                                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                            },
                                        }}
                                    >
                                        <LoginIcon />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <>
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
                                        <MenuItem onClick={() => handleNavigate('/suggestions')}>
                                            <ListItemIcon>
                                                <HelpOutlineIcon fontSize="small" />
                                            </ListItemIcon>
                                            Помогите нам стать лучше
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
                                    <>
                                        <MobileNavItem 
                                            onClick={() => handleNavigate('/add-review')} 
                                            color="inherit"
                                            startIcon={<RateReviewIcon fontSize="small" />}
                                        >
                                            Оставить отзыв
                                        </MobileNavItem>
                                        <MobileNavItem 
                                            onClick={() => handleNavigate('/suggestions')} 
                                            color="inherit"
                                            startIcon={<HelpOutlineIcon fontSize="small" />}
                                        >
                                            Помогите нам стать лучше
                                        </MobileNavItem>
                                    </>
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