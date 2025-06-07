import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Tooltip,
  InputAdornment,
  IconButton,
} from '@mui/material';
import AppsIcon from '@mui/icons-material/Apps';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useAuthStore } from '../store/auth.store';
import { UserRole } from '../types/auth';

const Logo: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      mb: 5,
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

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Email aus dem Landing Page State übernehmen
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      const user = useAuthStore.getState().user;
      
      if (user) {
        // Redirect to dashboard after successful login
        const dashboardRoutes = {
          [UserRole.VERMIETER]: '/vermieter/dashboard',
          [UserRole.MIETER]: '/mieter/dashboard',
          [UserRole.HANDWERKER]: '/handwerker/dashboard',
        };

        navigate(dashboardRoutes[user.role], { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        position: 'relative',
      }}
    >
      {!isMobile && (
        <Box
          sx={{
            position: 'absolute',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255, 142, 83, 0.12) 0%, rgba(230, 126, 34, 0.12) 100%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
          }}
        />
      )}

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Logo />
          <Typography
            variant="h4"
            sx={{ 
              maxWidth: '480px',
              mx: 'auto',
              mb: 2,
              fontSize: { xs: '2.2rem', md: '2.5rem' },
              lineHeight: 1.2,
              color: '#2D3436',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Willkommen zurück
          </Typography>
          <Typography
            variant="h6"
            sx={{ 
              maxWidth: '520px',
              mx: 'auto',
              mb: 6,
              fontSize: '1.15rem',
              lineHeight: 1.6,
              color: 'rgba(0, 0, 0, 0.6)',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          >
            Melden Sie sich an, um Ihre Immobilien zu verwalten und mit Ihren Mietern zu kommunizieren.
          </Typography>
        </Box>

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
            mx: 'auto',
            boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
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
            Anmeldung
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }}
            >
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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Bitte gültige E-Mail eingeben">
                    <IconButton edge="end" tabIndex={-1} size="small">
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Mindestens 8 Zeichen">
                    <IconButton edge="end" tabIndex={-1} size="small">
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
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
          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Button component={Link} to="/forgot-password" size="small">
              Passwort vergessen?
            </Button>
          </Box>
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
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: '#fff' }} />
            ) : (
              'Anmelden'
            )}
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button 
              component={Link}
              to="/"
              size="small" 
              startIcon={<ArrowBackIcon />}
              sx={{ 
                color: 'rgba(0, 0, 0, 0.6)',
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  color: '#E67E22',
                }
              }}
            >
              Zurück zur Startseite
            </Button>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(0, 0, 0, 0.5)', 
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}
          >
            Noch kein Konto?{' '}
            <Button 
              component={Link}
              to="/register"
              size="small" 
              sx={{ 
                color: '#E67E22',
                textTransform: 'none',
                fontSize: '0.9rem',
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
              Jetzt registrieren
            </Button>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
