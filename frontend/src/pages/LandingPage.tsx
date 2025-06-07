import React, { useState } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Paper,
  Button,
  TextField,
  useMediaQuery,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import AppsIcon from '@mui/icons-material/Apps';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import BuildIcon from '@mui/icons-material/Build';
import DevicesIcon from '@mui/icons-material/Devices';
import { useAuthStore } from '../store/auth.store';
import { UserRole } from '../types/user';

const Logo: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      textDecoration: 'none',
      color: 'inherit',
    }}
    component={Link}
    to="/"
  >
    <Box
      sx={{
        width: 42,
        height: 42,
        background: 'linear-gradient(135deg, #FF8E53 0%, #E67E22 100%)',
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(230, 126, 34, 0.15)',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'scale(1.05)',
        },
        '& .MuiSvgIcon-root': {
          color: 'white',
          fontSize: '1.6rem',
        }
      }}
    >
      <AppsIcon />
    </Box>
    <Typography
      variant="h4"
      component="span"
      sx={{
        fontWeight: 700,
        fontSize: '2rem',
        background: 'linear-gradient(135deg, #FF8E53 0%, #E67E22 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.01em',
      }}
    >
      Immofox
    </Typography>
  </Box>
);

const LoginForm: React.FC<{ onSubmit: (email: string, password: string) => void }> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (email && password) {
      setIsLoading(true);
      onSubmit(email, password);
    } else {
      setError('Bitte E-Mail und Passwort eingeben');
    }
  };
  
  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={{
        p: 4.5,
        borderRadius: 3,
        background: '#fff',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 3.5, 
          color: '#2D3436',
          fontSize: '1.4rem',
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        Willkommen bei Immofox
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        fullWidth
        placeholder="E-Mail Adresse"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        variant="outlined"
        sx={{
          mb: 2.5,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            fontSize: '1rem',
            backgroundColor: '#F8FAFC',
            transition: 'all 0.2s ease',
            '& input': {
              padding: '16px',
            },
            '&:hover': {
              backgroundColor: '#F1F5F9',
            },
            '&.Mui-focused': {
              backgroundColor: '#fff',
              '& fieldset': {
                borderColor: '#E67E22',
                borderWidth: '2px',
              }
            }
          }
        }}
      />
      <TextField
        fullWidth
        placeholder="Passwort"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        variant="outlined"
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            fontSize: '1rem',
            backgroundColor: '#F8FAFC',
            transition: 'all 0.2s ease',
            '& input': {
              padding: '16px',
            },
            '&:hover': {
              backgroundColor: '#F1F5F9',
            },
            '&.Mui-focused': {
              backgroundColor: '#fff',
              '& fieldset': {
                borderColor: '#E67E22',
                borderWidth: '2px',
              }
            }
          }
        }}
      />
      <Button
        fullWidth
        type="submit"
        variant="contained"
        disabled={isLoading}
        sx={{
          py: 1.8,
          backgroundColor: '#E67E22',
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1.1rem',
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#D35400',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(230, 126, 34, 0.2)',
          },
          '&:active': {
            transform: 'translateY(0)',
          }
        }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Anmelden'}
      </Button>
      <Box sx={{ mt: 2.5, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.95rem' }}>
          Interesse an unserem Service?{' '}
          <Button 
            component={Link}
            to="/kontakt"
            size="small" 
            sx={{ 
              color: '#E67E22',
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
              p: 0,
              minWidth: 'auto',
              verticalAlign: 'baseline',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
              }
            }}
          >
            Kontaktieren Sie uns
          </Button>
        </Typography>
      </Box>
    </Paper>
  );
};

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({
  title,
  description,
  icon
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3.5,
        height: '100%',
        borderRadius: 3,
        background: '#fff',
        boxShadow: '0 2px 15px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
          transform: 'translateY(-5px)',
        },
      }}
    >
      <Box
        sx={{
          width: 50,
          height: 50,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2.5,
          background: 'linear-gradient(135deg, rgba(255, 142, 83, 0.08) 0%, rgba(230, 126, 34, 0.08) 100%)',
          color: '#E67E22',
          '& .MuiSvgIcon-root': {
            fontSize: '1.8rem',
          }
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontSize: '1.2rem',
          fontWeight: 600,
          mb: 1.5,
          color: '#2D3436',
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: 'rgba(0, 0, 0, 0.6)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
        }}
      >
        {description}
      </Typography>
    </Paper>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const { login, user, getCurrentRole } = useAuthStore();
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // Nach erfolgreichem Login zum jeweiligen Dashboard weiterleiten
      const role = getCurrentRole();
      switch (role) {
        case UserRole.VERMIETER:
          navigate('/vermieter/dashboard');
          break;
        case UserRole.MIETER:
          navigate('/mieter/dashboard');
          break;
        case UserRole.HANDWERKER:
          navigate('/handwerker/dashboard');
          break;
        default:
          navigate('/login');
      }
    } catch (error: any) {
      console.error('Login fehlgeschlagen:', error);
      setLoginError(error.response?.data?.message || 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.');
    }
  };

  const features = [
    {
      title: 'Immobilienverwaltung',
      description: 'Verwalten Sie Ihre Immobilien und Wohneinheiten effizient und übersichtlich.',
      icon: <DashboardCustomizeOutlinedIcon />
    },
    {
      title: 'Reparaturmanagement',
      description: 'Koordinieren Sie Reparaturen und Wartungsarbeiten schnell und professionell.',
      icon: <BuildIcon />
    },
    {
      title: 'Mieterkommunikation',
      description: 'Bleiben Sie mit Ihren Mietern in direktem Kontakt und reagieren Sie schnell auf Anfragen.',
      icon: <ChatOutlinedIcon />
    },
    {
      title: 'Sicherheit für Ihre Daten',
      description: 'Alle Ihre Daten werden mit modernsten Verschlüsselungsmethoden gesichert und sind nur für autorisierte Nutzer zugänglich.',
      icon: <SecurityOutlinedIcon />
    },
    {
      title: 'Automatisierte Abrechnungen',
      description: 'Erstellen Sie automatisiert Nebenkostenabrechnungen und senden Sie diese direkt an Ihre Mieter – mit nur wenigen Klicks.',
      icon: <ReceiptLongOutlinedIcon />
    },
    {
      title: 'Multi-Device Zugang',
      description: 'Zugriff von allen Geräten - perfekt optimiert für Desktop und Mobile, für unterwegs oder im Büro.',
      icon: <DevicesIcon />
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)'
    }}>
      {/* Header/Navbar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: 'transparent',
          boxShadow: 'none',
          py: 2
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', p: 0 }}>
            <Logo />
            <Box>
              <Button 
                component={Link}
                to="/login"
                variant="outlined"
                sx={{ 
                  borderColor: '#E67E22',
                  color: '#E67E22',
                  borderRadius: 2,
                  py: 1,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  mr: 2,
                  '&:hover': {
                    borderColor: '#D35400',
                    backgroundColor: 'rgba(230, 126, 34, 0.04)',
                  }
                }}
              >
                Anmelden
              </Button>

              <Button
                component={Link}
                to="/pricing"
                variant="contained"
                sx={{
                  backgroundColor: '#E67E22',
                  borderRadius: 2,
                  py: 1,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: 'none',
                  ml: 2,
                  '&:hover': {
                    backgroundColor: '#D35400',
                    boxShadow: '0 4px 12px rgba(230, 126, 34, 0.2)',
                  }
                }}
              >
                Preise
              </Button>
              <Button
                component={Link}
                to="/kontakt"
                variant="contained"
                sx={{
                  backgroundColor: '#E67E22',
                  borderRadius: 2,
                  py: 1,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#D35400',
                    boxShadow: '0 4px 12px rgba(230, 126, 34, 0.2)',
                  }
                }}
              >
                Kontakt
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section mit Login Form */}
      <Box 
        sx={{ 
          py: { xs: 6, md: 8 },
          position: 'relative'
        }}
      >
        {!isMobile && (
          <Box
            sx={{
              position: 'absolute',
              width: '700px',
              height: '700px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255, 142, 83, 0.08) 0%, rgba(230, 126, 34, 0.08) 100%)',
              top: '50%',
              right: '0',
              transform: 'translate(30%, -50%)',
              zIndex: 0,
            }}
          />
        )}
        
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box>
                <Typography
                  variant="h3"
                  sx={{ 
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                    mb: 3,
                    fontWeight: 800,
                    color: '#2D3436',
                    letterSpacing: '-0.03em',
                  }}
                >
                  Immobilienverwaltung <Box component="span" sx={{ color: '#E67E22' }}>einfach</Box> gemacht
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '1.15rem',
                    color: 'rgba(0, 0, 0, 0.6)',
                    mb: 4,
                    fontWeight: 400,
                    lineHeight: 1.7,
                    maxWidth: '90%',
                  }}
                >
                  Immofox vereinfacht die Verwaltung Ihrer Immobilien, die Kommunikation mit Mietern und die Organisation von Reparaturen. Alles an einem Ort, jederzeit und überall.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {!isMobile && (
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      width: '500px',
                      height: '500px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(255, 142, 83, 0.1) 0%, rgba(230, 126, 34, 0.1) 100%)',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 0,
                      filter: 'blur(40px)',
                    }}
                  />
                )}
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    maxWidth: 400,
                    mx: 'auto',
                  }}
                >
                  <LoginForm onSubmit={handleLogin} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#fff' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h4"
              sx={{ 
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                mb: 2.5,
                color: '#2D3436',
              }}
            >
              Alle Features für effiziente Immobilienverwaltung
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.15rem',
                color: 'rgba(0, 0, 0, 0.6)',
                fontWeight: 400,
                lineHeight: 1.7,
                maxWidth: 800,
                mx: 'auto'
              }}
            >
              Wir bieten Ihnen alle Werkzeuge, die Sie für eine professionelle Verwaltung Ihrer Immobilien benötigen
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((feature, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <FeatureCard
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 5, backgroundColor: '#2D3436', color: 'rgba(255, 255, 255, 0.8)' }}>
        <Container maxWidth="xl">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: '#E67E22',
                    borderRadius: 1.2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <AppsIcon sx={{ color: '#fff', fontSize: '1.4rem' }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                  Immofox
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'center' }, my: { xs: 2, md: 0 } }}>
              <Typography variant="body2">
                &copy; {new Date().getFullYear()} Immofox. Alle Rechte vorbehalten.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="body2" component={Link} to="/impressum" sx={{ color: 'inherit', textDecoration: 'none', mr: 3 }}>
                Impressum
              </Typography>
              <Typography variant="body2" component={Link} to="/datenschutz" sx={{ color: 'inherit', textDecoration: 'none' }}>
                Datenschutz
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};
